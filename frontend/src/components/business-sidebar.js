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
  Search,
  Map as MapIcon,
  Satellite,
  Mountain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Input } from "./ui/input";
import MapSearch from "./map-search";

const MAP_TYPES = [
  { id: "roadmap", name: "Road Map", icon: MapIcon },
  { id: "satellite", name: "Satellite", icon: Satellite },
  { id: "hybrid", name: "Hybrid", icon: Globe },
  { id: "terrain", name: "Terrain", icon: Mountain },
];

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
  onSelectLocation,
  onMapTypeChange,
  activeMapType,
}) {
  const [selectedType, setSelectedType] = useState("all");
  const [showNoWebsite, setShowNoWebsite] = useState(false);
  const [showNoReviews, setShowNoReviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
      const matchesSearch = searchQuery
        ? business.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesType && matchesWebsite && matchesReviews && matchesSearch;
    });
  }, [businesses, selectedType, showNoWebsite, showNoReviews, searchQuery]);

  if (!businesses && !isLoading) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-background/95 backdrop-blur-sm shadow-2xl border-l overflow-hidden z-20 transition-transform duration-300 ease-in-out flex flex-col">
      {/* Sticky Header */}
      <div className="p-4 border-b flex items-center justify-between bg-background/50 sticky top-0 z-30">
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

      {/* Search and Map Controls */}
      <div className="border-b p-4 space-y-4 bg-muted/30">
        <MapSearch onSelectLocation={onSelectLocation} />
        <div className="flex gap-2">
          {MAP_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                onClick={() => onMapTypeChange(type.id)}
                variant={activeMapType === type.id ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9"
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Filters */}
      <div className="border-b bg-muted/30">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full p-4 flex items-center justify-between text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
          {isFiltersOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isFiltersOpen && (
          <div className="p-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>

            {/* Category Select */}
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

            {/* Toggles */}
            <div className="flex flex-col gap-2">
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
        )}
      </div>

      {/* Business List */}
      <div className="overflow-y-auto flex-1">
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
                  className={`group relative overflow-hidden rounded-xl transition-all cursor-pointer hover:scale-[1.02] ${
                    isOpportunity
                      ? "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 shadow-orange-100/50 dark:shadow-orange-900/20"
                      : selectedBusiness?.place_id === business.place_id
                      ? "bg-gradient-to-br from-primary/10 to-primary/5 shadow-primary/20"
                      : "bg-gradient-to-br from-card to-card/50 hover:from-muted/50 hover:to-muted/30"
                  } shadow-lg backdrop-blur-sm`}
                  onClick={() => onBusinessClick(business)}
                >
                  <div className="p-4">
                    {/* Business Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {business.name}
                      </h4>
                      {business.price_level && (
                        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatPriceLevel(business.price_level)}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-3">
                      {/* Rating */}
                      <div>
                        {business.rating ? (
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(Math.round(business.rating))].map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className="h-4 w-4 text-yellow-500 fill-current"
                                  />
                                )
                              )}
                            </div>
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
                      <div className="flex flex-wrap gap-3">
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
                      <div className="flex flex-wrap gap-2">
                        {business.types?.slice(0, 3).map((type) => (
                          <span
                            key={type}
                            className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground font-medium"
                          >
                            {formatType(type)}
                          </span>
                        ))}
                        {business.types?.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground font-medium">
                            +{business.types.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Address & Map Link */}
                      <div className="space-y-2">
                        {business.address && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0 mt-1" />
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

                      {/* Reviews Accordion */}
                      {business.reviews && business.reviews.length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem
                            value="reviews"
                            className="border-none"
                          >
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
