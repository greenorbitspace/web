import React, { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// Example GeoJSON vector overlay
const geojsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Site Alpha", value: 42 },
      geometry: { type: "Point", coordinates: [2.3522, 48.8566] }, // [lng, lat]
    },
    {
      type: "Feature",
      properties: { name: "Site Beta", value: 55 },
      geometry: { type: "Point", coordinates: [-0.1278, 51.5074] },
    },
  ],
};

// Example heatmap points: [lat, lng, intensity]
const heatmapPoints = [
  [48.8566, 2.3522, 0.8],
  [51.5074, -0.1278, 0.5],
  [40.7128, -74.006, 0.7],
];

// Custom Heatmap component using leaflet.heat
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const heatLayer = L.heatLayer(
      points.map(p => [p[0], p[1], p[2] || 1]), // [lat, lng, intensity]
      { radius: 25, blur: 15 }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

const SatelliteMapDashboard = () => {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "600px", width: "100%" }}
    >
      {/* Base Tile Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Optional Raster Satellite Tiles (replace URL with your server) */}
      <TileLayer url="https://your-tile-server/{z}/{x}/{y}.png" opacity={0.6} />

      {/* Vector Overlay */}
      <GeoJSON
        data={geojsonData}
        onEachFeature={(feature, layer) => {
          if (feature.properties?.name) {
            layer.bindPopup(
              `<strong>${feature.properties.name}</strong><br/>Value: ${feature.properties.value}`
            );
          }
        }}
        style={{ color: "green", weight: 2 }}
      />

      {/* Heatmap */}
      <HeatmapLayer points={heatmapPoints} />
    </MapContainer>
  );
};

export default SatelliteMapDashboard;