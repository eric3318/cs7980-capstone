package org.shade.routing.service;


import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.ResponsePath;
import com.graphhopper.shaded.Edge;
import com.graphhopper.shaded.EdgeCache;
import com.graphhopper.shaded.ShadedGraphHopper;
import com.graphhopper.shaded.utils.GraphUtil;
import com.graphhopper.storage.Graph;
import com.graphhopper.storage.index.LocationIndex;
import com.graphhopper.storage.index.LocationIndex.Visitor;
import com.graphhopper.util.DistanceCalc;
import com.graphhopper.util.DistanceCalcEarth;
import com.graphhopper.util.EdgeIteratorState;
import com.graphhopper.util.FetchMode;
import com.graphhopper.util.Instruction;
import com.graphhopper.util.Parameters;
import com.graphhopper.util.Parameters.Details;
import com.graphhopper.util.PointList;
import com.graphhopper.util.details.PathDetail;
import com.graphhopper.util.shapes.BBox;
import com.graphhopper.util.shapes.GHPoint;
import java.awt.Point;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.shade.routing.dto.BBoxDto;
import org.shade.routing.dto.BBoxLimits;
import org.shade.routing.dto.RouteRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoutingService {

  private final GraphHopper hopper;

  public Map<String, List<?>> getRoute(RouteRequest routeRequest) {

    ((ShadedGraphHopper) hopper).attachShadeData(routeRequest.shadeData());
    ((ShadedGraphHopper) hopper).setShadePref(routeRequest.shadePref());

    GHRequest ghRequest = new GHRequest(routeRequest.fromLat(), routeRequest.fromLon(),
        routeRequest.toLat(), routeRequest.toLon());
    ghRequest.setProfile("shaded");
    ghRequest.setAlgorithm("astar");
    ghRequest.setPathDetails(Arrays.asList(Parameters.Details.EDGE_ID, Parameters.Details.WEIGHT));

    GHResponse ghResponse = hopper.route(ghRequest);

    ResponsePath bestPath = ghResponse.getBest();

    List<PathDetail> edgeIdDetails = bestPath.getPathDetails().get(Parameters.Details.EDGE_ID);
    List<PathDetail> weightDetails = bestPath.getPathDetails().get(Parameters.Details.WEIGHT);

    Map<String, List<?>> result = new HashMap<>();
    List<Double> shadeCoverage = edgeIdDetails.stream()
        .map(e -> ((ShadedGraphHopper) hopper).getEdgeShade((Integer) e.getValue())).toList();

    PointList pointList = bestPath.getPoints();
    List<Double[]> pathPoints = new ArrayList<>();
    for (GHPoint p : pointList) {
      pathPoints.add(p.toGeoJson());
    }

    result.put("pathPoints", pathPoints);
    result.put("shadeCoverage", shadeCoverage);

    ((ShadedGraphHopper) hopper).clearShadeData();
    return result;
  }

  public List<BBoxDto> getEdges(double fromLat, double fromLon, double toLat, double toLon) {
    LocationIndex locationIndex = hopper.getLocationIndex();
    double[] bounds = GraphUtil.getBBox(fromLat, fromLon, toLat, toLon);
    List<BBox> bBoxCells = GraphUtil.getBBoxCells(bounds[0], bounds[1], bounds[2],
        bounds[3]);
    Graph graph = hopper.getBaseGraph();
    EdgeCache edgeCache = ((ShadedGraphHopper) hopper).getEdgeCache();
    List<BBoxDto> result = new ArrayList<>();
    List<Edge> cell = new ArrayList<>();
    DistanceCalc calc = new DistanceCalcEarth();

    Visitor v = i -> {
      EdgeIteratorState edgeState = graph.getEdgeIteratorState(i, Integer.MIN_VALUE);
      int edgeId = edgeState.getEdge();

      if (edgeCache.contains(edgeId)) {
        cell.add(edgeCache.get(edgeId));
        return;
      }

      PointList geometry = edgeState.fetchWayGeometry(FetchMode.ALL);
      List<Double> points = new ArrayList<>();
      List<Double> segmentLengths = new ArrayList<>();

      for (int idx = 0; idx < geometry.size(); idx++) {
        GHPoint ghPoint = geometry.get(idx);
        points.add(ghPoint.getLon());
        points.add(ghPoint.getLat());
        if (idx > 0) {
          GHPoint prevPoint = geometry.get(idx - 1);
          double segmentLength = calc.calcDist(
              prevPoint.getLat(), prevPoint.getLon(),
              ghPoint.getLat(), ghPoint.getLon()
          );
          segmentLengths.add(segmentLength);
        }
      }

      Edge edge = new Edge(edgeId, segmentLengths, points);
      edgeCache.put(edgeId, edge);
      cell.add(edge);
    };

    for (BBox bBox : bBoxCells) {
      locationIndex.query(bBox, v);
      BBoxLimits bBoxLimits = new BBoxLimits(bBox.minLon, bBox.maxLon, bBox.minLat, bBox.maxLat);
      BBoxDto bBoxDto = new BBoxDto(bBoxLimits, List.copyOf(cell));
      result.add(bBoxDto);

      cell.clear();
    }
    return result;
  }
}
