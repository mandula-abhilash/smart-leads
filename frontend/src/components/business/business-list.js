"use client";

import BusinessCard from "./business-card";
import { Search, Store, Loader2 } from "lucide-react";
import { Input } from "../ui/input";

function BusinessListSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-card animate-pulse rounded-lg p-4 space-y-3">
          <div className="h-2 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <Store className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Businesses Found</h3>
      <p className="text-sm text-muted-foreground">
        There are no businesses in this area that match your criteria.
      </p>
    </div>
  );
}

export default function BusinessList({
  businesses,
  selectedBusiness,
  onBusinessClick,
  searchQuery,
  onSearchChange,
  isLoading,
}) {
  if (!businesses && !isLoading) return null;

  const filteredBusinesses = businesses?.filter((business) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-116px)]">
      {/* Search */}
      <div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="relative">
          <Input
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
          {isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <BusinessListSkeleton />
        ) : filteredBusinesses?.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-4 grid gap-3">
            {filteredBusinesses.map((business) => (
              <BusinessCard
                key={business.place_id}
                business={business}
                isSelected={selectedBusiness?.place_id === business.place_id}
                onClick={() => onBusinessClick(business)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
