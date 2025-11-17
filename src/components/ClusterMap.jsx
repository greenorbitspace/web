import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function ClusterMap({ clusters }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!clusters || clusters.length === 0) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      let map;

      if (clusters.length === 1) {
        // Single cluster: center directly
        const [lng, lat] = clusters[0].coordinates;
        map = L.map(mapRef.current, {
          center: [lat, lng],
          zoom: 6,
        });
      } else {
        // Multiple clusters: temporary center & zoom
        map = L.map(mapRef.current, {
          center: [0, 0],
          zoom: 2,
        });
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Create markers
      markersRef.current = clusters
        .filter(c => c.coordinates && c.coordinates.length === 2)
        .map((c) => {
          const [lng, lat] = c.coordinates;

          const createIcon = (size = 40) => {
            const iconHtml = `
              <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                background: rgba(0,0,0,0.85);
                padding: 4px;
                border-radius: 50%;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                width: ${size}px;
                height: ${size}px;
              ">
                <img src="${c.logo || '/images/default-featured.jpg'}"
                     style="width: 80%; height: 80%; object-fit: contain;"
                     alt="${c.name} logo" />
              </div>
            `;
            return L.divIcon({
              html: iconHtml,
              className: "",
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
              popupAnchor: [0, -size / 2 - 5],
            });
          };

          const marker = L.marker([lat, lng], { icon: createIcon() }).addTo(map);

          const description = c.description
            ? c.description.length > 120
              ? c.description.slice(0, 120) + "…"
              : c.description
            : "";

          marker.bindPopup(`
            <div style="max-width:220px; text-align:center; font-family:sans-serif;">
              <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${c.name}</div>
              <div style="font-size:12px; line-height:1.2; color:#333;">${description}</div>
            </div>
          `);

          marker._baseSize = 40;
          marker._createIcon = createIcon;
          return marker;
        });

      // Fit map bounds for multiple markers
      if (markersRef.current.length > 1) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.5));
      }

      // Update marker size on zoom
      map.on("zoom", () => {
        const zoom = map.getZoom();
        markersRef.current.forEach((marker) => {
          const newSize = marker._baseSize + (zoom - 4) * 5;
          marker.setIcon(marker._createIcon(newSize));
        });
      });
    });
  }, [clusters]);

  return <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden shadow-lg" />;
}