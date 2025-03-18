"use client";

import { Hexagon } from "lucide-react";

export default function HexagonMarker({
  isSelected,
  isFetched,
  noBusinesses,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? "scale-125" : "hover:scale-110 hover:shadow-lg hover:z-10"
      }`}
    >
      <Hexagon
        className={`h-8 w-8 ${
          isSelected
            ? "text-primary fill-primary/20"
            : isFetched
            ? noBusinesses
              ? "text-gray-400 fill-gray-100"
              : "text-green-500 fill-green-100"
            : "text-blue-500 fill-blue-100"
        } transition-colors duration-200`}
      />
    </div>
  );
}
