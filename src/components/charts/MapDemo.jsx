import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapDemo() {
  return (
    <div style={{ height: "300px", width: "100%" }}>
      <MapContainer center={[51.505, -0.09]} zoom={3} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>Green Orbit HQ (London)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}