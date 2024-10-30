package org.shade.routing.utils;

import com.graphhopper.util.shapes.BBox;
import java.util.ArrayList;
import java.util.List;

public class MapUtil {

  private static final int TILE_SIZE = 512;
  private static final int BUILDING_ZOOM = 15;
  public static final int VIEWPORT_WIDTH_PX = 1024;
  public static final int VIEWPORT_HEIGHT_PX = 768;

  public static double longitudeToPixel(double lng) {
    return ((lng + 180.0) / 360.0 * Math.pow(2.0, BUILDING_ZOOM)) * TILE_SIZE;
  }

  public static double latitudeToPixel(double lat) {
    double latRad = Math.toRadians(lat);
    double mercatorY = Math.log(Math.tan(latRad) + 1.0 / Math.cos(latRad));
    return ((1.0 - (mercatorY / Math.PI)) / 2.0 * Math.pow(2.0, BUILDING_ZOOM)) * TILE_SIZE;
  }

  public static List<BBox> getBBoxCells(double minLon, double maxLon, double minLat,
      double maxLat) {
    List<BBox> cells = new ArrayList<>();

    double left = longitudeToPixel(minLon);
    double right = longitudeToPixel(maxLon);

    double horizontalPixelSpan = right - left;
    System.out.println(horizontalPixelSpan);

    int numberOfCols = (int) Math.ceil(horizontalPixelSpan / VIEWPORT_WIDTH_PX);

    double top = latitudeToPixel(maxLat);
    double bottom = latitudeToPixel(minLat);
    double verticalPixelSpan = bottom - top;
    System.out.println(verticalPixelSpan);
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
