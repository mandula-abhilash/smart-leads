"use client";

import { useState, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  Polygon,
  Marker,
} from "@react-google-maps/api";
import * as h3 from "h3-js";
import MapSearch from "./ui/map-search";
import BusinessSidebar from "./ui/business-sidebar";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 17.519330500446294,
  lng: 78.30199254778114,
};

const options = {
  disableDefaultUI: true,
  zoomControl: false,
  zoom: 15,
  minZoom: 15,
  maxZoom: 18,
  streetViewControl: false,
  mapTypeControl: false,
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
  const [businesses, setBusinesses] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const generateHexagons = useCallback((bounds, zoom) => {
    if (!bounds) return [];

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const resolution = 9;

    const centerLat = (ne.lat() + sw.lat()) / 2;
    const centerLng = (ne.lng() + sw.lng()) / 2;

    const centerHex = h3.latLngToCell(centerLat, centerLng, resolution);
    const kRing = h3.gridDisk(centerHex, 20);

    return kRing.map((h3Index) => {
      const boundary = h3.cellToBoundary(h3Index);
      return {
        id: h3Index,
        paths: boundary.map(([lat, lng]) => ({ lat, lng })),
        completed: false,
      };
    });
  }, []);

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleMapIdle = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const newHexagons = generateHexagons(bounds, zoom);
    setHexagons(newHexagons);
  }, [map, generateHexagons]);

  const handleHexagonClick = useCallback(async (hexagon) => {
    setSelectedHexagon(hexagon);
    setIsLoading(true);
    setBusinesses(null);
    setSelectedBusiness(null);

    try {
      const center = h3.cellToLatLng(hexagon.id);
      const response = await fetch(
        `http://localhost:5000/api/businesses/search?lat=${center[0]}&lng=${center[1]}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }

      const data = await response.json();
      setBusinesses(data.businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setIsLoading(false);
    }
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

  const handleCloseSidebar = useCallback(() => {
    setSelectedHexagon(null);
    setBusinesses(null);
    setSelectedBusiness(null);
  }, []);

  const handleMarkerClick = useCallback(
    (business) => {
      setSelectedBusiness(business);
      if (map) {
        map.panTo({
          lat: business.location.lat,
          lng: business.location.lng,
        });
      }
    },
    [map]
  );

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">
          Error loading maps. Please check your API key.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading maps...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <MapSearch onSelectLocation={handleLocationSelect} />
      <BusinessSidebar
        businesses={businesses}
        isLoading={isLoading}
        onClose={handleCloseSidebar}
        selectedBusiness={selectedBusiness}
        onBusinessClick={handleMarkerClick}
      />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={defaultCenter}
        options={options}
        onLoad={handleMapLoad}
        onIdle={handleMapIdle}
      >
        {hexagons.map((hexagon) => (
          <Polygon
            key={hexagon.id}
            paths={hexagon.paths}
            onClick={() => handleHexagonClick(hexagon)}
            options={{
              fillColor: hexagon.completed ? "#10b981" : "#2563eb",
              fillOpacity: selectedHexagon?.id === hexagon.id ? 0.25 : 0.08,
              strokeColor:
                selectedHexagon?.id === hexagon.id
                  ? "#000000"
                  : hexagon.completed
                  ? "#10b981"
                  : "#2563eb",
              strokeWeight: selectedHexagon?.id === hexagon.id ? 2.5 : 1.5,
              strokeOpacity: selectedHexagon?.id === hexagon.id ? 0.9 : 0.6,
              clickable: true,
            }}
          />
        ))}
        {businesses?.map((business) => (
          <Marker
            key={business.place_id}
            position={{
              lat: business.location.lat,
              lng: business.location.lng,
            }}
            onClick={() => handleMarkerClick(business)}
            animation={
              selectedBusiness?.place_id === business.place_id
                ? window.google.maps.Animation.BOUNCE
                : null
            }
          />
        ))}
      </GoogleMap>
    </div>
  );
}
