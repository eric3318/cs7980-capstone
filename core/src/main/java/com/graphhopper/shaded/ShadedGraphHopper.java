package com.graphhopper.shaded;

import com.graphhopper.GraphHopper;
import com.graphhopper.routing.WeightingFactory;
import java.util.List;
import java.util.Map;

public class ShadedGraphHopper extends GraphHopper {

  private final ShadeDataManager shadeManager;
  private final GraphStatus graphStatus;

  public ShadedGraphHopper() {
    this.shadeManager = new ShadeDataManager();
    this.graphStatus = new GraphStatus();
  }

  @Override
  protected WeightingFactory createWeightingFactory() {
    return new ShadeWeightingFactory(super.getBaseGraph(), super.getEncodingManager(),
        shadeManager);
  }

  @Override
  protected void cleanUp() {
    super.cleanUp();
    graphStatus.setCleanedUp();
  }

  public void attachShadeData(Map<Integer, List<List<Integer>>> samples, Map<Integer, List<Double>> segmentlengths) {
    shadeManager.addEdgeShadeProfiles(samples,segmentlengths);
  }

  public void clearShadeData() {
    shadeManager.clearData();
  }

}


