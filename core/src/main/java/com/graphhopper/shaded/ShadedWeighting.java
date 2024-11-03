package com.graphhopper.shaded;

import com.graphhopper.routing.weighting.AbstractAdjustedWeighting;
import com.graphhopper.routing.weighting.Weighting;
import com.graphhopper.util.EdgeIteratorState;

public class ShadedWeighting extends AbstractAdjustedWeighting {
  private ShadeDataManager shadeManager;

  public ShadedWeighting(Weighting superWeighting) {
    super(superWeighting);
  }

  @Override
  public double calcEdgeWeight(EdgeIteratorState edgeState, boolean reverse) {
    return 0;
  }

  @Override
  public String getName() {
    return "";
  }
}
