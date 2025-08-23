import { useEffect, useRef } from "react";

export default function InteractiveMap({ markers = [] }) {
  const mapRef = useRef(null);

  useEffect(() => {
    let mapInstance;

    (async () => {
      // Import Leaflet only in browser
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (mapRef.current && !mapInstance) {
        mapInstance = L.map(mapRef.current).setView([20, 0], 2);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapInstance);

        markers.forEach(({ lat, lng, label }) => {
          L.marker([lat, lng]).addTo(mapInstance).bindPopup(label);
        });
      }
    })();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [markers]);

  return (
    <div
      ref={mapRef}
      style={{ height: "500px", width: "100%" }}
      className="rounded-lg overflow-hidden shadow-lg"
    />
  );
}