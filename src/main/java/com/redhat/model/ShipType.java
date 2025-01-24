package com.redhat.model;

import org.infinispan.protostream.annotations.Proto;

@Proto
public enum ShipType {
   CARRIER,
   SUBMARINE,
   BATTLESHIP,
   DESTROYER
}
