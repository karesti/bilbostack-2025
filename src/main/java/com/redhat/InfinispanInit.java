package com.redhat;

import com.redhat.model.GameStatus;
import com.redhat.model.PlayerScore;
import io.quarkus.infinispan.client.Remote;
import io.quarkus.runtime.StartupEvent;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.infinispan.client.hotrod.RemoteCache;
import org.infinispan.client.hotrod.RemoteCacheManager;
import org.infinispan.commons.configuration.StringConfiguration;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
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

   boolean init = false;
   Random random = new Random();

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

   void onStart(@Observes StartupEvent ev) throws IOException {
      // Create the LON cache programmatically
      String lonCache = new String(InfinispanInit.class.getClassLoader()
              .getResourceAsStream("scores.json").readAllBytes(), StandardCharsets.UTF_8);
      cacheManager.administration().getOrCreateCache(PlayerScore.PLAYERS_SCORES, new StringConfiguration(lonCache));

      // Create the NYC backup cache programmatically
      cacheManager.switchToCluster("nyc-site");
      String nycCacheBackups = new String(InfinispanInit.class.getClassLoader()
              .getResourceAsStream("scores_nyc.json").readAllBytes(), StandardCharsets.UTF_8);
      cacheManager.administration().getOrCreateCache(PlayerScore.PLAYERS_SCORES, new StringConfiguration(nycCacheBackups));
      cacheManager.switchToDefaultCluster();
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
      if(init) {
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
      } else {
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
   }
}
