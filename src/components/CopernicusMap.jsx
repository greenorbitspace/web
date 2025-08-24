import React, { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function CopernicusMap({
  productsData = [],
  layers = {},
  wmsUrl,
  minZoom = 5,
  maxZoom = 20,
}) {
  const mapRef = useRef(null);
  const LRef = useRef(null);
  const layerRefs = useRef({}); // store all WMS layers
  const productRectsRef = useRef([]); // store rectangles for products

  const [selectedBaseLayers, setSelectedBaseLayers] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const getSwathBounds = (lat, lng, sizeKm = 100) => {
    const kmPerDegreeLat = 110.574;
    const kmPerDegreeLng = 111.320 * Math.cos((lat * Math.PI) / 180);
    const deltaLat = (sizeKm / 2) / kmPerDegreeLat;
    const deltaLng = (sizeKm / 2) / kmPerDegreeLng;
    return [
      [lat - deltaLat, lng - deltaLng],
      [lat + deltaLat, lng + deltaLng],
    ];
  };

  useEffect(() => {
    async function init() {
      const L = (await import("leaflet")).default;
      LRef.current = L;

      const map = L.map("copernicus-map", {
        minZoom,
        maxZoom,
        center: [52.63688, -1.13976],
        zoom: 10,
      });
      mapRef.current = map;

      // Add default base OSM
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        detectRetina: true,
      }).addTo(map);
    }
    init();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    // Remove previous WMS layers
    Object.values(layerRefs.current).forEach((layer) => map.removeLayer(layer));
    layerRefs.current = {};

    // Remove previous product rectangles
    productRectsRef.current.forEach((rect) => map.removeLayer(rect));
    productRectsRef.current = [];

    // Add selected base layers
    selectedBaseLayers.forEach((layerName, i) => {
      if (!layers[layerName]) return;
      const wmsLayer = L.tileLayer.wms(wmsUrl, {
        layers: layers[layerName],
        format: "image/png",
        transparent: true,
        attribution: "Copernicus Sentinel WMS",
        opacity: 0.6 + i * 0.2,
        detectRetina: true,
      }).addTo(map);
      layerRefs.current[layerName] = wmsLayer;
    });

    // Add selected products as WMS layers
    selectedProductIds.forEach((id) => {
      const product = productsData.find((p) => p.id === id);
      if (!product || !product.lat || !product.lng) return;

      const productLayer = L.tileLayer.wms(wmsUrl, {
        layers: product.granuleId,
        format: "image/png",
        transparent: true,
        attribution: "Copernicus Product",
        opacity: 0.8,
        detectRetina: true,
      }).addTo(map);

      layerRefs.current[id] = productLayer;

      // Highlight product bounds in red
      const bounds = getSwathBounds(product.lat, product.lng, 100);
      const rect = L.rectangle(bounds, { color: "red", weight: 2, fill: false }).addTo(map);
      productRectsRef.current.push(rect);
    });
  }, [selectedBaseLayers, selectedProductIds]);

  const toggleBaseLayer = (layerName) => {
    setSelectedBaseLayers((prev) =>
      prev.includes(layerName)
        ? prev.filter((l) => l !== layerName)
        : [...prev, layerName]
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div id="copernicus-map" className="flex-1 h-[600px] border border-gray-300" />
      <aside className="w-full md:w-64 h-[600px] overflow-y-auto border border-gray-200 p-4 bg-primary-500 text-white shadow-md">
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Base Layers (stackable)</h3>
          {Object.keys(layers).map((layerName) => (
            <label key={layerName} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={selectedBaseLayers.includes(layerName)}
                onChange={() => toggleBaseLayer(layerName)}
              />
              <span className="text-white">{layerName}</span>
            </label>
          ))}
          <p className="text-white text-sm mt-2">
            Leave all unchecked for plain OSM.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-white">Products</h3>
          <select
            multiple
            value={selectedProductIds}
            onChange={(e) =>
              setSelectedProductIds(Array.from(e.target.selectedOptions).map((o) => o.value))
            }
            className="h-40 w-full overflow-y-auto border border-gray-300 text-primary-500 rounded p-1"
          >
            {productsData.map((p) => (
              <option key={p.id} value={p.id}>{p.id}</option>
            ))}
          </select>
        </div>
      </aside>
    </div>
  );
}