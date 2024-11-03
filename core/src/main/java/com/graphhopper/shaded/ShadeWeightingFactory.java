package com.graphhopper.shaded;

import com.graphhopper.config.Profile;
import com.graphhopper.routing.DefaultWeightingFactory;
import com.graphhopper.routing.util.EncodingManager;
import com.graphhopper.routing.weighting.Weighting;
import com.graphhopper.storage.BaseGraph;
import com.graphhopper.util.PMap;

public class ShadeWeightingFactory extends DefaultWeightingFactory {
  private final ShadeDataManager shadeManager;

  public ShadeWeightingFactory(BaseGraph graph,
      EncodingManager encodingManager, ShadeDataManager shadeDataManager) {
    super(graph, encodingManager);
    this.shadeManager = shadeDataManager;
  }

  @Override
  public Weighting createWeighting(Profile profile, PMap hints, boolean disableTurnCosts) {
    if ("shaded".equalsIgnoreCase(profile.getName())){
      throw new IllegalArgumentException("Only shaded profile is supported");
    }
    // TODO: determine accessEnc and speedEnc
    ShortestWeighting shortestWeighting = new ShortestWeighting();
    return new ShadedWeighting( shortestWeighting, shadeManager);
  }
}
