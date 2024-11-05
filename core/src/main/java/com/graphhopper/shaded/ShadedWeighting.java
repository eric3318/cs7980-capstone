package com.graphhopper.shaded;

import com.graphhopper.routing.weighting.AbstractAdjustedWeighting;
import com.graphhopper.routing.weighting.Weighting;
import com.graphhopper.util.EdgeIteratorState;

public class ShadedWeighting extends AbstractAdjustedWeighting {

  private final ShadeDataManager shadeManager;
  private static final String name = "shaded";

  public ShadedWeighting(Weighting superWeighting, ShadeDataManager shadeDataManager) {
    super(superWeighting);
    this.shadeManager = shadeDataManager;
  }

  @Override
  public double calcEdgeWeight(EdgeIteratorState edgeState, boolean reverse) {
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
