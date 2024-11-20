import React, { useState } from 'react';
import CitySelect from './components/CitySelect.jsx';
import TimeSelect from './components/TimeSelect.jsx';
import PreferenceSlider from './components/PreferenceSlider.jsx';
import SpeedControl from './components/SpeedControl.jsx';
import MapComponent from './components/MapComponent.jsx';
import LoadingIndicator from './components/LoadingIndicator.jsx';
import './index.css';

function App() {
    const [loading, setLoading] = useState(false);
    const defaultCityCoordinates = { lat: 49.2827, lng: -123.1207 }; // Vancouver's coordinates
    const defaultTime = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const pacificDate = new Date(defaultTime);

    const pacificISOString = new Date(pacificDate.getTime() - pacificDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    const defaultPreference = 0.5;
    const defaultSpeed = 2.5;
    const [distance, setDistance] = useState(null);

    const [initialCenter, setInitialCenter] = useState(defaultCityCoordinates);
    const [city, setCity] = useState('vancouver');
    const [time, setTime] = useState(pacificISOString);
    const [preference, setPreference] = useState(defaultPreference);
    const [speed, setSpeed] = useState(defaultSpeed);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]); // 存储路线坐标

    const handleCityChange = (newCity) => {
        setCity(newCity);
        if (newCity === 'vancouver') {
            setInitialCenter({ lat: 49.2827, lng: -123.1207 });
        } else if (newCity === 'toronto') {
            setInitialCenter({ lat: 43.65107, lng: -79.347015 });
        }
    };

    // 获取edges数据
    const fetchEdges = async (params) => {
         
        const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join("&");
        const response = await fetch(`/api/edges?${queryString}`);
    
        if (!response.ok) throw new Error("Error fetching edges");
        return await response.json();
    };

    // 获取阴影数据
    const fetchShadowData = async (edgesData) => {
        const timestamp = new Date(time).getTime(); // Convert the selected time to unix timestamp in milliseconds
        const response = await fetch(`api/shade`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                        bBoxes: edgesData,
                        timestamp: timestamp // Include the timestamp in the request body
                    })
        });
        if (!response.ok) throw new Error("Error fetching shadow data");
        return await response.json();
    };

    // 计算路径
    const calculateRoute = async (shadeProfile) => {
        const routeRequest = {
            fromLat: startPoint.lat,
            fromLon: startPoint.lng,
            toLat: endPoint.lat,
            toLon: endPoint.lng,
            shadeData: shadeProfile,
            shadePref: preference,
        };

        const response = await fetch("/api/route", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(routeRequest)
        });
        if (!response.ok) throw new Error("Error generating route");
        return await response.json();
    };


