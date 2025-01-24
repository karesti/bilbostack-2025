package com.redhat.model;

import org.infinispan.protostream.annotations.Proto;

@Proto
public record PlayerScore(String userId,
                          String matchId,
                          String gameId,
                          String username,
                          Boolean human,
                          Integer score,
                          Long timestamp,
                          GameStatus gameStatus,
                          Integer bonus) implements Comparable {

   public static final String PLAYERS_SCORES = "players-scores";

   @Override
   public int compareTo(Object o) {
      PlayerScore cp = (PlayerScore)o;
      if(score() == cp.score()) {
         if (this.timestamp() == 0 || cp.timestamp() == 0) {
            return 0;
         }
         return this.timestamp().compareTo(cp.timestamp());
      }
      return this.score().compareTo(cp.score());
   }
}
