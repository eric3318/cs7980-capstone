package com.graphhopper.shaded;

public class GraphStatus {

  private boolean routing = false;
  private static GraphStatus instance;
  private GraphStatus(){}

  public static GraphStatus getInstance() {
    if (instance == null)
      instance = new GraphStatus();
    return instance;
  }
  public boolean getRouting() {
    return routing;
  }
  public void setRouting(boolean routing) {
    this.routing = routing;
  }
}
