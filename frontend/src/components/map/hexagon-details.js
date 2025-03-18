"use client";

import { useState } from "react";
import { Hexagon, MapPin, Loader2, TrendingUp } from "lucide-react";
import BusinessStatus from "../business/business-status";
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
    <div className="animate-pulse h-[calc(100vh-116px)]">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-muted rounded" />
          <div className="h-8 bg-muted rounded w-48" />
        </div>

        <div className="bg-muted/30 p-4 rounded-lg space-y-3 shadow-md">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-48" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-4 rounded-lg space-y-3 shadow-md">
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
    <div className="h-[calc(100vh-116px)] flex flex-col items-center justify-center p-4 text-center">
      <Hexagon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Select a Hexagon</h3>
      <p className="text-sm text-muted-foreground">
        Click on a hexagon on the map to view businesses in that area
      </p>
    </div>
  );
}

export default function HexagonDetails({ hexagon, businesses, isLoading }) {
  const { setSelectedBusiness, updateBusinessStatus } = useBusinessContext();

  if (!hexagon) return <EmptyState />;

  const showLoading = isLoading;
  const showBusinesses = hexagon.businesses_fetched && businesses?.length > 0;
  const showNoBusinesses =
    hexagon.businesses_fetched && (!businesses || businesses.length === 0);
  const showFetchButton = !hexagon.businesses_fetched && !showLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-116px)]">
      {showLoading ? (
        <HexagonDetailsSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="p-6 border-b bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Hexagon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Hexagon Details</h2>
            </div>

            {/* Hexagon Info */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-3 shadow-md">
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
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Businesses List or Fetch Button */}
              {showBusinesses ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Businesses</h3>
                  <div className="space-y-4">
                    {businesses.map((business) => (
                      <div
                        key={business.place_id}
                        className="bg-card p-4 rounded-lg space-y-3 transition-all hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-lg"
                        onClick={() => setSelectedBusiness(business)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium hover:text-primary transition-colors">
                              {business.name}
                            </h4>
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
                            onStatusChange={updateBusinessStatus}
                          />
                        </div>

                        {/* Opportunity Score */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <TrendingUp className="h-4 w-4" />
                              <span>Opportunity Score</span>
                            </div>
                            <span
                              className={`text-sm font-medium ${
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
                          <div className="w-full bg-muted/50 rounded-full h-1.5">
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
                    ))}
                  </div>
                </div>
              ) : showNoBusinesses ? (
                <div className="text-center p-8 bg-muted/30 rounded-lg shadow-md">
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
