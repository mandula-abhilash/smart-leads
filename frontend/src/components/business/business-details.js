"use client";

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
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import CompetitorAnalysis from "./competitor-analysis";

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
    <div className="h-screen overflow-y-auto animate-pulse">
      <div className="sticky top-0 z-10 bg-background/50 backdrop-blur-sm border-b p-6">
        <div className="h-8 bg-muted rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="h-6 bg-muted rounded w-32"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30">
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
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <Store className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Select a Business</h3>
      <p className="text-sm text-muted-foreground">
        Click on a business from the list to view its details
      </p>
    </div>
  );
}

export default function BusinessDetails({ business, isLoading, businesses }) {
  if (isLoading) {
    return <BusinessDetailsSkeleton />;
  }

  if (!business) {
    return <EmptyState />;
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background/50 backdrop-blur-sm border-b p-6">
        <h2 className="text-2xl font-semibold">{business.name}</h2>
        {business.address && (
          <div className="flex items-start gap-2 text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 shrink-0 mt-1" />
            <span>{business.address}</span>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="text-sm text-muted-foreground mb-1">
              Opportunity Score
            </div>
            <div className="text-2xl font-semibold">
              {business.analysis.opportunityScore}%
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="text-sm text-muted-foreground mb-1">Rating</div>
            <div className="text-2xl font-semibold flex items-center gap-2">
              {business.rating || "N/A"}
              {business.rating && (
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              )}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Key Insights</h3>
          <div className="space-y-3">
            {business.analysis.insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  insight.priority === "high"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/20"
                    : insight.priority === "medium"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/20"
                }`}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">{insight.message}</p>
                  <p className="text-xs opacity-80">Action: {insight.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
          <div className="space-y-3">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>{business.phone}</span>
              </a>
            )}
            {business.website ? (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="truncate">{business.website}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <LinkIcon className="h-4 w-4" />
                <span>No Website</span>
              </div>
            )}
            <a
              href={business.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span>View on Google Maps</span>
            </a>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {business.types?.map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                >
                  {formatType(type)}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {business.reviews && business.reviews.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Reviews</h3>
              <div className="space-y-3">
                {business.reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/30 p-4 rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        by {review.author_name}
                      </span>
                    </div>
                    <p className="text-sm">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Competitor Analysis */}
        <CompetitorAnalysis business={business} allBusinesses={businesses} />
      </div>
    </div>
  );
}