const handleGenerateRoute = async () => {
    if (!startPoint || !endPoint) {
        alert('Please select both a starting point and an endpoint');
        return;
    }
    setLoading(true); // 开始加载

    try {
        // Step 1: 获取边缘数据
        const edgesParams = {
            fromLat: startPoint.lat,
            fromLon: startPoint.lng,
            toLat: endPoint.lat,
            toLon: endPoint.lng,
        };
        const edgesData = await fetchEdges(edgesParams);

        // Step 2: 获取阴影数据
        const shadeData = await fetchShadowData(edgesData);

        // Step 3: 计算路径
        const routeResponse = await calculateRoute(shadeData.shadeProfile);

        // 解析路径数据
        const edgeDetails = routeResponse.edgeDetails; // 每条路径段的覆盖率信息
        const pathCoordinates = routeResponse.path;
//         console.log("edgeDetails length:", edgeDetails.length);
//         console.log("pathCoordinates length:", pathCoordinates.length);
//         console.log(edgeDetails);
//         console.log("pathCoordinates",pathCoordinates);


//////////////////////////////
// const edgesWithCoverage = edgeDetails.map((edge) => {
//   const coordinates = edge.points.reduce((acc, _, i, arr) => {
//     if (i % 2 === 0 && i + 1 < arr.length) {
//       // 每两个点组成一个经纬度坐标对
//       acc.push([arr[i + 1], arr[i]]); // 纬度, 经度
//     }
//     return acc;
//   }, []);
//   return {
//     coordinates, // 生成的路径坐标数组
//     coverage: edge.shadeCoverage, // 覆盖率
//   };
// });
// 获取 path 的起点和终点
////////////////////////////////
//     const pathStart = routeResponse.path[0];
//     const pathEnd = routeResponse.path[routeResponse.path.length - 1];
//     console.log('Path End:', pathEnd);
//     // 替换 edgeDetails 第一段的起点和最后一段的终点
//         const updatedEdgeDetails = routeResponse.edgeDetails.map((edge, index, array) => {
//           const updatedEdge = { ...edge };
//
//           if (index === 0) {
//                   // 替换第一段的起点，确保与第二段的起点一致
//                   const nextEdgeFirstPoint = array[1].points.slice(0, 2); // 第二段的第一个点
//                   if (isWithinRange(pathStart, nextEdgeFirstPoint)) {
//                     updatedEdge.points[0] = pathStart[0]; // 经度
//                     updatedEdge.points[1] = pathStart[1]; // 纬度
//                   }
//                 }
//
//                 if (index === array.length - 1) {
//                   const len = updatedEdge.points.length;
//
//                   // 遍历 points，找到 pathEnd 位于的范围并截断
//                   for (let i = 0; i < len - 2; i += 2) {
//                     const lon1 = updatedEdge.points[i];       // 当前点的经度 (a)
//                     const lat1 = updatedEdge.points[i + 1];   // 当前点的纬度 (a)
//                     const lon2 = updatedEdge.points[i + 2];   // 下一个点的经度 (c)
//                     const lat2 = updatedEdge.points[i + 3];   // 下一个点的纬度 (c)
//
//                      // 判断 pathEnd 是否在 (a, c) 的矩形范围内
//                      if (isWithinRectangle(lon1, lat1, lon2, lat2, pathEnd)) {
//                        // 截断到 pathEnd
//                        updatedEdge.points = updatedEdge.points.slice(0, i + 2).concat([pathEnd[0], pathEnd[1]]);
//                        break;
//                      }
//                    }
//
//                   // 确保终点为 pathEnd
//                   const lastLon = updatedEdge.points[updatedEdge.points.length - 2];
//                   const lastLat = updatedEdge.points[updatedEdge.points.length - 1];
//                   if (lastLon !== pathEnd[0] || lastLat !== pathEnd[1]) {
//                     updatedEdge.points = updatedEdge.points.concat([pathEnd[0], pathEnd[1]]);
//                   }
//                 }
//
//
//           return updatedEdge;
//         });
//     // 更新 routeCoordinates
//         const edgesWithCoverage = updatedEdgeDetails.map((edge) => {
//               const coordinates = [];
//               for (let i = 0; i < edge.points.length; i += 2) {
//                 coordinates.push([edge.points[i + 1], edge.points[i]]); // [纬度, 经度]
//               }
//               return {
//                 coordinates, // 全部点组成的路径
//                 coverage: edge.shadeCoverage,
//               };
//             });
////////////////

        const edgesWithCoverage = edgeDetails.map((edge, index, array) => {
            // 将 points 转换为 [纬度, 经度] 的二维数组
            const coordinates = [];
            for (let i = 0; i < edge.points.length; i += 2) {
                coordinates.push([edge.points[i + 1], edge.points[i]]); // 转换为 [纬度, 经度]
            }

            // 获取当前 edge 坐标数量
            const n = coordinates.length;

            // 处理第一个 edge
            if (index === 0) {
                //const startP = [startPoint.lat, startPoint.lng]
                const modifiedCoordinates = pathCoordinates.slice(0,n).map(([lat, lon]) => [lon, lat]);
                return {
                    coordinates:modifiedCoordinates, // 替换为 path 的前 n 个坐标
                    coverage: edge.shadeCoverage
                };
            }

            // 处理最后一个 edge
            if (index === array.length - 1) {
                console.log(startPoint)
                //const endP = [endPoint.lat,endPoint.lng]
                const modifiedCoordinates = pathCoordinates.slice(-n).map(([lat, lon]) => [lon, lat]);
                return {
                    coordinates: modifiedCoordinates, // 替换为 path 的后 n 个坐标
                    coverage: edge.shadeCoverage
                };
            }

            // 中间的 edge 不变
            return {
                coordinates,
                coverage: edge.shadeCoverage
            };
        });
// console.log('edgesWithCoverage',edgesWithCoverage);
// console.log('StartPoint:', startPoint);
// console.log('EndPoint:', endPoint);

/////////////////////

        // 更新状态
        setRouteCoordinates(edgesWithCoverage);

        // 更新距离
        const totalDistance = Object.values(edgeDetails).reduce(
            (sum, edge) => sum + edge.distance,
            0
        );
        setDistance(totalDistance); // 更新距离

    } catch (error) {
        console.error("Error generating route:", error);
    } finally {
        setLoading(false); // 请求完成，结束加载
    }
};




    const handleRefresh = () => {
        setTime(pacificISOString);
        setPreference(defaultPreference);
        setSpeed(defaultSpeed);
        setStartPoint(null);
        setEndPoint(null);
        setEndTime(null);
        setDistance(null)
        setRouteCoordinates([]); // 清空路线
        setLoading(false); // 重置 loading 状态
    };

    return (
            <div className="container">
                <h1>Shadiest Path Finder</h1>

                {/* 城市选择 */}
                <div style={{ marginBottom: '15px' }}>
                    <CitySelect city={city} setCity={handleCityChange} />
                </div>

                {/* 地图组件 */}
{/*                 <div style={{ marginBottom: '20px' }}> */}
                    <MapComponent
                        initialCenter={initialCenter}
                        startPoint={startPoint}
                        endPoint={endPoint}
                        setStartPoint={setStartPoint}
                        setEndPoint={setEndPoint}
                        routeCoordinates={routeCoordinates}
                    />


                {/* 时间选择和偏好滑块 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ flex: 1, marginRight: '10px' }}>
                        <TimeSelect time={time} setTime={setTime} />
                    </div>
                    <div style={{ flex: 1, marginLeft: '10px' }}>
                        <PreferenceSlider preference={preference} setPreference={setPreference} />
                    </div>
                </div>

                {/* 按钮区域 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                    <button onClick={handleGenerateRoute} disabled={loading}>
                        Generate Route
                    </button>
                    <button onClick={handleRefresh}>Reset</button>
                </div>

                {/* 加载指示器 */}
                {loading && (
                    <div style={{ marginBottom: '20px' }}>
                        <LoadingIndicator />
                    </div>
                )}

                {/* 距离显示 */}
                {distance !== null && (
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h2>Total Distance</h2>
                        <p>{distance.toFixed(2)} meters</p>
                    </div>
                )}
            </div>
        );
    }


export default App;