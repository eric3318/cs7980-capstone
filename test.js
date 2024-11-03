import {data} from "./data.js";
import * as turf from '@turf/turf';

const TILE_SIZE = 512;
const BUILDING_ZOOM = 15;

const numPoints = 10;
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








