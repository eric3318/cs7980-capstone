package org.shade.routing.service;


import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.shaded.ShadedGraphHopper;
import com.graphhopper.shaded.utils.GraphUtil;
import com.graphhopper.storage.Graph;
import com.graphhopper.storage.index.LocationIndex;
import com.graphhopper.storage.index.LocationIndex.Visitor;
import com.graphhopper.util.EdgeIteratorState;
import com.graphhopper.util.FetchMode;
import com.graphhopper.util.PointList;
import com.graphhopper.util.shapes.BBox;
import com.graphhopper.util.shapes.GHPoint;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.shade.routing.dto.BBoxDto;
import org.shade.routing.dto.BBoxLimits;
import org.shade.routing.dto.RouteRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoutingService {

  private final GraphHopper hopper;

  public GHResponse getRoute(RouteRequest routeRequest) {
    ((ShadedGraphHopper) hopper).attachShadeData(routeRequest.shadeData());
    GHRequest ghRequest = new GHRequest(routeRequest.fromLat(), routeRequest.fromLon(),
        routeRequest.toLat(), routeRequest.toLon());
    return hopper.route(ghRequest);
  }

  public List<BBoxDto> getEdges(double minLon, double maxLon, double minLat,
      double maxLat) {
    LocationIndex locationIndex = hopper.getLocationIndex();
    List<BBox> bBoxList = GraphUtil.getBBoxCells(minLon, maxLon, minLat, maxLat);
    Graph graph = hopper.getBaseGraph();
    List<BBoxDto> result = new ArrayList<>();
    List<List<Double>> cell = new ArrayList<>();

    Visitor v = i -> {
      EdgeIteratorState iteratorState = graph.getEdgeIteratorState(i, Integer.MIN_VALUE);
      PointList geometry = iteratorState.fetchWayGeometry(FetchMode.ALL);
      List<Double> edge = new ArrayList<>();

      for (int idx = 0; idx < geometry.size(); idx++) {
        GHPoint ghPoint = geometry.get(idx);
        edge.add(ghPoint.getLon());
        edge.add(ghPoint.getLat());
      }

      cell.add(edge);
    };

    for (BBox bBox : bBoxList) {
      locationIndex.query(bBox, v);
      BBoxLimits bBoxLimits = new BBoxLimits(bBox.minLon, bBox.maxLon, bBox.minLat, bBox.maxLat);
      BBoxDto bBoxDto = new BBoxDto(bBoxLimits, List.copyOf(cell));
      result.add(bBoxDto);
      cell.clear();
    }
    return result;
  }
}
