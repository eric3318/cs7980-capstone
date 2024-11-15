package com.graphhopper.shaded;

import com.graphhopper.GraphHopper;
import com.graphhopper.routing.WeightingFactory;
import java.util.List;
import java.util.Map;

public class ShadedGraphHopper extends GraphHopper {

  private final ShadeDataManager shadeManager;
  private final GraphStatus graphStatus;
  private final EdgeCache edgeCache;

  public ShadedGraphHopper() {
    this.shadeManager = new ShadeDataManager();
    this.graphStatus = GraphStatus.getInstance();
    this.edgeCache = new EdgeCache();
  }

  @Override
  protected WeightingFactory createWeightingFactory() {
    return new ShadeWeightingFactory(super.getBaseGraph(), super.getEncodingManager(),
        shadeManager);
  }

  @Override
  protected void cleanUp() {
    super.cleanUp();
    graphStatus.setRouting(true);
  }

  public void attachShadeData(Map<Integer, List<List<Integer>>> shadeData) {
    shadeManager.generateEdgeShadeProfiles(shadeData);
  }

  public EdgeCache getEdgeCache() {
    return edgeCache;
  }

  public void clearShadeData() {
    shadeManager.clearData();
  }

  public void setShadePref(double shadePref) {
    ShadedWeighting.setShadePref(shadePref);
  }

}


