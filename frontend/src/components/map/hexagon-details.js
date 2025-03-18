"use client";

import { useState } from "react";
import { Hexagon, MapPin, Loader2 } from "lucide-react";
import BusinessStatus from "../business/business-status";
import FetchBusinessesButton from "./fetch-businesses-button";

function formatType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function HexagonDetails({
  hexagon,
  businesses,
  onFetchComplete,
  onBusinessStatusChange,
  isLoading,
}) {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchComplete = (data) => {
    setIsFetching(false);
    if (onFetchComplete) {
      onFetchComplete(data);
    }
  };

  const handleFetchStart = () => {
    setIsFetching(true);
    if (onFetchComplete) {
      // Clear existing data immediately
      onFetchComplete({
        hexagon,
        businesses: [],
        areaAnalysis: null,
      });
    }
  };

  if (!hexagon) return null;

  const showLoading = isLoading || isFetching;
  const showBusinesses = hexagon.businesses_fetched && businesses?.length > 0;
  const showNoBusinesses =
    hexagon.businesses_fetched && (!businesses || businesses.length === 0);
  const showFetchButton = !hexagon.businesses_fetched && !showLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Hexagon className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Hexagon Details</h2>
      </div>

      {/* Hexagon Info */}
      <div className="bg-muted/30 p-4 rounded-lg space-y-3">
        <div>
          <div className="text-sm text-muted-foreground">Hexagon ID</div>
          <div className="font-mono text-sm">{hexagon.hexagon_id}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="flex items-center gap-2">
            {showLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading businesses...</span>
              </>
            ) : showBusinesses ? (
              `${businesses.length} businesses found`
            ) : showNoBusinesses ? (
              "No businesses found"
            ) : (
              "Not yet fetched"
            )}
          </div>
        </div>
      </div>

      {/* Businesses List or Fetch Button */}
      {showBusinesses ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Businesses</h3>
          <div className="space-y-4">
            {businesses.map((business) => (
              <div
                key={business.place_id}
                className="bg-card p-4 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{business.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {business.types?.slice(0, 3).map((type) => (
                        <span
                          key={type}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {formatType(type)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <BusinessStatus
                    status={business.status}
                    placeId={business.place_id}
                    onStatusChange={onBusinessStatusChange}
                  />
                </div>

                {business.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 mt-1" />
                    <span>{business.address}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : showNoBusinesses ? (
        <div className="text-center p-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            No businesses found in this area
          </p>
        </div>
      ) : showFetchButton ? (
        <FetchBusinessesButton
          hexagonId={hexagon.hexagon_id}
          onFetchComplete={handleFetchComplete}
          onFetchStart={handleFetchStart}
        />
      ) : null}
    </div>
  );
}
