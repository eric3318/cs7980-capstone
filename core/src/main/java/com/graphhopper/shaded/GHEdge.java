package com.graphhopper.shaded;

import com.graphhopper.util.shapes.GHPoint;
import java.util.Objects;

public class GHEdge {
  private final GHPoint start;
  private final GHPoint end;

  public GHEdge(GHPoint startPoint, GHPoint endPoint){
    this.start = startPoint;
    this.end = endPoint;
  }

  public GHPoint getStart() {
    return start;
  }

  public GHPoint getEnd() {
    return end;
  }

  @Override
  public int hashCode() {
    return Objects.hash(start, end);
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj){
      return true;
    }
    if (!(obj instanceof GHEdge other)){
      return false;
    }
    return this.start.equals(other.getStart()) && this.end.equals(other.getEnd());
  }
}
