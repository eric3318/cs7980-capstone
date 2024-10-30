package org.shade.routing.dto;

import java.util.List;

public record BoundingBoxDto(BBoxDto boundingBox, List<List<Double>> edges) {

}
