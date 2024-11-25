package org.shade.routing.dto;

import java.util.List;
import java.util.Map;

public record RouteRequest(double fromLat, double fromLon, double toLat, double toLon,
                           double shadePref,
                           Map<Integer, List<List<Integer>>> shadeData) {

}
