"use client";

import { useState } from "react";
import { Hexagon, MapPin, Loader2, TrendingUp } from "lucide-react";
import FetchBusinessesButton from "./fetch-businesses-button";
import { useBusinessContext } from "@/contexts/BusinessContext";

function formatType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function HexagonDetailsSkeleton() {
  return (
    <div className="animate-pulse h-[calc(100vh-116px)] bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-4 bg-muted rounded w-32" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-800 p-4 rounded-lg space-y-3 shadow-md"
            >
              <div className="flex justify-between">
                <div className="h-5 bg-muted rounded w-40" />
                <div className="h-5 bg-muted rounded w-24" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-[calc(100vh-116px)] flex flex-col items-center justify-center p-4 text-center bg-zinc-50/50 dark:bg-zinc-900/50">
      <Hexagon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Select a Hexagon</h3>
      <p className="text-sm text-muted-foreground">
        Click on a hexagon on the map to view businesses in that area
      </p>
    </div>
  );
}

function BusinessCard({ business, isSelected, onClick }) {
  if (!business || !business.analysis) return null;

  return (
    <div
      className={`bg-white dark:bg-zinc-800 p-4 rounded-lg transition-all hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-lg relative ${
        isSelected ? "opacity-50" : ""
      }`}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <div>
        <h4 className="font-medium hover:text-primary transition-colors mb-2">
          {business.name}
        </h4>

        {/* Categories and Score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-1 flex-1 mr-3">
            {business.types?.slice(0, 3).map((type) => (
              <span
                key={type}
                className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-muted-foreground"
              >
                {formatType(type)}
              </span>
            ))}
            {business.types?.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-muted-foreground">
                +{business.types.length - 3}
              </span>
            )}
          </div>
          <span
            className={`text-sm font-medium whitespace-nowrap ${
              business.analysis.opportunityScore > 70
                ? "text-green-600"
                : business.analysis.opportunityScore > 40
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {business.analysis.opportunityScore}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              business.analysis.opportunityScore > 70
                ? "bg-green-600"
                : business.analysis.opportunityScore > 40
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${business.analysis.opportunityScore}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function HexagonDetails({
  hexagon,
  businesses,
  isLoading,
  onBusinessClick,
}) {
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);

  const handleBusinessClick = (business) => {
    setSelectedBusinessId(business.place_id);
    setTimeout(() => {
      onBusinessClick(business);
      setSelectedBusinessId(null);
    }, 300);
  };

  if (!hexagon) return <EmptyState />;

  const showLoading = isLoading;
  const showBusinesses = hexagon.businesses_fetched && businesses?.length > 0;
  const showNoBusinesses =
    hexagon.businesses_fetched && (!businesses || businesses.length === 0);
  const showFetchButton = !hexagon.businesses_fetched && !showLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-116px)] bg-zinc-50/50 dark:bg-zinc-900/50">
      {showLoading ? (
        <HexagonDetailsSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="p-6 border-b bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
            <div className="text-base font-semibold mb-2">
              {showBusinesses
                ? `${businesses.length} Businesses Found`
                : showNoBusinesses
                ? "No Businesses Found"
                : "Fetching Businesses..."}
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              <div className="flex items-center">
                <Hexagon className="h-4 w-4 mr-2 text-primary" />
                {hexagon.hexagon_id}
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Businesses List or Fetch Button */}
              {showBusinesses ? (
                <div className="space-y-4">
                  {businesses.map((business) => (
                    <BusinessCard
                      key={business.place_id}
                      business={business}
                      isSelected={selectedBusinessId === business.place_id}
                      onClick={() => handleBusinessClick(business)}
                    />
                  ))}
                </div>
              ) : showNoBusinesses ? (
                <div className="text-center p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
                  <p className="text-muted-foreground">
                    No businesses found in this area
                  </p>
                </div>
              ) : showFetchButton ? (
                <FetchBusinessesButton hexagonId={hexagon.hexagon_id} />
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
