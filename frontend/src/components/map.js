"use client";

import { useState, useCallback } from "react";
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
import { getStatusIcon, getStatusColor } from "./business/business-status";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

export default function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [hexagons, setHexagons] = useState([]);
  const [selectedHexagon, setSelectedHexagon] = useState(null);
  const [map, setMap] = useState(null);
  const [businesses, setBusinesses] = useState(null);
  const [areaAnalysis, setAreaAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [mapType, setMapType] = useState("hybrid");
  const [zoom, setZoom] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");

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
      try {
        setBusinesses(null);
        setAreaAnalysis(null);
        setSelectedBusiness(null);
        setIsLoading(true);

        const initialHexagonState = {
          hexagon_id: hexagon.id,
          center: hexagon.center,
          businesses_fetched: false,
          no_businesses_found: false,
        };

        setSelectedHexagon(initialHexagonState);
        centerAndZoomOnHexagon(hexagon);

        const response = await fetch(
          `${BACKEND_URL}/api/hexagons/${hexagon.id}/businesses`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setSelectedHexagon(data.hexagon);

        if (data.businesses?.length > 0) {
          const validBusinesses = data.businesses.filter(
            (business) => business.location?.lat && business.location?.lng
          );
          setBusinesses(validBusinesses);
          setAreaAnalysis(data.areaAnalysis);
        }
      } catch (error) {
        console.error("Error fetching hexagon data:", error);
        setSelectedHexagon((prev) => ({
          ...prev,
          error: "Failed to fetch hexagon data",
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [centerAndZoomOnHexagon]
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

  const handleMarkerClick = useCallback(
    (business) => {
      if (!business.location?.lat || !business.location?.lng) return;

      setSelectedBusiness(business);
      if (map) {
        map.panTo({
          lat: business.location.lat,
          lng: business.location.lng,
        });

        const targetZoom = 17;
        if (map.getZoom() < targetZoom) {
          map.setZoom(targetZoom);
        }
      }
    },
    [map]
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

  const handleBusinessStatusChange = useCallback((updatedBusiness) => {
    if (!updatedBusiness.location?.lat || !updatedBusiness.location?.lng)
      return;

    setBusinesses((prevBusinesses) =>
      prevBusinesses.map((business) =>
        business.place_id === updatedBusiness.place_id
          ? updatedBusiness
          : business
      )
    );
  }, []);

  const handleFetchComplete = useCallback((data) => {
    if (data.businesses?.length > 0) {
      const validBusinesses = data.businesses.filter(
        (business) => business.location?.lat && business.location?.lng
      );
      setBusinesses(validBusinesses);
      setAreaAnalysis(data.areaAnalysis);
    }

    setSelectedHexagon((prev) => ({
      ...prev,
      businesses_fetched: true,
      no_businesses_found: !data.businesses?.length,
    }));
  }, []);

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
            onFetchComplete={handleFetchComplete}
            onBusinessStatusChange={handleBusinessStatusChange}
            isLoading={isLoading}
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
          {businesses?.map((business) => {
            if (!business.location?.lat || !business.location?.lng) return null;

            const StatusIcon = getStatusIcon(business.status);
            return (
              <Marker
                key={business.place_id}
                position={{
                  lat: business.location.lat,
                  lng: business.location.lng,
                }}
                onClick={() => handleMarkerClick(business)}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: getStatusColor(business.status),
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#ffffff",
                }}
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
