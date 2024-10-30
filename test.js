import {data} from "./data.js";
import * as turf from '@turf/turf';


const TILE_SIZE = 512;
const BUILDING_ZOOM = 15;

const numPoints = 100;
const boundingBoxes = data;

const groups = []

for (let i = 0; i < boundingBoxes.length; i++) {
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

// for (let i = 0; i < groups.length; i++) {
//   let group = groups[i]
//   const locations = group.flatMap(edge =>
//       edge.flatMap(subEdge =>
//           subEdge.map(point => ({lng: point[0], lat: point[1]}))
//       )
//   );
// }

document.addEventListener('DOMContentLoaded', async () => {
  const TILE_SIZE = 512;
  const BUILDING_ZOOM = 15;

  const geoJson = ${JSON.stringify(GeoJSON)}
  const dateArr = ${JSON.stringify(dates)}.map(d => new Date(parseInt(d)));

  const numPoints = 100;
  const boundingBoxes = ${JSON.stringify(data)}
  console.log(boundingBoxes);

  const groups = []

  for (let i = 0; i < boundingBoxes.length; i++) {
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
    center: {lng: groups[0][0][0][0][1], lat: groups[0][0][0][0][0]},
    style: 'mapbox://styles/mapbox/streets-v11',
    hash: true
  });

  map.on('load', async () => {
    const colors = ['red', 'green', 'blue'];

    const locations = groups[0].flatMap(edge =>
        edge.flatMap(subEdge =>
            subEdge.map(point => ({ lng: point[0], lat: point[1] }))
        )
    );

    const geoJsonPoints = {
      type: "FeatureCollection",
      features: locations.map((loc, index) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [loc.lng, loc.lat]
        },
        properties: {
          color: colors[index % colors.length]
        }
      }))
    };

    map.addSource('all-points', {
      type: 'geojson',
      data: geoJsonPoints
    });


    // map.addLayer({
    //   id: 'points-layer',
    //   type: 'circle',
    //   source: 'all-points',
    //   paint: {
    //     'circle-radius': 5,
    //     'circle-color': ['get', 'color']
    //   }
    // });
  });

  const mapLoaded = async(map) => {
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



  const shadeMap = new ShadeMap({
    apiKey: "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im5pZS5oYW5Abm9ydGhlYXN0ZXJuLmVkdSIsImNyZWF0ZWQiOjE3MjgyMDQ1MDQwNzYsImlhdCI6MTcyODIwNDUwNH0.Zh6h2jLM2oobag_KgItfsw7E3fHUExziwpbjA80mGbY",
    date: new Date(),
    terrainSource: {
      maxZoom: 15,
      tileSize: 256,
      getSourceUrl: ({x, y, z}) => {
        return "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/\${z}/\${x}/\${y}.png\";
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
    }).addTo(map)

    let accumulatedOutput = [];
    for (let i = 0; i < 1; i++) {
      const group = groups[i];
      const allPoints = group.flat().flat();
      const pointsGeoJSON = turf.points(allPoints);
      const center = turf.center(pointsGeoJSON);

      const shadeMapLoaded = new Promise((res) => {
        shadeMap.on('idle', res);
      });

      map.setCenter(center.geometry.coordinates).setZoom(BUILDING_ZOOM);
      const mapboxLoaded = mapLoaded(map);

      const locations = group.flatMap(edge =>
        edge.flatMap(subEdge =>
          subEdge.map(point => ({ lng: point[1], lat: point[0]}))
        )
      );

      await Promise.all([mapboxLoaded, shadeMapLoaded]);

      const output = shadeMap._generateShadeProfile({
        locations,
        dates:[1681498800000],
        sunColor: [255, 255, 255, 255],
        shadeColor: [0, 0, 0, 255]
      });
      accumulatedOutput.push(...Array.from(output));
      await new Promise(r => setTimeout(r, 5000));
    }
    window.shadeProfileOutput = accumulatedOutput;
    });





