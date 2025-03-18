"use client";

import { Star, AlertCircle } from "lucide-react";

function formatType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function BusinessCard({ business, isSelected, onClick }) {
  const { analysis, name, rating, user_ratings_total, types } = business;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg transition-all cursor-pointer hover:scale-[1.02] ${
        analysis.priority === "high"
          ? "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10"
          : analysis.priority === "medium"
          ? "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10"
          : isSelected
          ? "bg-gradient-to-br from-primary/10 to-primary/5"
          : "bg-gradient-to-br from-card to-card/50 hover:from-muted/50 hover:to-muted/30"
      } shadow-sm backdrop-blur-sm`}
    >
      <div className="p-3">
        {/* Opportunity Score */}
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className={`h-1 rounded-full ${
                analysis.opportunityScore > 70
                  ? "bg-green-600"
                  : analysis.opportunityScore > 40
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${analysis.opportunityScore}%` }}
            />
          </div>
        </div>

        {/* Business Name */}
        <h4 className="font-medium text-base group-hover:text-primary transition-colors mb-2 line-clamp-1">
          {name}
        </h4>

        {/* Rating */}
        <div className="mb-2">
          {rating ? (
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
              <span className="font-medium">{rating}</span>
              <span className="text-muted-foreground">
                ({user_ratings_total})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-orange-600">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>No Reviews</span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {types?.slice(0, 2).map((type) => (
            <span
              key={type}
              className="text-xs px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground"
            >
              {formatType(type)}
            </span>
          ))}
          {types?.length > 2 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
              +{types.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
