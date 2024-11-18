
import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

// 修复标记图标
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

//这里update
// 动态生成颜色：灰色 (阴影) 和红色 (无阴影)
const getColorByCoverage = (coverage) => {
  const startColor = [255, 0, 0];   // 红色
  const endColor = [128, 128, 128]; // 灰色
  const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * coverage);
  const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * coverage);
  const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * coverage);
  return `rgb(${r}, ${g}, ${b})`;
};

// 图例组件
const Legend = () => (
  <div className="legend-container" style={{ padding: '5px', textAlign: 'center', marginTop: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: 'rgb(255, 0, 0)', // 红色
            border: '1px solid black',
          }}
        ></div>
        <span>No Shade</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: 'rgb(128, 128, 128)', // 灰色
            border: '1px solid black',
          }}
        ></div>
        <span>Full Shade</span>
      </div>
    </div>
  </div>
);

//这里结束

function MapComponent({ initialCenter, startPoint, endPoint, setStartPoint, setEndPoint, routeCoordinates }) {
  const mapRef = useRef(null); // 引入地图引用

  // 地图点击事件处理
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!startPoint) {
          setStartPoint(e.latlng); // 如果起点不存在，设置起点
        } else if (!endPoint) {
          setEndPoint(e.latlng); // 如果终点不存在，设置终点
        }
      },
    });
    return null;
  };

  // 设置初始视角，仅在地图加载时触发
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.setView(initialCenter, 13); // 设置初始视角和缩放级别
    }
  }, [initialCenter]); // 仅依赖初始视角，不依赖状态

  return (
      <div>
        <MapContainer
          center={initialCenter}
          zoom={13}
          style={{ height: '500px' }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance; // 将地图实例保存到 ref 中
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />

          {/* 起点和终点标记 */}
          {startPoint && <Marker position={startPoint} />}
          {endPoint && <Marker position={endPoint} />}

          {/* 路线，根据 coverage 动态设置颜色 */}
          {routeCoordinates.length > 0 &&
            routeCoordinates.map((edge, index) => (
              <Polyline
                key={index}
                positions={edge.coordinates}
                color={getColorByCoverage(edge.coverage)} // 动态颜色
                weight={5} // 路径线宽
              />
            ))}
        </MapContainer>

        {/* 添加图例 */}
       <Legend />
      </div>
    );
  }

export default MapComponent;
