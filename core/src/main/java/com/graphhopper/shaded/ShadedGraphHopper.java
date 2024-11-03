package com.graphhopper.shaded;

import com.graphhopper.GraphHopper;
import com.graphhopper.routing.WeightingFactory;
import java.util.List;
import java.util.Map;

public class ShadedGraphHopper extends GraphHopper {
  private final ShadeDataManager shadeManager;

  public ShadedGraphHopper(){
    this.shadeManager = new ShadeDataManager();
  }

  @Override
  protected WeightingFactory createWeightingFactory() {
    return new ShadeWeightingFactory(super.getBaseGraph(), getEncodingManager(), shadeManager);
  }

  public void attachShadeData(Map<Integer, List<List<Integer>>> data){
    shadeManager.addEdgeShadeProfiles(data);
  }

}


