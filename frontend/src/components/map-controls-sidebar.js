"use client";

import { useState } from "react";
import {
  CircleChevronLeft,
  CircleChevronRight,
  Map as MapIcon,
  Satellite,
  Mountain,
  Globe,
} from "lucide-react";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import MapSearch from "./map-search";

const MAP_TYPES = [
  { id: "roadmap", name: "Road Map", icon: MapIcon },
  { id: "satellite", name: "Satellite", icon: Satellite },
  { id: "hybrid", name: "Hybrid", icon: Globe },
  { id: "terrain", name: "Terrain", icon: Mountain },
];

export default function MapControlsSidebar({
  onSelectLocation,
  onMapTypeChange,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeMapType, setActiveMapType] = useState("hybrid");

  const handleMapTypeChange = (typeId) => {
    setActiveMapType(typeId);
    onMapTypeChange(typeId);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-sm shadow-lg border-r border-gray-200 overflow-visible z-20 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-80" : "w-16"
      }`}
    >
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        size="icon"
        className="absolute right-0 translate-x-1/2 top-4 rounded-full w-8 h-8 bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-900 cursor-pointer z-30"
      >
        {isExpanded ? (
          <CircleChevronLeft className="h-6 w-6" />
        ) : (
          <CircleChevronRight className="h-6 w-6" />
        )}
      </Button>

      <div className={`h-full flex flex-col ${isExpanded ? "px-4" : "px-2"}`}>
        <div className="py-4 flex-shrink-0">
          {isExpanded && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Search Location
              </h2>
              <MapSearch onSelectLocation={onSelectLocation} />
            </>
          )}
        </div>

        <div
          className={`flex ${
            isExpanded ? "flex-col gap-2" : "flex-col items-center gap-4"
          } mt-4`}
        >
          {MAP_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <HoverCard key={type.id}>
                <HoverCardTrigger asChild>
                  <Button
                    onClick={() => handleMapTypeChange(type.id)}
                    variant={activeMapType === type.id ? "secondary" : "ghost"}
                    className={`
                      w-full cursor-pointer
                      ${isExpanded ? "justify-start gap-3" : "h-10 w-10 p-0"}
                    `}
                  >
                    <Icon
                      className={`
                      ${isExpanded ? "h-5 w-5" : "h-5 w-5"}
                    `}
                    />
                    {isExpanded && <span>{type.name}</span>}
                  </Button>
                </HoverCardTrigger>
                {!isExpanded && (
                  <HoverCardContent side="right" align="start" className="p-2">
                    <p className="text-sm font-medium">{type.name}</p>
                  </HoverCardContent>
                )}
              </HoverCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
