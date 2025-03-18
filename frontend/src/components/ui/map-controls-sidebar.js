"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import MapSearch from "./map-search";

const MAP_TYPES = [
  { id: "roadmap", name: "Road Map" },
  { id: "satellite", name: "Satellite" },
  { id: "hybrid", name: "Hybrid" },
  { id: "terrain", name: "Terrain" },
];

export default function MapControlsSidebar({
  onSelectLocation,
  onMapTypeChange,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-sm shadow-2xl border-r border-gray-200 overflow-hidden z-20 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-96" : "w-16"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-l-none rounded-r-xl shadow-lg border border-l-0 border-gray-200"
      >
        {isExpanded ? (
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        )}
      </button>

      <div className={`h-full ${isExpanded ? "block" : "hidden"}`}>
        <div className="p-4 border-b border-gray-200 bg-white/50">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Map Controls
          </h2>
          <MapSearch onSelectLocation={onSelectLocation} />
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Map Type
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {MAP_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => onMapTypeChange(type.id)}
                    className="w-full px-4 py-2 text-left rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <span className="text-gray-700">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
