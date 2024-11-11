import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复标记图标
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapComponent({ initialCenter, startPoint, endPoint, setStartPoint, setEndPoint }) {
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (!startPoint) {
                    setStartPoint(e.latlng);
                } else if (!endPoint) {
                    setEndPoint(e.latlng);
                }
            },
        });
        return null;
    };

    // 仅在地图加载时设置初始视角
    function InitialMapView({ initialCenter }) {
        const map = useMap();

        useEffect(() => {
            map.setView(initialCenter, 13); // 初始视角和缩放级别
        }, []); // 空依赖数组，确保只在加载时执行一次

        return null;
    }

    return (
        <MapContainer zoom={13} style={{ height: '500px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <InitialMapView initialCenter={initialCenter} />
            <MapClickHandler />
            {startPoint && <Marker position={startPoint}></Marker>}
            {endPoint && <Marker position={endPoint}></Marker>}
        </MapContainer>
    );
}

export default MapComponent;
