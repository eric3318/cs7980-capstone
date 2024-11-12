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
    this.graphStatus = GraphStatus.getInstance();
  }

  @Override
  public double calcEdgeWeight(EdgeIteratorState edgeState, boolean reverse) {
    if (!graphStatus.getRouting())
      return edgeState.getDistance();
    if (!shadeManager.withinRange(edgeState)) {
      return edgeState.getDistance();
    }
    return getEdgeWeight(edgeState.getDistance(), shadeManager.getShadeCoverage(edgeState),0.5);
  }

  private double getEdgeWeight(double distance, double coverage, double shadePref) {
    return distance * ((1 - coverage) + shadePref * coverage);
  }

  @Override
  public String getName() {
    return name;
  }
}
