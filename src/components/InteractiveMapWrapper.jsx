// src/components/InteractiveMapWrapper.jsx
import React, { useEffect, useState } from "react";

// Only import Leaflet inside the client effect
export default function InteractiveMapWrapper({ markers = [] }) {
  const [isClient, setIsClient] = useState(false);
  const [MapComponent, setMapComponent] = useState(null);

  useEffect(() => {
    // Dynamically import the client-only map
    import("./InteractiveMap.client.jsx").then((mod) => {
      setMapComponent(() => mod.default);
      setIsClient(true);
    });
  }, []);

  if (!isClient || !MapComponent) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300">
        Loading map…
      </div>
    );
  }

  return <MapComponent markers={markers} />;
}