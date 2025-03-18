"use client";

import { useState, useMemo } from "react";
import {
  X,
  Star,
  Globe,
  MapPin,
  Clock,
  Phone,
  Link as LinkIcon,
  DollarSign,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Switch } from "./switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

function formatType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatPriceLevel(level) {
  return level ? "$".repeat(level) : "N/A";
}

export default function BusinessSidebar({
  businesses,
  isLoading,
  onClose,
  selectedBusiness,
  onBusinessClick,
}) {
  const [selectedType, setSelectedType] = useState("all");
  const [showNoWebsite, setShowNoWebsite] = useState(false);
  const [showNoReviews, setShowNoReviews] = useState(false);

  const businessTypes = useMemo(() => {
    if (!businesses || businesses.length === 0) return ["all"];
    const types = new Set();
    businesses.forEach((business) => {
      if (business.types && Array.isArray(business.types)) {
        business.types.forEach((type) => types.add(type));
      }
    });
    return ["all", ...Array.from(types)].sort();
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    if (!businesses || businesses.length === 0) return [];
    return businesses.filter((business) => {
      if (!business) return false;
      const matchesType =
        selectedType === "all" ||
        (business.types && business.types.includes(selectedType));
      const matchesWebsite = !showNoWebsite || !business.website;
      const matchesReviews =
        !showNoReviews || !(business.reviews && business.reviews.length > 0);
      return matchesType && matchesWebsite && matchesReviews;
    });
  }, [businesses, selectedType, showNoWebsite, showNoReviews]);

  if (!businesses && !isLoading) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-background/95 backdrop-blur-sm shadow-2xl border-l overflow-hidden z-20 transition-transform duration-300 ease-in-out">
      <div className="p-4 border-b flex items-center justify-between bg-background/50">
        <h2 className="text-xl font-semibold">
          {isLoading
            ? "Loading..."
            : `${filteredBusinesses.length} Businesses Found`}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="border-b p-4 bg-muted/50">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All Categories" : formatType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Show only without website</Label>
            <Switch
              checked={showNoWebsite}
              onCheckedChange={setShowNoWebsite}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Show only without reviews</Label>
            <Switch
              checked={showNoReviews}
              onCheckedChange={setShowNoReviews}
            />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-240px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredBusinesses.map((business) => (
              <div
                key={business.place_id}
                className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  !business.website || !business.reviews?.length
                    ? "border-warning bg-warning/5"
                    : selectedBusiness?.place_id === business.place_id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/20"
                }`}
                onClick={() => onBusinessClick(business)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{business.name}</h4>
                  {(!business.website || !business.reviews?.length) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning-foreground">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Opportunity
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {business.types?.map((type) => (
                    <span
                      key={type}
                      className="text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {formatType(type)}
                    </span>
                  ))}
                </div>

                {business.rating ? (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {business.rating}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({business.user_ratings_total} reviews)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mb-3 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">No Reviews</span>
                  </div>
                )}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm">
                      Business Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {business.price_level !== undefined && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatPriceLevel(business.price_level)}
                            </span>
                          </div>
                        )}

                        {business.business_status && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm capitalize">
                              {business.business_status
                                .toLowerCase()
                                .replace(/_/g, " ")}
                            </span>
                          </div>
                        )}

                        {business.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{business.address}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {business.phone ? (
                            <a
                              href={`tel:${business.phone}`}
                              className="text-sm text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {business.phone}
                            </a>
                          ) : (
                            <span className="text-sm text-destructive">
                              Phone Not Available
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          {business.website ? (
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit Website
                            </a>
                          ) : (
                            <span className="text-sm text-destructive">
                              Website Not Available
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={
                              business.google_maps_url ||
                              `https://www.google.com/maps/place/?q=place_id:${business.place_id}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View on Maps
                          </a>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {business.reviews && business.reviews.length > 0 && (
                    <AccordionItem value="reviews">
                      <AccordionTrigger className="text-sm">
                        Recent Reviews ({business.reviews.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {business.reviews.slice(0, 3).map((review, idx) => (
                            <div
                              key={`${business.place_id}-review-${idx}`}
                              className="text-sm bg-muted/50 p-3 rounded-md"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="font-medium">
                                  {review.rating}
                                </span>
                                <span className="text-muted-foreground">
                                  by {review.author_name}
                                </span>
                              </div>
                              <p className="text-sm line-clamp-2">
                                {review.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
