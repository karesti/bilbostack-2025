package com.redhat.model;

import org.infinispan.api.annotations.indexing.Basic;
import org.infinispan.api.annotations.indexing.Indexed;
import org.infinispan.protostream.annotations.Proto;

@Proto
@Indexed
public record Shot(@Basic String userId,
                   @Basic String matchId,
                   @Basic String gameId,
                   @Basic Boolean human,
                   @Basic Long timestamp,
                   @Basic ShotType shotType,
                   @Basic ShipType shipType
                   ) {
   public static final String PLAYERS_SHOTS = "players-shots";
}
