package org.infinispan.api.websockets;

import io.quarkus.infinispan.client.Remote;
import io.quarkus.logging.Log;
import io.quarkus.scheduler.Scheduled;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import org.infinispan.client.hotrod.RemoteCache;
import org.infinispan.client.hotrod.RemoteCacheManager;
import org.infinispan.commons.api.query.Query;
import org.infinispan.model.PlayerScore;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/leaderboard")
@ApplicationScoped
public class LeaderboardEndpoint {
   private Map<String, Session> sessions = new ConcurrentHashMap<>();

   @Inject
   RemoteCacheManager remoteCacheManager;

   @Inject
   @Remote(PlayerScore.PLAYERS_SCORES)
   RemoteCache<String, PlayerScore> playersScores;

   Query<PlayerScore> topTenQuery;

   @OnOpen
   public void onOpen(Session session) {
      sessions.put(session.getId(), session);
      Log.info("Leaderboard service socket opened");
      broadcast();
   }

   @OnClose
   public void onClose(Session session) {
      sessions.remove(session.getId());
      Log.info("Leaderboard Service session has been closed");
   }

   @OnError
   public void onError(Session session, Throwable throwable) {
      sessions.remove(session.getId());
      Log.error("Leaderboard Service session error", throwable);
   }

   @Scheduled(every = "{leaderboard.schedule}")
   public void broadcast() {
      if(sessions.isEmpty()) {
         return;
      }

      if(!remoteCacheManager.getCacheNames().contains(PlayerScore.PLAYERS_SCORES)) {
         Log.warn(String.format("%s cache does not exit yet", PlayerScore.PLAYERS_SCORES));
         return;
      }

      if(topTenQuery == null ) {
         topTenQuery = playersScores
//                 select p.username, p.score from org.infinispan.PlayerScore p WHERE p.human=true ORDER BY p.score DESC, p.timestamp ASC
                 .<PlayerScore>query("from org.infinispan.PlayerScore p WHERE p.human=true ORDER BY p.score DESC, p.timestamp ASC")
                 .maxResults(10);
      }

      List<PlayerScore> topTen = topTenQuery.execute().list();
      String topTenJson = transformToJsonString(topTen);

      sessions.values().forEach(s -> s.getAsyncRemote().sendObject(topTenJson, result -> {
         if (result.getException() != null) {
            Log.error("Leaderboard service got interrupted", result.getException());
         }
      }));
   }

   private String transformToJsonString(List<PlayerScore> topTen) {
      List<String> topTenJson = new ArrayList<>();
      for(PlayerScore p : topTen) {
         JsonObject object = new JsonObject();
         object.put("userId", p.userId());
         object.put("matchId", p.matchId());
         object.put("gameId", p.gameId());
         object.put("human", p.human());
         object.put("userName", p.username());
         object.put("score", p.score());
         object.put("timestamp", p.timestamp());
         object.put("gameStatus", p.gameStatus());
         topTenJson.add(object.toString());
      }
      return topTenJson.toString();
   }
}
