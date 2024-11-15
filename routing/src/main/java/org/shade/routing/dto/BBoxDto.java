package org.shade.routing.dto;

import com.graphhopper.shaded.Edge;
import java.util.List;


public record BBoxDto(BBoxLimits limits, List<Edge> edges) {

}