package org.shade.routing.service;


import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.ResponsePath;
import com.graphhopper.config.Profile;
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
import org.locationtech.jts.geom.Envelope;
import org.shade.routing.dto.BBoxDto;
import org.shade.routing.dto.BBoxLimits;
import org.shade.routing.dto.EdgeDetail;
import org.shade.routing.dto.RouteRequest;
import org.shade.routing.dto.RouteResponse;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoutingService {

  private final GraphHopper hopper;

  public RouteResponse getRoute(RouteRequest routeRequest) {

    ((ShadedGraphHopper) hopper).attachShadeData(routeRequest.shadeData());
    ((ShadedGraphHopper) hopper).setShadePref(routeRequest.shadePref());

    GHRequest ghRequest = buildGHRequest(routeRequest.fromLat(), routeRequest.fromLon(),
        routeRequest.toLat(), routeRequest.toLon(), "shaded", "astar");

    ghRequest.setPathDetails(Arrays.asList(Parameters.Details.EDGE_ID, Details.DISTANCE));

    GHResponse ghResponse = hopper.route(ghRequest);

    ResponsePath bestPath = ghResponse.getBest();

    List<PathDetail> edgeIdDetails = bestPath.getPathDetails().get(Parameters.Details.EDGE_ID);
    List<PathDetail> distanceDetails = bestPath.getPathDetails().get(Details.DISTANCE);
    PointList pointList = bestPath.getPoints();

    Map<Integer, EdgeDetail> edgeDetails = new HashMap<>();

    for (int i = 0; i < edgeIdDetails.size(); i++) {
      Integer edgeId = (Integer) edgeIdDetails.get(i).getValue();
      double distance = (double) distanceDetails.get(i).getValue();
      double shadeCoverage = ((ShadedGraphHopper) hopper).getEdgeShade(edgeId);
      edgeDetails.put(edgeId, new EdgeDetail(shadeCoverage, distance));
    }

    List<Double[]> pathPoints = new ArrayList<>();
    pointList.forEach(p -> pathPoints.add(p.toGeoJson()));
    RouteResponse response = new RouteResponse(pathPoints, edgeDetails);

    ((ShadedGraphHopper) hopper).clearShadeData();
    return response;
  }

  private ResponsePath doPreliminaryPathfinding(GHRequest ghRequest) {
    GHResponse ghResponse = hopper.route(ghRequest);
    return ghResponse.getBest();
  }

  private GHRequest buildGHRequest(double fromLat, double fromLon, double toLat, double toLon,
      String profileName, String algorithm) {
    GHRequest ghRequest = new GHRequest(fromLat, fromLon, toLat, toLon);
    ghRequest.setProfile(profileName);
    ghRequest.setAlgorithm(algorithm);
    return ghRequest;
  }

  public List<BBoxDto> getEdges(double fromLat, double fromLon, double toLat, double toLon) {
    GHRequest prelimRequest = buildGHRequest(fromLat, fromLon, toLat, toLon, "preliminary",
        "astar");
    ResponsePath prelimPath = doPreliminaryPathfinding(prelimRequest);
    Envelope prelimBBox = prelimPath.calcBBox2D();

    double minLat, maxLat, minLon, maxLon;
    minLon = prelimBBox.getMinX();
    maxLon = prelimBBox.getMaxX();
    minLat = prelimBBox.getMinY();
    maxLat = prelimBBox.getMaxY();

    LocationIndex locationIndex = hopper.getLocationIndex();
    // enlarge the bounding box by 20%
    double[] bounds = GraphUtil.getBBox(minLon, maxLon, minLat, maxLat, 0.2);
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
