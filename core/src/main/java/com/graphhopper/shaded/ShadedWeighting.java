package com.graphhopper.shaded;

import com.graphhopper.routing.weighting.AbstractAdjustedWeighting;
import com.graphhopper.routing.weighting.Weighting;
import com.graphhopper.util.EdgeIteratorState;
import lombok.Getter;
import lombok.Setter;

public class ShadedWeighting extends AbstractAdjustedWeighting {

  private final ShadeDataManager shadeManager;
  private static final String name = "shaded";
  private final GraphStatus graphStatus;

  @Setter
  private static double shadePref = 0;

  public ShadedWeighting(Weighting superWeighting, ShadeDataManager shadeDataManager) {
    super(superWeighting);
    this.shadeManager = shadeDataManager;
    this.graphStatus = GraphStatus.getInstance();
  }

  @Override
  public double calcEdgeWeight(EdgeIteratorState edgeState, boolean reverse) {
    if (!graphStatus.getRouting()) {
      return superWeighting.calcEdgeWeight(edgeState, reverse);
    }
    if (!shadeManager.withinRange(edgeState)) {
      return Double.POSITIVE_INFINITY;
/*
      return edgeState.getDistance();
*/
    }
    return getEdgeWeight(superWeighting.calcEdgeWeight(edgeState, reverse),
        shadeManager.getShadeCoverage(edgeState));
  }

  private double getEdgeWeight(double distanceWeight, double coverage) {
    return distanceWeight * ((1 - coverage) + shadePref * coverage);
  }

  @Override
  public String getName() {
    return name;
  }
}
