package com.redhat.model;

import org.infinispan.protostream.annotations.Proto;

@Proto
public enum GameStatus {
   PLAYING,
   WIN,
   LOSS
}
