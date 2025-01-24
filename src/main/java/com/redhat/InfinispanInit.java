package com.redhat;

import com.redhat.model.GameStatus;
import com.redhat.model.PlayerScore;
import com.redhat.model.Shot;
import io.quarkus.infinispan.client.Remote;
import io.quarkus.runtime.StartupEvent;
import io.quarkus.scheduler.Scheduled;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.infinispan.client.hotrod.RemoteCache;
import org.infinispan.client.hotrod.RemoteCacheManager;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@ApplicationScoped
public class InfinispanInit {

   public static final String GAME_ID = "1e1348c774d01c7c";
   @Inject
   RemoteCacheManager cacheManager;

   @ConfigProperty(name = "leaderboard.configure-infinispan", defaultValue = "false")
   Boolean configureInfinispan;
   boolean init = false;
   Random random = new Random();

   int[] scores = new int[]{0, 10, 10, 10, 20, 30, 50, 80, 130, 210};
   int[] bonus = new int[]{0, 20, 0, 30, 0, 0, 0, 0, 5, 10 };
   List<Player> randomPlayers = new ArrayList<>();
   List<String> randomNames = Arrays.asList(
           "michael", "tristan", "veronica", "kike", "ramon",
           "auri", "laura", "elaia", "oihana", "yago", "julia", "igor",
           "ela", "felix", "pekas", "solomo", "xala3pa", "diana", "jorge", "maria",
           "pepe", "charles", "antonio", "sebastian", "dan", "adrian", "will",
           "pedro", "ryan", "don", "gustavo", "alan", "wolf", "pavel", "diego",
           "vittorio", "dmitry", "shaaf", "gunnar", "emmanuel", "evan", "luke",
           "ian", "burr", "chary", "mari carmen", "josex`", "rita", "sky",
           "rocky", "marshall", "zuma", "ryder", "pepa", "georges", "lady bug", "cat noir");

   @Inject
   @Remote(PlayerScore.PLAYERS_SCORES)
   RemoteCache<String, PlayerScore> playerScores;

   @Inject
   @Remote("game")
   RemoteCache<String, String> game;

   @Inject
   @Remote(Shot.PLAYERS_SHOTS)
   RemoteCache<String, Shot> playerShots;

   void onStart(@Observes StartupEvent ev) {
      JsonObject json = new JsonObject();
      json.put("uuid", GAME_ID);
      json.put("date", "2021-04-08T17:38:35.421Z");
      json.put("state", "active");
      game.put("current-game", json.toString());

      for (int i = 0; i < 2; i ++) {
         for (String name: randomNames) {
            String matchId = UUID.randomUUID().toString();
            Player playerHuman = Player.create(name + "-" + i, matchId, true);
            Player playerAI = Player.create("ai-" + name + "-" + i, matchId, false);
            randomPlayers.add(playerHuman);
            randomPlayers.add(playerAI);
            playerScores.put(playerHuman.getPlayerScoreId(), playerHuman.toPlayerScore());
            playerScores.put(playerAI.getPlayerScoreId(), playerAI.toPlayerScore());
         }
      }
      init = true;
   }

   static class Player {
      String userId;
      String name;
      String matchId;
      String gameId;
      boolean human;

      public static Player create(String name, String matchId, boolean human) {
         Player player = new Player();
         player.gameId = GAME_ID;
         player.name = name;
         player.matchId = matchId;
         player.userId = UUID.randomUUID().toString();
         player.human = human;
         return player;
      }

      String getPlayerScoreId() {
         return gameId + "-" + matchId + "-" + userId;
      }

      PlayerScore toPlayerScore() {
         return new PlayerScore(userId, matchId, gameId, name, human, 0,
                     Instant.now().toEpochMilli(), GameStatus.PLAYING, 0);
      }
   }

   @Scheduled(every = "0.1s")
   public void createData() {
      if(configureInfinispan && init) {
         int i = random.nextInt(randomPlayers.size());

         Player player = randomPlayers.get(i);
         PlayerScore actualPlayerScore = playerScores.get(player.getPlayerScoreId());
         PlayerScore newPlayerScore = new PlayerScore(actualPlayerScore.userId(),
                 actualPlayerScore.matchId(),
                 actualPlayerScore.gameId(), actualPlayerScore.username(), actualPlayerScore.human(),
                 actualPlayerScore.score() + bonus[random.nextInt(bonus.length)],
                 actualPlayerScore.timestamp(),
                 actualPlayerScore.gameStatus(),
                 actualPlayerScore.bonus() + bonus[random.nextInt(bonus.length)]);
         playerScores.put(player.getPlayerScoreId(), newPlayerScore);
      }
   }
}
