package com.redhat.model;

import org.infinispan.protostream.GeneratedSchema;
import org.infinispan.protostream.annotations.ProtoSchema;

@ProtoSchema(schemaPackageName = "com.redhat",
      includeClasses = { PlayerScore.class, Shot.class, ShotType.class, ShipType.class, GameStatus.class})
public interface LeaderboardServiceContextInitializer extends GeneratedSchema {
}
