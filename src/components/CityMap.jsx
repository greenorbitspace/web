import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function CityMap({ cities }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!cities || cities.length === 0) return;

    // Dynamically import Leaflet (client-only)
    import("leaflet").then((L) => {
      // Fix default icon URLs
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: null, // no shadow
      });

      // Initialize map
      const map = L.map(mapRef.current, {
        center: [55, -3],
        zoom: 5,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const markers = cities.map((city) => {
        const [lat, lng] = city.coordinates;
        const marker = L.marker([lat, lng]).addTo(map);

        marker.bindPopup(`
          <div style="max-width:220px; text-align:center; font-family:sans-serif;">
            <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${city.name}</div>
            <div style="font-size:12px; line-height:1.2; color:#333;">${city.description}</div>
          </div>
        `);

        return marker;
      });

      if (markers.length > 1) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.5));
      } else if (markers.length === 1) {
        map.setView(markers[0].getLatLng(), 12);
      }
    });
  }, [cities]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
}