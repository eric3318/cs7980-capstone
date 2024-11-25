package org.shade.routing.dto;

import java.util.List;
import java.util.Map;

public record RouteResponse(List<Double[]> path, List<EdgeDetail> edgeDetails, double totalWeight,
                            double totalDistance) {
  
}
