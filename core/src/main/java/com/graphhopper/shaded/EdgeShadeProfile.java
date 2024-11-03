package com.graphhopper.shaded;

import java.util.ArrayList;
import java.util.List;

public class EdgeShadeProfile {
  private final List<Boolean> samplings = new ArrayList<>();
  private static final int[] SHADE_COLOR = new int[]{255,255,255,255};

  public void addPoints(List<Integer> rgbaList){
    int size = rgbaList.size();
    if (size < 1){
      throw new RuntimeException("No points added for the edge");
    }
    int i = 0;
    while (i < size){
      int start = i;
      i += 4;
      boolean isShade = true;
      for (int j = 0; start + j < i; j++){
        if (rgbaList.get(start + j) != SHADE_COLOR[j]){
          isShade = false;
          break;
        }
      }
      samplings.add(isShade);
    }
  }

  public double getShadeCoverage(){
    int shadeCount = 0;
    for (Boolean isShade: samplings){
      if (isShade){
        shadeCount ++;
      }
    }
    return ((double) shadeCount /samplings.size()) * 100;
  }
}
