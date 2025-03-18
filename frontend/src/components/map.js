"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Polygon,
  Marker,
} from "@react-google-maps/api";
import * as h3 from "h3-js";
import BusinessList from "./business/business-list";
import BusinessDetails from "./business/business-details";
import HexagonDetails from "./map/hexagon-details";
import MapSearch from "./map-search";
import { Button } from "./ui/button";
import { MapIcon, Satellite, Globe, Mountain } from "lucide-react";
import { getStatusColor } from "./business/business-status";
import { useBusinessContext } from "@/contexts/BusinessContext";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 17.519330500446294,
  lng: 78.30199254778114,
};

const MAP_TYPES = [
  { id: "roadmap", name: "Road Map", icon: MapIcon },
  { id: "satellite", name: "Satellite", icon: Satellite },
  { id: "hybrid", name: "Hybrid", icon: Globe },
  { id: "terrain", name: "Terrain", icon: Mountain },
];

const options = {
  disableDefaultUI: true,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  minZoom: 13,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

// Create marker options for status-based pins
const createMarkerIcon = (status, scale = 1, selected = false) => {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: getStatusColor(status),
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "#FFFFFF",
    scale: selected ? 10 : 8,
  };
};

export default function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const {
    businesses,
    areaAnalysis,
    selectedBusiness,
    selectedHexagon,
    isLoading,
    setSelectedBusiness,
    fetchHexagonBusinesses,
    clearSelection,
  } = useBusinessContext();

  const [hexagons, setHexagons] = useState([]);
  const [map, setMap] = useState(null);
  const [mapType, setMapType] = useState("hybrid");
  const [zoom, setZoom] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);

  // Animation interval ref
  const animationRef = useRef(null);
  const markerScaleRef = useRef(1);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // Update markers whenever businesses change
  useEffect(() => {
    if (businesses && Array.isArray(businesses)) {
      const validBusinesses = businesses.filter((business) => {
        return (
          business &&
          business.location &&
          typeof business.location.lat === "number" &&
          typeof business.location.lng === "number"
        );
      });
      setMarkers(validBusinesses);
    } else {
      setMarkers([]);
    }
  }, [businesses, selectedHexagon?.hexagon_id]);

  const generateHexagons = useCallback((bounds) => {
    if (!bounds) return [];

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const centerLat = (ne.lat() + sw.lat()) / 2;
    const centerLng = (ne.lng() + sw.lng()) / 2;

    const centerHex = h3.latLngToCell(centerLat, centerLng, 8);
    const kRing = h3.gridDisk(centerHex, 15);

    return kRing.map((h3Index) => {
      const boundary = h3.cellToBoundary(h3Index);
      const center = h3.cellToLatLng(h3Index);
      return {
        id: h3Index,
        paths: boundary.map(([lat, lng]) => ({ lat, lng })),
        center: { lat: center[0], lng: center[1] },
      };
    });
  }, []);

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleMapIdle = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    const currentZoom = map.getZoom();
    setZoom(currentZoom);
    const newHexagons = generateHexagons(bounds);
    setHexagons(newHexagons);
  }, [map, generateHexagons]);

  const centerAndZoomOnHexagon = useCallback(
    (hexagon) => {
      if (!map) return;

      const bounds = new window.google.maps.LatLngBounds();
      hexagon.paths.forEach((point) => {
        bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
      });

      map.fitBounds(bounds, {
        padding: { top: 50, right: 50, bottom: 50, left: 50 },
      });

      const minZoom = 15;
      if (map.getZoom() > minZoom) {
        map.setZoom(minZoom);
      }
    },
    [map]
  );

  const handleHexagonClick = useCallback(
    async (hexagon) => {
      await fetchHexagonBusinesses(hexagon.id);
      centerAndZoomOnHexagon(hexagon);
    },
    [fetchHexagonBusinesses, centerAndZoomOnHexagon]
  );

  const handleLocationSelect = useCallback(
    ({ lat, lng }) => {
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(15);
      }
    },
    [map]
  );

  const animateMarker = useCallback((business) => {
    setActiveMarker(business.place_id);
    markerScaleRef.current = 1;
    let increasing = true;

    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    // Create new animation
    animationRef.current = setInterval(() => {
      if (increasing) {
        markerScaleRef.current += 0.1;
        if (markerScaleRef.current >= 1.5) {
          increasing = false;
        }
      } else {
        markerScaleRef.current -= 0.1;
        if (markerScaleRef.current <= 1) {
          increasing = true;
        }
      }
      setActiveMarker((current) =>
        current === business.place_id
          ? `${business.place_id}-${markerScaleRef.current}`
          : current
      );
    }, 50);

    // Stop animation after 2 seconds
    setTimeout(() => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        setActiveMarker(null);
      }
    }, 2000);
  }, []);

  const centerOnBusiness = useCallback(
    (business) => {
      if (map && business.location) {
        map.panTo({
          lat: business.location.lat,
          lng: business.location.lng,
        });

        // Set a higher zoom level (19 is typically building-level detail)
        const targetZoom = 19;
        map.setZoom(targetZoom);

        // Animate the marker
        animateMarker(business);
      }
    },
    [map, animateMarker]
  );

  const handleMarkerClick = useCallback(
    (business) => {
      setSelectedBusiness(business);
      centerOnBusiness(business);
    },
    [setSelectedBusiness, centerOnBusiness]
  );

  const handleHexagonBusinessClick = useCallback(
    (business) => {
      setSelectedBusiness(business);
      centerOnBusiness(business);
    },
    [setSelectedBusiness, centerOnBusiness]
  );

  const handleMapTypeChange = useCallback(
    (type) => {
      if (map) {
        map.setMapTypeId(type);
        setMapType(type);
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
    <div className="relative w-full h-screen flex overflow-hidden">
      {/* Left Sidebar - Hexagon Details or Business List */}
      <div className="w-[400px] h-screen border-r bg-background/95 backdrop-blur-sm flex flex-col z-20">
        {/* Map Controls */}
        <div className="border-b p-4 space-y-4 bg-background/50 backdrop-blur-sm">
          <MapSearch onSelectLocation={handleLocationSelect} />
          <div className="flex gap-2">
            {MAP_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  onClick={() => handleMapTypeChange(type.id)}
                  variant={mapType === type.id ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Hexagon Details or Business List */}
        {selectedHexagon ? (
          <HexagonDetails
            hexagon={selectedHexagon}
            businesses={businesses}
            isLoading={isLoading}
            onBusinessClick={handleHexagonBusinessClick}
          />
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Click on a hexagon to view details
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={zoom}
          center={defaultCenter}
          options={{
            ...options,
            mapTypeId: mapType,
          }}
          onLoad={handleMapLoad}
          onIdle={handleMapIdle}
        >
          {hexagons.map((hexagon) => (
            <Polygon
              key={hexagon.id}
              paths={hexagon.paths}
              onClick={() => handleHexagonClick(hexagon)}
              options={{
                fillColor:
                  selectedHexagon?.hexagon_id === hexagon.id
                    ? "#3b82f6"
                    : "#6366f1",
                fillOpacity: 0.2,
                strokeColor:
                  selectedHexagon?.hexagon_id === hexagon.id
                    ? "#2563eb"
                    : "#4f46e5",
                strokeWeight:
                  selectedHexagon?.hexagon_id === hexagon.id ? 2 : 1,
                strokeOpacity: 0.8,
              }}
            />
          ))}
          {markers.map((business) => {
            const isActive = activeMarker?.startsWith(business.place_id);
            const scale = isActive
              ? parseFloat(activeMarker.split("-")[1]) || 1
              : selectedBusiness?.place_id === business.place_id
              ? 1.2
              : 1;

            return (
              <Marker
                key={business.place_id}
                position={{
                  lat: business.location.lat,
                  lng: business.location.lng,
                }}
                onClick={() => handleMarkerClick(business)}
                icon={createMarkerIcon(
                  business.status,
                  scale,
                  selectedBusiness?.place_id === business.place_id
                )}
              />
            );
          })}
        </GoogleMap>
      </div>

      {/* Right Panel - Business Details */}
      {selectedBusiness && (
        <div className="w-[400px] h-screen border-l bg-background/95 backdrop-blur-sm z-20">
          <BusinessDetails
            business={selectedBusiness}
            isLoading={isLoading}
            businesses={businesses}
          />
        </div>
      )}
    </div>
  );
}
