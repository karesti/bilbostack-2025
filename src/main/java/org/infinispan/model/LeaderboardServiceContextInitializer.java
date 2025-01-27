package org.infinispan.model;

import org.infinispan.protostream.GeneratedSchema;
import org.infinispan.protostream.annotations.ProtoSchema;

@ProtoSchema(schemaPackageName = "org.infinispan",
      includeClasses = { PlayerScore.class, GameStatus.class})
public interface LeaderboardServiceContextInitializer extends GeneratedSchema {
}
