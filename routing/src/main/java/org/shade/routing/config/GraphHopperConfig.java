package org.shade.routing.config;

import com.graphhopper.GraphHopper;
import com.graphhopper.config.Profile;
import com.graphhopper.routing.util.EdgeFilter;
import com.graphhopper.storage.index.LocationIndexTree;
import com.graphhopper.util.GHUtility;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GraphHopperConfig {

  @Bean
  public GraphHopper graphHopper() {
    GraphHopper graphHopper = new GraphHopper();
    graphHopper.setOSMFile("routing/src/main/resources/static/british-columbia-latest.osm.pbf");
    graphHopper.setGraphHopperLocation("routing/target/graph-cache");
    graphHopper.setEncodedValuesString("car_access, car_average_speed");
    graphHopper.setProfiles(
        new Profile("car").setCustomModel(GHUtility.loadCustomModelFromJar("car.json")));
    graphHopper.importOrLoad();
    return graphHopper;
  }

}
