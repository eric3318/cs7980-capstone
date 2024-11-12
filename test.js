let response;

let params = {
  minLon: -123.20701,
  maxLon: -123.10027,
  minLat: 49.23,
  maxLat: 49.27
}
let queryString = "?"

for (let key in params) {
  let val = params[key]
  queryString += `${key}=${val}&`;
}

try {
  response = await fetch(`http://localhost:8081/api/edges${queryString}`);
  if (!response.ok) {
    throw new Error("Error fetching graph edges from routing service");
  }
  let edgesData = await response.json();

  response = await fetch(`http://localhost:3000/api/shade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({bBoxes: edgesData})
  });
  if (!response.ok) {
    throw new Error("Error fetching graph edges from routing service");
  }
  let shadeData = await response.json();

  let routeRequest = {
    "fromLat": 49.2596302,
    "fromLon": -123.1489612,
    "toLat": 49.2536009,
    "toLon": -123.0937825,
    "shadeData": shadeData.shadeProfile
  }

  response = await fetch("http://localhost:8081/api/route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(routeRequest)
  })
  if (!response.ok) {
    throw new Error("Error generating a route");
  }
  let routeResponse = await response.json();
  console.log(routeResponse);
} catch (err) {
  console.log(err);
}

