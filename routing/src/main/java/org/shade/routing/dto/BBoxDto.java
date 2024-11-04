package org.shade.routing.dto;

import java.util.List;

public record BBoxDto(BBoxLimits limits, List<List<Double>> edges) {

}
