package com.graphhopper.shaded;

import com.graphhopper.routing.weighting.AbstractAdjustedWeighting;
import com.graphhopper.routing.weighting.Weighting;
import com.graphhopper.util.EdgeIteratorState;
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
    if (graphStatus.getRouting()) {
      if (shadeManager.withinRange(edgeState)) {
        return getEdgeWeight(superWeighting.calcEdgeWeight(edgeState, reverse),
            shadeManager.getShadeCoverage(edgeState));
      }
      // this may need to be changed to positive infinity to exclude edges out of range from routes
      return superWeighting.calcEdgeWeight(edgeState, reverse);
    }
    return superWeighting.calcEdgeWeight(edgeState, reverse);
  }

  private double getEdgeWeight(double distanceWeight, double coverage) {
    return distanceWeight * ((1 - coverage) + shadePref * coverage);
  }

  @Override
  public String getName() {
    return name;
  }
}
