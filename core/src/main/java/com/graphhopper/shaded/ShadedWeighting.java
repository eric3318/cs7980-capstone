package com.graphhopper.shaded;

import com.graphhopper.routing.weighting.AbstractAdjustedWeighting;
import com.graphhopper.routing.weighting.Weighting;
import com.graphhopper.util.EdgeIteratorState;

public class ShadedWeighting extends AbstractAdjustedWeighting {

  private final ShadeDataManager shadeManager;
  private static final String name = "shaded";
  private final GraphStatus graphStatus;

  public ShadedWeighting(Weighting superWeighting, ShadeDataManager shadeDataManager) {
    super(superWeighting);
    this.shadeManager = shadeDataManager;
    this.graphStatus = new GraphStatus();
  }

  @Override
  public double calcEdgeWeight(EdgeIteratorState edgeState, boolean reverse) {
    if (!graphStatus.getCleanedUp()) {
      return superWeighting.calcEdgeWeight(edgeState, reverse);
    }
    if (!shadeManager.withinRange(edgeState)) {
      return Double.POSITIVE_INFINITY;
    }
    double distanceWeight = superWeighting.calcEdgeWeight(edgeState, reverse);
    // use formula
    return distanceWeight;
  }

  @Override
  public String getName() {
    return name;
  }
}
