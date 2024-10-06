const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

let browser;

async function initializeBrowser() {
  if (!browser) {
    browser = await puppeteer.launch(
        {headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  }
  return browser;
}

app.use(express.json());

app.post('/api/shade-profile', async (req, res) => {
  const {GeoJSON, dates} = req.body;

  try {
    const browser = await initializeBrowser();
    const page = await browser.newPage();

    await page.setContent(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ShadeMap Simulation</title>
      <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">
      <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
      <script
          src="https://unpkg.com/mapbox-gl-shadow-simulator/dist/mapbox-gl-shadow-simulator.umd.min.js"></script>
      <script src="https://unpkg.com/@turf/turf/turf.min.js"></script>
      <style>
        body {
          margin: 0;
          padding: 0;
        }
    
        html, body, #map {
          height: 100%;
        }
      </style>
    </head>
    <body>
    <div id="map"></div>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        const TILE_SIZE = 512;
        const BUILDING_ZOOM = 15;
    
        const lng2pixel = (lng, zoom) => {
          return ((lng + 180) / 360 * Math.pow(2, zoom)) * TILE_SIZE;
        }
    
        const geoJson = ${JSON.stringify(GeoJSON)}
        console.log(geoJson)
        const datess = ${JSON.stringify(dates)}.map(d => new Date(parseInt(d)));
        console.log(datess)
    
        const lat2pixel = (lat, zoom) => {
          return ((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180))
              / Math.PI) / 2 * Math.pow(2, zoom)) * TILE_SIZE
        }
    
        const unproject = (coords, zoom) => {
          const [lng, lat] = coords;
          return [lng2pixel(lng, zoom), lat2pixel(lat, zoom)];
        }
    
        const numPoints = 500;
        const busRoute = geoJson.geometry;
        if (busRoute.type !== 'LineString') {
          throw new Error('This example requires geometry of type LineString')
        }
        const length = turf.length(busRoute);
    
        const distanceBetweenPoints = length / numPoints;
        const pointLocations = [];
        for (let i = 0; i < numPoints; i++) {
          const pointGeoJSON = turf.along(busRoute, distanceBetweenPoints * i);
          pointLocations.push(pointGeoJSON.geometry.coordinates);
        }
        const viewportWidth = window.innerWidth * .8;
        const viewportHeight = window.innerHeight * .8;
    
        const screenGroups = [];
    
        while (pointLocations.length > 0) {
          const group = [pointLocations.shift()];
          let groupPixelWidth = 0;
          let groupPixelHeight = 0;
          while (pointLocations.length > 0 && groupPixelWidth < viewportWidth && groupPixelHeight
          < viewportHeight) {
            group.push(pointLocations.shift());
            const groupPoints = turf.lineString(group);
            const [minLng, minLat, maxLng, maxLat] = turf.bbox(groupPoints);
            const [minX, minY] = unproject([minLng, minLat], BUILDING_ZOOM);
            const [maxX, maxY] = unproject([maxLng, maxLat], BUILDING_ZOOM);
            groupPixelWidth = maxX - minX;
            groupPixelHeight = minY - maxY;
          }
          screenGroups.push(group);
        }
    console.log(screenGroups)
    
        mapboxgl.accessToken = "pk.eyJ1IjoiaGFubm5pZTIiLCJhIjoiY20xeDZ1OTR0MHJqaDJxcTF0dWdsNjQxaCJ9.g_kbtpQtag20otKxXyyltg";
        const map = new mapboxgl.Map({
          container: 'map',
          zoom: 15,
          center: screenGroups[0][0],
          style: 'mapbox://styles/mapbox/streets-v11',
          hash: true
        });
        const mapLoaded = (map) => {
          return new Promise((res, rej) => {
            function cb() {
              if (!map.loaded()) {
                return;
              }
              map.off("render", cb);
              res();
            }
    
            map.on("render", cb);
            cb();
          });
        };
    
    
        map.on('load', async () => {
          colors = ['red', 'green', 'blue'];
          screenGroups.forEach((group, index) => {
            const sourceId = \`source\${index}\`;
            const layerId =  \`layer\${index}\`;
            map.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: group
                  }
                }]
              }
            })
            map.addLayer({
              id: layerId,
              source: sourceId,
              type: 'line',
              'paint': {
                'line-color': colors[index % 3],
                'line-width': 3
              }
            })
          })
    
          const shadeMap = new ShadeMap({
            apiKey: "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im5pZS5oYW5Abm9ydGhlYXN0ZXJuLmVkdSIsImNyZWF0ZWQiOjE3MjgyMDQ1MDQwNzYsImlhdCI6MTcyODIwNDUwNH0.Zh6h2jLM2oobag_KgItfsw7E3fHUExziwpbjA80mGbY",
            date: new Date(),
            terrainSource: {
              maxZoom: 15,
              tileSize: 256,
              getSourceUrl: ({x, y, z}) => {
                return \`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/\${z}/\${x}/\${y}.png\`;
      },
          getElevation: ({r, g, b, a}) => {
            return (r * 256 + g + b / 256) - 32768;
          },
              _overzoom: 18
        },
        getFeatures: async () => {
      await mapLoaded(map);
      return map.querySourceFeatures('composite', {sourceLayer: 'building'}).filter(
          (feature) => {
            return feature.properties && feature.properties.underground !== "true"
                && (feature.properties.height || feature.properties.render_height)
          });
    },
    }).addTo(map);
    
    let accumulatedOutput = [];
    for (let i = 0; i < screenGroups.length; i++) {
      const group = screenGroups[i];
      const groupCenter = turf.center(turf.points(group));
    
      const shadeMapLoaded = new Promise((res) => {
        shadeMap.on('idle', res);
      });
    
      map.setCenter(groupCenter.geometry.coordinates).setZoom(BUILDING_ZOOM);
      const mapboxLoaded = mapLoaded(map);
    
      const locations = group.map(coord => ({lng: coord[0], lat: coord[1]}));
    
      await Promise.all([mapboxLoaded, shadeMapLoaded]);
    
      const output = shadeMap._generateShadeProfile({
        locations,
        dates:datess,
        sunColor: [255, 255, 255, 255],
        shadeColor: [0, 0, 0, 255]
      });
      accumulatedOutput.push(...Array.from(output));
    }
    window.shadeProfileOutput = accumulatedOutput;
    });
    })
    </script>
    </body>
    </html>
    `);

    const shadeProfile = await page.evaluate(() => {
      return new Promise((resolve) => {
        const checkShadeProfile = () => {
          if (window.shadeProfileOutput) {
            resolve(Array.from(window.shadeProfileOutput));
          } else {
            setTimeout(checkShadeProfile, 100);
          }
        };
        checkShadeProfile();
      });
    });

    await page.close();
    res.json({shadeProfile});
  } catch (error) {
    console.error('Error generating shade profile:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, async () => {
  await initializeBrowser();
  console.log(
      `ShadeMap API is running at http://localhost:${port}/api/shade-profile`);
});

process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
    process.exit();
  }
});