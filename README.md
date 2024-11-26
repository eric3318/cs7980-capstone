# The Shadiest Path
This project aims to fill the gap in shade-based routing
by dynamically integrating shade data into the pathfinding process.
It is capable of guiding the route between two points based on user's preference for running under shade,
at any location in the province of British Columbia in Canada, at any time. 
The <a href="https://shademap.app/about">ShadeMap API</a> 
is used for shade data fetching and a customized version of 
<a href="https://github.com/graphhopper/graphhopper">GraphHopper</a> 
that takes shade coverage into consideration is used for routing.

### Contributors
***Jiageng Bao*** <br>
***Han Nie*** <br>
***Jingzi Wang*** <br>
***Zhao Liu***

## Get Started

### Prerequisites
- Java 17+
- Node.js

#### 1. Clone the Repository
```bash
git clone git@github.com:eric3318/the-shadiest-path.git
```

#### 2. Start Shade Data Server
```bash
cd /the-shadiest-path/shade-data-server
npm install
node index.js
```
#### 3. Start Routing Server
```
open /the-shadiest-path/routing-server with Intellij IDEA
in Maven plugin, toggle "Skip Tests" mode, 
in GraphHopper Parent Project - lifecycle, clean & install,
in routing - lifecycle, clean & install
```
in routing-server/src/main<br>
download <a href="https://download.geofabrik.de/north-america/canada/british-columbia-latest.osm.pbf">OSM for British Columbia</a> 
into /resources/static <br>
run /java/org.shade.routing/RoutingApplication.java

#### 4. Start Web Interface
```bash
cd /the-shadiest-path/web
npm install
npm start
```

### Usage
Navigate to http://localhost:3000 in browser. You can choose origin and destination
by clicking on the map, and select your preference for shade. Press "Generate" button 
to generate a route and "Reset" for a new trip.




