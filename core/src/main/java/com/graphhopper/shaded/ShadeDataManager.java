package com.graphhopper.shaded;

import com.graphhopper.util.EdgeIteratorState;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class ShadeDataManager {
  Logger logger = LoggerFactory.getLogger(ShadeDataManager.class);

  private final Map<Integer, List<EdgeShadeProfile>> shadeMap = new HashMap<>();

  public double calcShadeCoverage(EdgeIteratorState edge) {
    int edgeId = edge.getEdge();
    if (!shadeMap.containsKey(edgeId) || shadeMap.get(edgeId).isEmpty()) {
      throw new RuntimeException("Shade profile for the given edge not found");
    }
    List<EdgeShadeProfile> edgeShadeProfiles = shadeMap.get(edgeId);
    // add coverage calculation
    return 0;
  }

  public void addEdgeShadeProfiles (Map<Integer, List<List<Integer>>> data) {
    for (Entry<Integer, List<List<Integer>>> entry : data.entrySet()){
      Integer edgeId = entry.getKey();
      if (shadeMap.containsKey(edgeId)){
        logger.info("Duplicate shade data exists for edgeID {}", edgeId);
        continue;
      }
      List<List<Integer>> rgbaLists = entry.getValue();
      List<EdgeShadeProfile> edgeShadeProfiles = shadeMap.computeIfAbsent(edgeId, k -> new ArrayList<>());

      for (List<Integer> rgbaList : rgbaLists){
        EdgeShadeProfile edgeShadeProfile = new EdgeShadeProfile();
        edgeShadeProfile.addPoints(rgbaList);
        edgeShadeProfiles.add(edgeShadeProfile);
      }
    }
  }

  public void clearData(){
    shadeMap.clear();
  }
}
