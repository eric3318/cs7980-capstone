package com.graphhopper.shaded;

import com.graphhopper.config.Profile;
import com.graphhopper.routing.DefaultWeightingFactory;
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
    if (!"shaded".equalsIgnoreCase(profile.getName()) && !"preliminary".equalsIgnoreCase(
        profile.getName())) {
      throw new IllegalArgumentException("Profile name must be either shaded or preliminary");
    }

    ShortestWeighting shortestWeighting = new ShortestWeighting(
        encodingManager.getBooleanEncodedValue("car_access"),
        encodingManager.getDecimalEncodedValue("car_average_speed"));

    if ("preliminary".equals(profile.getName())) {
      return shortestWeighting;
    }
    return new ShadedWeighting(shortestWeighting, shadeManager);
  }
}
