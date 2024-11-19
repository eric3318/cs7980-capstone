package com.graphhopper.shaded;

import com.graphhopper.routing.querygraph.VirtualEdgeIterator;
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
      // todo: identify virtual edges that's within range as well and calculate the shade coverage for those
      if (!(edgeState instanceof VirtualEdgeIterator)) {
        if (shadeManager.withinRange(edgeState)) {
          return getEdgeWeight(superWeighting.calcEdgeWeight(edgeState, reverse),
              shadeManager.getShadeCoverage(edgeState));
        }
        return Double.POSITIVE_INFINITY;
      }
      return superWeighting.calcEdgeWeight(edgeState, reverse);
    }
    return superWeighting.calcEdgeWeight(edgeState, reverse);
  }

  private double getEdgeWeight(double distanceWeight, double coverage) {
    return distanceWeight * (1 - coverage * shadePref);
  }

  // shadePref = 1
  // edge a
  // distance 20 coverage 0.4  (shaded 8)
  // 20 * 0.4 = 8

  // edge b
  // distance 10 coverage 0.7 (shaded 7)
  // 10 * 0.7 = 7


  @Override
  public String getName() {
    return name;
  }
}
