let response;

let params = {
  "fromLat": 49.290884010747604,
  "fromLon": -123.13595061368675,
  "toLat": 49.279613235442426,
  "toLon": -123.13228753227474,
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
    body: JSON.stringify({
      timestamp: 1713168000000,
      bBoxes: edgesData})
  });
  if (!response.ok) {
    throw new Error("Error fetching shade data");
  }
  let shadeData = await response.json();
  console.log(Object.keys(shadeData.shadeProfile).length);

  let routeRequest = {
    "fromLat": 49.290884010747604,
    "fromLon": -123.13595061368675,
    "toLat": 49.279613235442426,
    "toLon": -123.13228753227474,
    "shadeData": shadeData.shadeProfile,
    shadePref: 0.6,
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

