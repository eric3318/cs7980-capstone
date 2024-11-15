let response;

let params = {
  "fromLat": 49.23636,
  "fromLon": -123.00546,
  "toLat": 49.22353,
  "toLon": -122.97177,
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
    throw new Error("Error fetching shade data");
  }
  let shadeData = await response.json();
  console.log(Object.keys(shadeData.shadeProfile).length);

  let routeRequest = {
    "fromLat": 49.23185,
    "fromLon": -122.99422,
    "toLat": 49.22963,
    "toLon": -122.98647,
    "shadeData": shadeData.shadeProfile,
    shadePref: 0.3,
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

