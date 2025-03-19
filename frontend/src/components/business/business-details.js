"use client";

import { useState } from "react";
import {
  Star,
  Globe,
  MapPin,
  Phone,
  Link as LinkIcon,
  DollarSign,
  AlertCircle,
  Store,
  Loader2,
  TrendingUp,
  BarChart3,
  Tag,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import BusinessStatus from "./business-status";
import { useBusinessContext } from "@/contexts/BusinessContext";

function formatPriceLevel(level) {
  return level ? "$".repeat(level) : "N/A";
}

function formatType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function BusinessDetailsSkeleton() {
  return (
    <div className="animate-pulse bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b p-4">
        <div className="h-8 bg-muted rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>

      <div className="p-4 space-y-4">
        {/* Score Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 space-y-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-4 bg-muted rounded w-12"></div>
          </div>
          <div className="h-2 bg-muted rounded w-full"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-white dark:bg-zinc-800 shadow-md"
            >
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Insights Skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded w-32"></div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-white dark:bg-zinc-800 shadow-md"
            >
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-50/50 dark:bg-zinc-900/50">
      <Store className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Select a Business</h3>
      <p className="text-sm text-muted-foreground">
        Click on a business from the list to view its details
      </p>
    </div>
  );
}

export default function BusinessDetails({ business, isLoading, businesses }) {
  const { updateBusinessStatus } = useBusinessContext();

  if (isLoading) {
    return <BusinessDetailsSkeleton />;
  }

  if (!business || !business.analysis) {
    return <EmptyState />;
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50 business-details">
      {/* Sticky Header - Business Name Only */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b p-4">
        <h2 className="text-lg font-semibold">{business.name}</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Categories and Status Button */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {business.types?.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
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
          </div>

          {/* Opportunity Score */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Opportunity Score</span>
              <span
                className={`text-sm font-semibold ${
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
            <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  business.analysis.opportunityScore > 70
                    ? "bg-green-600"
                    : business.analysis.opportunityScore > 40
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${business.analysis.opportunityScore}%` }}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-md space-y-3">
            <h3 className="text-sm font-medium mb-2">Contact Information</h3>
            <div className="space-y-2">
              {business.formatted_phone_number && (
                <a
                  href={`tel:${business.formatted_phone_number}`}
                  className="flex items-center gap-2 p-2 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors text-sm"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{business.formatted_phone_number}</span>
                </a>
              )}
              {business.website ? (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors text-sm"
                >
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="truncate">{business.website}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-md bg-orange-500/5 text-orange-600 text-sm">
                  <LinkIcon className="h-4 w-4" />
                  <span>No Website</span>
                </div>
              )}
              <a
                href={business.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors text-sm"
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span>View on Google Maps</span>
              </a>
            </div>
          </div>

          {/* Rating & Reviews */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium mb-3">Rating & Reviews</h3>
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold">
                {business.rating || "N/A"}
              </div>
              {business.rating && (
                <div className="flex">
                  {[...Array(Math.round(business.rating))].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
              )}
              <span className="text-sm text-muted-foreground">
                ({business.user_ratings_total || 0} reviews)
              </span>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium mb-3">Key Insights</h3>
            <div className="space-y-2">
              {business.analysis.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-3 rounded-md text-sm ${
                    insight.priority === "high"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/20"
                      : insight.priority === "medium"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-950/20"
                  }`}
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{insight.message}</p>
                    <p className="text-xs mt-1 opacity-80">
                      Action: {insight.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {business.reviews && business.reviews.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-medium mb-3">Recent Reviews</h3>
              <div className="space-y-3">
                {business.reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-700/50 p-3 rounded-md space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {review.rating}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        by {review.author_name}
                      </span>
                    </div>
                    <p className="text-xs">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
