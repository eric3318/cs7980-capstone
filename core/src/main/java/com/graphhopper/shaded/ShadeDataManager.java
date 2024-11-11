package com.graphhopper.shaded;

import com.graphhopper.util.EdgeIteratorState;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ShadeDataManager {
  Logger logger = LoggerFactory.getLogger(ShadeDataManager.class);

  private final Map<Integer, List<EdgeShadeProfile>> shadeMap = new HashMap<>();
  private final Map<Integer, Double> shadeCoverageMap = new HashMap<>();
  private final Map<Integer, List<Double>> segmentLengths = new HashMap<>();

  public double getShadeCoverage(EdgeIteratorState edgeState) {
    int edgeId = edgeState.getEdge();
    if (shadeCoverageMap.containsKey(edgeId))
      return shadeCoverageMap.get(edgeId);
    if (!shadeMap.containsKey(edgeId) || shadeMap.get(edgeId).isEmpty()) {
      throw new RuntimeException("Shade profile for the given edge not found");
    }
    List<EdgeShadeProfile> edgeShadeProfiles = shadeMap.get(edgeId);
    List<Double> segmentLength = segmentLengths.get(edgeId);
      // add coverage calculation
    double shadedDistance = 0;
    double totalDistance = 0;
    for (int i=0; i<edgeShadeProfiles.size(); i++){
      EdgeShadeProfile profile = edgeShadeProfiles.get(i);
      double length = segmentLength.get(i);
      shadedDistance += profile.getShadeCoverage() * length;
      totalDistance += length;
    }
    if (Math.abs(totalDistance) < 0.00002)
      shadeCoverageMap.put(edgeId,1.);
    else
      shadeCoverageMap.put(edgeId, shadedDistance / totalDistance);
    return shadeCoverageMap.get(edgeId);
  }

  public boolean withinRange(EdgeIteratorState edgeState){
    return shadeMap.containsKey(edgeState.getEdge());
  }

  public void addEdgeShadeProfiles (Map<Integer, List<List<Integer>>> samples, Map<Integer, List<Double>> segmentLengths) {
    for (Entry<Integer, List<List<Integer>>> entry : samples.entrySet()){
      Integer edgeId = entry.getKey();
      if (shadeMap.containsKey(edgeId)){
        logger.info("Duplicate shade data exists for edgeID {}", edgeId);
        continue;
      }
      List<List<Integer>> rgbaLists = entry.getValue();
      List<EdgeShadeProfile> edgeShadeProfiles = shadeMap.computeIfAbsent(edgeId, k -> new ArrayList<>());
      this.segmentLengths.computeIfAbsent(edgeId,value -> segmentLengths.get(edgeId));
      for (List<Integer> rgbaList : rgbaLists){

        EdgeShadeProfile edgeShadeProfile = new EdgeShadeProfile();
        edgeShadeProfile.addPoints(rgbaList);
        edgeShadeProfiles.add(edgeShadeProfile);
      }
    }
  }

  public void clearData(){
    shadeMap.clear();
    shadeCoverageMap.clear();
    segmentLengths.clear();
  }
}
