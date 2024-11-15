package com.graphhopper.shaded;

import java.util.List;

public record Edge(int edgeId, List<Double> segmentLengths, List<Double> points) {

}
