"use client";

import {
  X,
  Star,
  Globe,
  MapPin,
  Clock,
  Phone,
  Link,
  DollarSign,
  AlertCircle,
} from "lucide-react";

function groupBusinessesByType(businesses) {
  const groups = {};

  businesses?.forEach((business) => {
    business.types.forEach((type) => {
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(business);
    });
  });

  return Object.entries(groups)
    .map(([type, businesses]) => ({
      type,
      businesses,
      count: businesses.length,
    }))
    .sort((a, b) => b.count - a.count);
}

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
  if (!businesses && !isLoading) return null;

  const groupedBusinesses = groupBusinessesByType(businesses);

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white/95 backdrop-blur-sm shadow-2xl border-l border-gray-200 overflow-hidden z-20 transition-transform duration-300 ease-in-out">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white/50">
        <h2 className="text-xl font-semibold text-gray-900">
          {isLoading
            ? "Loading..."
            : `${businesses?.length || 0} Businesses Found`}
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-64px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="p-4">
            {groupedBusinesses.map(({ type, businesses }) => (
              <div key={type} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatType(type)}
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {businesses.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {businesses.map((business) => (
                    <div
                      key={`${type}-${business.place_id}`}
                      className={`p-4 rounded-xl shadow-lg border transition-all cursor-pointer ${
                        !business.website || !business.reviews?.length
                          ? "border-amber-200 bg-amber-50/50"
                          : selectedBusiness?.place_id === business.place_id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-100 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() => onBusinessClick(business)}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {business.name}
                        </h4>
                        {(!business.website || !business.reviews?.length) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Opportunity
                          </span>
                        )}
                      </div>

                      {business.rating ? (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            {business.rating}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({business.user_ratings_total} reviews)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mb-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">No Reviews</span>
                        </div>
                      )}

                      {business.price_level !== undefined && (
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {formatPriceLevel(business.price_level)}
                          </span>
                        </div>
                      )}

                      {business.business_status && (
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700 capitalize">
                            {business.business_status
                              .toLowerCase()
                              .replace(/_/g, " ")}
                          </span>
                        </div>
                      )}

                      {business.address && (
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {business.address}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          {business.phone ? (
                            <a
                              href={`tel:${business.phone}`}
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {business.phone}
                            </a>
                          ) : (
                            <span className="text-sm text-red-600">
                              Phone Not Available
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-gray-500" />
                          {business.website ? (
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit Website
                            </a>
                          ) : (
                            <span className="text-sm text-red-600">
                              Website Not Available
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <a
                            href={
                              business.google_maps_url ||
                              `https://www.google.com/maps/place/?q=place_id:${business.place_id}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View on Maps
                          </a>
                        </div>
                      </div>

                      {business.reviews && business.reviews.length > 0 && (
                        <details className="mt-4">
                          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                            Recent Reviews ({business.reviews.length})
                          </summary>
                          <div className="mt-3 space-y-3 bg-gray-50 p-3 rounded-lg">
                            {business.reviews.slice(0, 3).map((review, idx) => (
                              <div
                                key={`${business.place_id}-review-${idx}`}
                                className="text-sm bg-white p-3 rounded-md shadow-sm"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="font-medium">
                                    {review.rating}
                                  </span>
                                  <span className="text-gray-500">
                                    by {review.author_name}
                                  </span>
                                </div>
                                <p className="text-gray-600 line-clamp-2">
                                  {review.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
