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
        const response = await fetch(`api/shade`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ bBoxes: edgesData })
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

        // 将路径点和覆盖率结合，生成渲染所需的数据
        const edgesWithCoverage = Object.keys(edgeDetails).map((edgeId, index) => ({
            coordinates: [
                [pathCoordinates[index][1], pathCoordinates[index][0]], // 起点 (纬度, 经度)
                [pathCoordinates[index + 1]?.[1], pathCoordinates[index + 1]?.[0]] // 终点 (纬度, 经度)
            ],
            coverage: edgeDetails[edgeId].shadeCoverage
        }));

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
