// src/components/InteractiveMap.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon for Leaflet when using Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Component to auto-fit bounds to markers
function FitBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, markers]);

  return null;
}

export default function InteractiveMap({ markers = [] }) {
  return (
    <MapContainer
      center={[0, 0]} // default center, overridden by FitBounds
      zoom={2} // default zoom, overridden by FitBounds
      scrollWheelZoom={true}
      className="w-full h-96 rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker, idx) => (
        <Marker key={idx} position={[marker.lat, marker.lng]}>
          {marker.label && <Popup>{marker.label}</Popup>}
        </Marker>
      ))}

      <FitBounds markers={markers} />
    </MapContainer>
  );
}