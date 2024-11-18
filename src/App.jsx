import React, { useState } from 'react';
import CitySelect from './components/CitySelect.jsx';
import TimeSelect from './components/TimeSelect.jsx';
import PreferenceSlider from './components/PreferenceSlider.jsx';
import SpeedControl from './components/SpeedControl.jsx';
import MapComponent from './components/MapComponent.jsx';
import LoadingIndicator from './components/LoadingIndicator.jsx';

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

    // 生成路径
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
            const jsonData = JSON.stringify(routeResponse, null, 2);
           
 
            // 假设返回数据中包含路线坐标
            const route = routeResponse.path; // 使用返回的坐标数组作为路线
            setRouteCoordinates(route); // 更新路线坐标
            console.log(routeResponse.edgeDetails);
            //const travelTimeSeconds = distance / speed;
            //const startTime = new Date(time);
            //const calculatedEndTime = new Date(startTime.getTime() + travelTimeSeconds * 1000);
            const distance1 = Object.values(routeResponse.edgeDetails).reduce(
                (sum, edge) => sum + edge.distance,
                0
              ); 
              setDistance(distance1); // 更新状态
              /*   
            const pacificEndTime = calculatedEndTime.toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            setEndTime(pacificEndTime);
            */
        } catch (error) {
            console.error("Error generating route:", error);
        }finally {
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
        <div>
            <h1>Shadiest Path Finder</h1>

            <CitySelect city={city} setCity={handleCityChange} />

            <MapComponent
                initialCenter={initialCenter}
                startPoint={startPoint}
                endPoint={endPoint}
                setStartPoint={setStartPoint}
                setEndPoint={setEndPoint}
                routeCoordinates={routeCoordinates} // 传递路线坐标
            />

            <TimeSelect time={time} setTime={setTime} />
            <PreferenceSlider preference={preference} setPreference={setPreference} />
            {/*<SpeedControl speed={speed} setSpeed={setSpeed} />*/}

            {/* 使用加载指示器 */}
            {loading && <LoadingIndicator />}


            {/* <button onClick={handleGenerateRoute}>Generate Route</button>*/}
            <button onClick={handleGenerateRoute} disabled={loading}>
                            Generate Route
                        </button>
            <button onClick={handleRefresh}>Reset</button>
   

            {/*endTime && (
                <div>
                    <h2>Journey End Time</h2>
                    <p>Estimated Arrival: {endTime}</p>
                </div>
            )*/}
            <div>
                {distance !== null && (
                <div>
                <h2>Total Distance</h2>
                <p>Calculated Distance: {distance.toFixed(2)} meters</p>
                </div>
                )}
            </div>
        </div>
    );
}

export default App;
