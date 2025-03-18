"use client";

import BusinessCard from "./business-card";
import { Search } from "lucide-react";
import { Input } from "../ui/input";

export default function BusinessList({
  businesses,
  selectedBusiness,
  onBusinessClick,
  searchQuery,
  onSearchChange,
}) {
  if (!businesses) return null;

  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Input
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-3">
          {filteredBusinesses.map((business) => (
            <BusinessCard
              key={business.place_id}
              business={business}
              isSelected={selectedBusiness?.place_id === business.place_id}
              onClick={() => onBusinessClick(business)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
