import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const heatLayer = L.heatLayer(points, { 
      radius: 25, 
      blur: 15, 
      maxZoom: 17,
      gradient: { 0.4: "blue", 0.65: "lime", 1: "red" }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

export default function HeatmapExample() {
  // [lat, lng, intensity]
  const points = [
    [48.8566, 2.3522, 0.8], // Paris
    [51.5074, -0.1278, 0.5], // London
    [40.7128, -74.006, 0.7], // New York
  ];

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: "600px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <HeatmapLayer points={points} />
    </MapContainer>
  );
}