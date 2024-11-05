package com.graphhopper.shaded;

public class GraphStatus {

  private static boolean cleanedUp = false;

  public boolean getCleanedUp() {
    return cleanedUp;
  }

  public void setCleanedUp() {
    cleanedUp = true;
  }
}
