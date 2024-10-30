import express from 'express';
import puppeteer from 'puppeteer';
import {data} from './data.js';

const app = express();
const port = 3000;

let browser;

async function initializeBrowser() {
  if (!browser) {
    browser = await puppeteer.launch(
        {
          headless: false,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          defaultViewport: null
        });
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
    
        const geoJson = ${JSON.stringify(GeoJSON)}
        const dateArr = ${JSON.stringify(dates)}.map(d => new Date(parseInt(d)));
    
        const numPoints = 10;
        const boundingBoxes = ${JSON.stringify(data)}
        
        const groups = []
        
        for (let i = 0; i < 1; i++) {
          let edges = boundingBoxes[i]
          const group = []
          edges.forEach(edge => {
            const temp = []
            let prev = edge.slice(0, 2)
            let idx = 2
            while (idx < edge.length - 1) {
              let curr = edge.slice(idx, idx + 2);
              let route = turf.lineString([prev, curr]);
              let length = turf.length(route)
              let step = length / numPoints;
              let points = []
              for (let j = 0; j < numPoints; j++) {
                let point = turf.along(route, step * j)
                points.push(point.geometry.coordinates)
              }
              temp.push(points)
              prev = curr
              idx += 2;
            }
            group.push(temp)
          });
          groups.push(group)
        }

    
        mapboxgl.accessToken = "pk.eyJ1IjoiaGFubm5pZTIiLCJhIjoiY20xeDZ1OTR0MHJqaDJxcTF0dWdsNjQxaCJ9.g_kbtpQtag20otKxXyyltg";
        const map = new mapboxgl.Map({
          container: 'map',
          zoom: 15,
          center: {lng: -122.980325, lat: 49.24353},
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
       
          map.on('load', async() => {
          
         
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
                _overzoom: 18,
            },
            getFeatures: async () => {
                await mapLoaded(map)
                const buildingData = map.querySourceFeatures('composite', { sourceLayer: 'building' }).filter((feature) => {
                    return feature.properties && feature.properties.underground !== "true" && (feature.properties.height || feature.properties.render_height)
                });
                return buildingData;
            },
          }).addTo(map);
    
          let accumulatedOutput = [];
          for (let i = 0; i < 1; i++) {
            const group = groups[i];
            const minLon = -122.98701;
            const maxLon = -122.97363999999999;
            const minLat = 49.24033;
            const maxLat = 49.24673;
            
            const bbox = [minLon, minLat, maxLon, maxLat];
            
            const bboxPolygon = turf.bboxPolygon(bbox);
            
            const center = turf.center(bboxPolygon);
          
            const shadeMapLoaded = new Promise((res) => {
              shadeMap.on('idle', res);
            });
          
            map.setCenter(center.geometry.coordinates).setZoom(BUILDING_ZOOM);
            console.log(center.geometry.coordinates)
            const mapboxLoaded = mapLoaded(map);
            console.log(group)
          
            const locations = group.flatMap(subEdge => 
                subEdge.map(point => ({ lng: point[0], lat: point[1]}))
              )
            
            await Promise.all([mapboxLoaded, shadeMapLoaded]);
          
            const output = shadeMap._generateShadeProfile({
              locations,
              dates:[new Date(1681455600000)],
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

    // await page.close();
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