package com.graphhopper.shaded;

import com.graphhopper.config.Profile;
import com.graphhopper.routing.DefaultWeightingFactory;
import com.graphhopper.routing.ev.BooleanEncodedValue;
import com.graphhopper.routing.util.EncodingManager;
import com.graphhopper.routing.weighting.Weighting;
import com.graphhopper.storage.BaseGraph;
import com.graphhopper.util.PMap;

public class ShadeWeightingFactory extends DefaultWeightingFactory {
  private final ShadeDataManager shadeManager;
  private final EncodingManager encodingManager;

  public ShadeWeightingFactory(BaseGraph graph,
      EncodingManager encodingManager, ShadeDataManager shadeDataManager) {
    super(graph, encodingManager);
    this.shadeManager = shadeDataManager;
    this.encodingManager = encodingManager;
  }

  @Override
  public Weighting createWeighting(Profile profile, PMap hints, boolean disableTurnCosts) {
    if ("shaded".equalsIgnoreCase(profile.getName())){
      throw new IllegalArgumentException("Only shaded profile is supported");
    }
    ShortestWeighting shortestWeighting = new ShortestWeighting(
        encodingManager.getBooleanEncodedValue("access"), encodingManager.getDecimalEncodedValue("speed"));
    return new ShadedWeighting( shortestWeighting, shadeManager);
  }
}
