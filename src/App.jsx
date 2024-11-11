import React, { useState } from 'react';
import CitySelect from './components/CitySelect.jsx';
import TimeSelect from './components/TimeSelect.jsx';
import PreferenceSlider from './components/PreferenceSlider.jsx';
import SpeedControl from './components/SpeedControl.jsx';
import MapComponent from './components/MapComponent.jsx';

function App() {
    const defaultCityCoordinates = { lat: 49.2827, lng: -123.1207 }; // Vancouver's coordinates
    const defaultTime = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const pacificDate = new Date(defaultTime);

    // 格式化为 `yyyy-MM-ddTHH:mm`
    const pacificISOString = new Date(pacificDate.getTime() - pacificDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
    const defaultPreference = 0.5;
    const defaultSpeed = 2.5; // Speed in m/s

    const [initialCenter, setInitialCenter] = useState(defaultCityCoordinates); // 初始地图中心
    const [city, setCity] = useState('vancouver');
    const [time, setTime] = useState(pacificISOString);
    const [preference, setPreference] = useState(defaultPreference);
    const [speed, setSpeed] = useState(defaultSpeed);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [endTime, setEndTime] = useState(null);

    // 当用户切换城市时设置新的初始中心，但不触发重新渲染
    const handleCityChange = (newCity) => {
        setCity(newCity);
        if (newCity === 'vancouver') {
            setInitialCenter({ lat: 49.2827, lng: -123.1207 });
        } else if (newCity === 'toronto') {
            setInitialCenter({ lat: 43.65107, lng: -79.347015 });
        }
    };

    // 生成路线
    const handleGenerateRoute = () => {
        if (startPoint && endPoint) {
            fetch('/api/generateRoute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city,
                    time,
                    preference,
                    speed,
                    startPoint,
                    endPoint,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    const distance = data.distance;
                    const travelTimeSeconds = distance / speed;
                    const startTime = new Date(time);
                    const calculatedEndTime = new Date(startTime.getTime() + travelTimeSeconds * 1000);

                    // 将结束时间格式化为太平洋时间
                    const pacificEndTime = calculatedEndTime.toLocaleString('en-US', {
                        timeZone: 'America/Los_Angeles',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    setEndTime(pacificEndTime);
                })
                .catch((error) => console.error('Error generating route:', error));
        } else {
            alert('Please select both a starting point and an endpoint');
        }
    };

    // 刷新表单和标记，但不改变地图中心
    const handleRefresh = () => {
        setTime(pacificISOString);
        setPreference(defaultPreference);
        setSpeed(defaultSpeed);
        setStartPoint(null);
        setEndPoint(null);
        setEndTime(null);
    };

    return (
        <div>
            <h1>Pathfinding App</h1>
            
            {/* 城市选择 */}
            <CitySelect city={city} setCity={handleCityChange} />

            {/* 地图（仅在加载时设置初始中心） */}
            <MapComponent
                initialCenter={initialCenter}
                startPoint={startPoint}
                endPoint={endPoint}
                setStartPoint={setStartPoint}
                setEndPoint={setEndPoint}
            />
            
            {/* 路线参数 */}
            <TimeSelect time={time} setTime={setTime} />
            <PreferenceSlider preference={preference} setPreference={setPreference} />
            {/*<SpeedControl speed={speed} setSpeed={setSpeed} />*/}

            <button onClick={handleGenerateRoute}>Generate Route</button>
            <button onClick={handleRefresh}>Refresh</button>

            {/* 显示并允许编辑标记的经纬度 */}
            <div>
                {startPoint && (
                    <div>
                        <p>Start Point:</p>
                        <label>
                            Latitude:
                            <input
                                type="number"
                                value={startPoint.lat}
                                onChange={(e) => setStartPoint(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                            />
                        </label>
                        <label>
                            Longitude:
                            <input
                                type="number"
                                value={startPoint.lng}
                                onChange={(e) => setStartPoint(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                            />
                        </label>
                    </div>
                )}
                {endPoint && (
                    <div>
                        <p>End Point:</p>
                        <label>
                            Latitude:
                            <input
                                type="number"
                                value={endPoint.lat}
                                onChange={(e) => setEndPoint(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                            />
                        </label>
                        <label>
                            Longitude:
                            <input
                                type="number"
                                value={endPoint.lng}
                                onChange={(e) => setEndPoint(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                            />
                        </label>
                    </div>
                )}
            </div>

            {endTime && (
                <div>
                    <h2>Journey End Time</h2>
                    <p>Estimated Arrival: {endTime}</p>
                </div>
            )}
        </div>
    );
}

export default App;
