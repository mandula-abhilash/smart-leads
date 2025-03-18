"use client";

import { useState, useMemo } from "react";
import {
  X,
  Star,
  Globe,
  MapPin,
  Phone,
  Link as LinkIcon,
  DollarSign,
  AlertCircle,
  Filter,
  Tags,
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-muted"
        >
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
            <Label className="text-muted-foreground">Category</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="focus:ring-0 focus:ring-offset-0">
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
            <Label className="cursor-pointer text-muted-foreground">
              Show only without website
            </Label>
            <Switch
              checked={showNoWebsite}
              onCheckedChange={setShowNoWebsite}
              className="focus:ring-0 focus:ring-offset-0"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="cursor-pointer text-muted-foreground">
              Show only without reviews
            </Label>
            <Switch
              checked={showNoReviews}
              onCheckedChange={setShowNoReviews}
              className="focus:ring-0 focus:ring-offset-0"
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
            {filteredBusinesses.map((business) => {
              const isOpportunity =
                !business.website || !business.reviews?.length;
              return (
                <div
                  key={business.place_id}
                  className={`group relative overflow-hidden rounded-xl transition-all cursor-pointer hover:shadow-lg ${
                    isOpportunity
                      ? "bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-100/50"
                      : selectedBusiness?.place_id === business.place_id
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "bg-card hover:bg-muted/50"
                  }`}
                  onClick={() => onBusinessClick(business)}
                >
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-lg group-hover:text-primary transition-colors">
                        {business.name}
                      </h4>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Rating */}
                      <div className="col-span-2">
                        {business.rating ? (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">
                              {business.rating}
                            </span>
                            <span className="text-muted-foreground">
                              ({business.user_ratings_total} reviews)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>No Reviews</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Links */}
                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-4 w-4" />
                          <span className="truncate">{business.phone}</span>
                        </a>
                      )}
                      {business.website ? (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-4 w-4" />
                          <span>Website</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-600">
                          <LinkIcon className="h-4 w-4" />
                          <span>No Website</span>
                        </div>
                      )}
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1">
                      {business.types?.slice(0, 3).map((type) => (
                        <span
                          key={type}
                          className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                        >
                          {formatType(type)}
                        </span>
                      ))}
                      {business.types?.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">
                          +{business.types.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Address and Maps Link */}
                    <div className="space-y-2">
                      {business.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{business.address}</span>
                        </div>
                      )}
                      <a
                        href={
                          business.google_maps_url ||
                          `https://www.google.com/maps/place/?q=place_id:${business.place_id}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="h-4 w-4" />
                        View on Google Maps
                      </a>
                    </div>

                    {/* Reviews Section */}
                    {business.reviews && business.reviews.length > 0 && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="reviews" className="border-none">
                          <AccordionTrigger className="py-0 hover:no-underline">
                            <span className="flex items-center gap-2 text-sm font-normal text-muted-foreground hover:text-foreground transition-colors">
                              <Star className="h-4 w-4" />
                              Recent Reviews ({business.reviews.length})
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 mt-2">
                              {business.reviews
                                .slice(0, 3)
                                .map((review, idx) => (
                                  <div
                                    key={`${business.place_id}-review-${idx}`}
                                    className="bg-muted/30 p-3 rounded-lg space-y-1"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        <span className="font-medium">
                                          {review.rating}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
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
                      </Accordion>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
