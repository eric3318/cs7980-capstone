package com.graphhopper.shaded.utils;

import com.graphhopper.util.shapes.BBox;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GraphUtil {

  private static final int TILE_SIZE = 512;
  private static final int BUILDING_ZOOM = 15;
  public static final int VIEWPORT_WIDTH_PX = 256;
  public static final int VIEWPORT_HEIGHT_PX = 256;

  public static double longitudeToPixel(double lng) {
    return ((lng + 180.0) / 360.0 * Math.pow(2.0, BUILDING_ZOOM)) * TILE_SIZE;
  }

  public static double latitudeToPixel(double lat) {
    double latRad = Math.toRadians(lat);
    double mercatorY = Math.log(Math.tan(latRad) + 1.0 / Math.cos(latRad));
    return ((1.0 - (mercatorY / Math.PI)) / 2.0 * Math.pow(2.0, BUILDING_ZOOM)) * TILE_SIZE;
  }

  public static double[] getBBox(double fromLat, double fromLon, double toLat, double toLon) {
    double minLat = Math.min(fromLat, toLat);
    double maxLat = Math.max(fromLat, toLat);
    double minLon = Math.min(fromLon, toLon);
    double maxLon = Math.max(fromLon, toLon);
    return new double[]{minLon, maxLon, minLat, maxLat};
  }

  public static List<BBox> getBBoxCells(double minLon, double maxLon, double minLat,
      double maxLat) {
    List<BBox> cells = new ArrayList<>();

    double left = longitudeToPixel(minLon);
    double right = longitudeToPixel(maxLon);
    double top = latitudeToPixel(maxLat);
    double bottom = latitudeToPixel(minLat);

    double horizontalPixelSpan = right - left;
    int numberOfCols = (int) Math.ceil(horizontalPixelSpan / VIEWPORT_WIDTH_PX);

    double verticalPixelSpan = bottom - top;
    int numberOfRows = (int) Math.ceil(verticalPixelSpan / VIEWPORT_HEIGHT_PX);

    double deltaLon = (maxLon - minLon) / numberOfCols;
    double deltaLat = (maxLat - minLat) / numberOfRows;

    for (int row = 0; row < numberOfRows; row++) {
      double cellMinLat = minLat + (row * deltaLat);
      double cellMaxLat = cellMinLat + deltaLat;

      for (int col = 0; col < numberOfCols; col++) {
        double cellMinLon = minLon + (col * deltaLon);
        double cellMaxLon = cellMinLon + deltaLon;

        if (col == numberOfCols - 1) {
          cellMaxLon = maxLon;
        }
        if (row == numberOfRows - 1) {
          cellMaxLat = maxLat;
        }

        BBox cell = new BBox(cellMinLon, cellMaxLon, cellMinLat, cellMaxLat);
        cells.add(cell);
      }
    }
    return cells;
  }

}
