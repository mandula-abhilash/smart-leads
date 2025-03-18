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
import MapSearch from "./map-search";
import { Button } from "./ui/button";
import { MapIcon, Satellite, Globe, Mountain, Hexagon } from "lucide-react";

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

function HexagonDetails({ hexagon, onFetchBusinesses, isLoading }) {
  if (!hexagon) return null;

  const center = h3.cellToLatLng(hexagon.id);
  const areaSqKm = h3.cellArea(hexagon.id, "km2");
  const resolution = h3.getResolution(hexagon.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Hexagon className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Hexagon Details</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <div>
            <div className="text-sm text-muted-foreground">Hexagon ID</div>
            <div className="font-mono text-sm">{hexagon.id}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              Center Coordinates
            </div>
            <div className="font-mono text-sm">
              {center[0].toFixed(6)}, {center[1].toFixed(6)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Resolution</div>
            <div>{resolution}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Area</div>
            <div>{areaSqKm.toFixed(2)} km²</div>
          </div>
        </div>

        <Button
          className="w-full cursor-pointer"
          onClick={onFetchBusinesses}
          disabled={isLoading}
        >
          {isLoading ? "Fetching Businesses..." : "Fetch Businesses"}
        </Button>
      </div>
    </div>
  );
}

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
    const currentZoom = map.getZoom();
    setZoom(currentZoom);
    const newHexagons = generateHexagons(bounds);
    setHexagons(newHexagons);
  }, [map, generateHexagons]);

  const handleHexagonClick = useCallback((hexagon) => {
    setSelectedHexagon(hexagon);
    setBusinesses(null);
    setAreaAnalysis(null);
    setSelectedBusiness(null);
  }, []);

  const fetchBusinesses = useCallback(async () => {
    if (!selectedHexagon) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/businesses/search?lat=${selectedHexagon.center.lat}&lng=${selectedHexagon.center.lng}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }

      const data = await response.json();
      setBusinesses(data.businesses);
      setAreaAnalysis(data.areaAnalysis);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHexagon]);

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
      <div className="w-80 h-screen border-r bg-background/95 backdrop-blur-sm flex flex-col z-20">
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
        {selectedHexagon && !businesses ? (
          <HexagonDetails
            hexagon={selectedHexagon}
            onFetchBusinesses={fetchBusinesses}
            isLoading={isLoading}
          />
        ) : businesses ? (
          <BusinessList
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            onBusinessClick={handleMarkerClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        ) : null}
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
                fillColor: hexagon.completed ? "#10b981" : "#2563eb",
                fillOpacity: selectedHexagon?.id === hexagon.id ? 0.25 : 0.08,
                strokeColor:
                  selectedHexagon?.id === hexagon.id
                    ? "#000000"
                    : hexagon.completed
                    ? "#10b981"
                    : "#2563eb",
                strokeWeight: selectedHexagon?.id === hexagon.id ? 4 : 3,
                strokeOpacity: selectedHexagon?.id === hexagon.id ? 0.9 : 0.8,
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

      {/* Right Panel - Business Details */}
      {businesses && (
        <div className="w-[480px] h-screen border-l bg-background/95 backdrop-blur-sm z-20">
          <BusinessDetails business={selectedBusiness} />
        </div>
      )}
    </div>
  );
}
