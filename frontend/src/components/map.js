"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import * as h3 from "h3-js";
import MapSearch from "./ui/map-search";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006, // New York City
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

export default function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [hexagons, setHexagons] = useState([]);
  const [selectedHexagon, setSelectedHexagon] = useState(null);
  const [map, setMap] = useState(null);

  const generateHexagons = useCallback(
    (center, zoom) => {
      if (!map) return;

      const bounds = map.getBounds();
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const resolution = zoom >= 15 ? 9 : zoom >= 12 ? 8 : 7;

      const hexagons = [];
      const step = (ne.lng() - sw.lng()) / 10;

      for (let lng = sw.lng(); lng <= ne.lng(); lng += step) {
        for (let lat = sw.lat(); lat <= ne.lat(); lat += step) {
          const h3Index = h3.latLngToCell(lat, lng, resolution);
          const vertices = h3.cellToBoundary(h3Index, true);

          hexagons.push({
            id: h3Index,
            paths: vertices.map(([lat, lng]) => ({ lat, lng })),
            completed: false, // This will be updated from the backend
          });
        }
      }

      setHexagons(hexagons);
    },
    [map]
  );

  const handleMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const handleMapIdle = useCallback(() => {
    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      generateHexagons(center, zoom);
    }
  }, [map, generateHexagons]);

  const handleHexagonClick = useCallback((hexagon) => {
    setSelectedHexagon(hexagon);
    // TODO: Fetch businesses for this hexagon from the backend
  }, []);

  const handleLocationSelect = useCallback(
    ({ lat, lng }) => {
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(14);
      }
    },
    [map]
  );

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="relative w-full h-screen">
      <MapSearch onSelectLocation={handleLocationSelect} />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={defaultCenter}
        options={options}
        onLoad={handleMapLoad}
        onIdle={handleMapIdle}
      >
        {hexagons.map((hexagon) => (
          <div
            key={hexagon.id}
            onClick={() => handleHexagonClick(hexagon)}
            style={{
              position: "absolute",
              left: "0",
              top: "0",
              width: "100%",
              height: "100%",
            }}
          >
            <svg
              style={{
                position: "absolute",
                left: "0",
                top: "0",
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <path
                d={`M ${hexagon.paths
                  .map((point) => {
                    const pixel = map?.getProjection().fromLatLngToPoint(point);
                    return `${pixel.x},${pixel.y}`;
                  })
                  .join(" L ")} Z`}
                fill={
                  hexagon.completed
                    ? "rgba(0, 255, 0, 0.2)"
                    : "rgba(0, 0, 255, 0.2)"
                }
                stroke={
                  selectedHexagon?.id === hexagon.id
                    ? "#000"
                    : hexagon.completed
                    ? "#0f0"
                    : "#00f"
                }
                strokeWidth="2"
              />
            </svg>
          </div>
        ))}
      </GoogleMap>
    </div>
  );
}
