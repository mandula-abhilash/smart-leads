"use client";

import { Star, TrendingUp, AlertCircle, Globe, Phone } from "lucide-react";
import { Button } from "../ui/button";

function formatType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function calculateOnlinePresenceScore(business) {
  let score = 0;

  // Website presence
  if (business.website) score += 25;

  // Reviews count and quality
  if (business.user_ratings_total) {
    score += Math.min(25, business.user_ratings_total / 4); // Up to 25 points
    if (business.rating) {
      score += business.rating * 5; // Up to 25 points (5 * 5)
    }
  }

  // Photos presence
  if (business.photos?.length) {
    score += Math.min(15, business.photos.length * 2);
  }

  // Additional factors
  if (business.opening_hours) score += 5;
  if (business.phone) score += 5;

  return Math.min(100, Math.round(score));
}

function findCompetitors(selectedBusiness, allBusinesses) {
  if (!selectedBusiness || !allBusinesses) return [];

  // Filter businesses by matching at least one category
  const competitors = allBusinesses.filter(
    (business) =>
      business.place_id !== selectedBusiness.place_id && // Not the same business
      business.types.some((type) => selectedBusiness.types.includes(type)) // Shares at least one category
  );

  // Sort by better online presence (composite score)
  return competitors
    .sort((a, b) => {
      const aScore = calculateOnlinePresenceScore(a);
      const bScore = calculateOnlinePresenceScore(b);
      return bScore - aScore;
    })
    .slice(0, 3); // Top 3 competitors
}

export default function CompetitorAnalysis({ business, allBusinesses }) {
  if (!business || !allBusinesses) return null;

  const competitors = findCompetitors(business, allBusinesses);
  if (competitors.length === 0) return null;

  const businessScore = calculateOnlinePresenceScore(business);
  const competitorScores = competitors.map(calculateOnlinePresenceScore);
  const avgCompetitorScore = Math.round(
    competitorScores.reduce((a, b) => a + b, 0) / competitorScores.length
  );
  const bestCompetitorScore = Math.max(...competitorScores);

  const websiteGap = !business.website && competitors.some((c) => c.website);
  const ratingGap =
    Math.max(...competitors.map((c) => c.rating || 0)) - (business.rating || 0);
  const reviewsGap =
    Math.max(...competitors.map((c) => c.user_ratings_total || 0)) -
    (business.user_ratings_total || 0);

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-lg font-semibold">Competitor Analysis</h3>

      {/* Online Presence Score Comparison */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-3">Online Presence Score</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Your Business</span>
              <span className="font-medium">{businessScore}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${businessScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Best Competitor</span>
              <span className="font-medium">{bestCompetitorScore}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${bestCompetitorScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Average Competitor</span>
              <span className="font-medium">{avgCompetitorScore}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full bg-amber-500"
                style={{ width: `${avgCompetitorScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Areas for Improvement */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Areas for Improvement
        </h4>
        <div className="space-y-3">
          {websiteGap && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Missing Website</p>
                <p className="text-xs mt-1">
                  {competitors.filter((c) => c.website).length} out of{" "}
                  {competitors.length} competitors have websites. Having a
                  website can significantly improve your online presence.
                </p>
              </div>
            </div>
          )}

          {ratingGap > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/20">
              <Star className="h-4 w-4 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Lower Rating</p>
                <p className="text-xs mt-1">
                  Your rating is {ratingGap.toFixed(1)} points below the best
                  competitor. Focus on improving customer satisfaction to boost
                  your rating.
                </p>
              </div>
            </div>
          )}

          {reviewsGap > 10 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Fewer Reviews</p>
                <p className="text-xs mt-1">
                  You have {reviewsGap} fewer reviews than the leading
                  competitor. Encourage satisfied customers to leave reviews.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Competitors */}
      <div>
        <h4 className="text-sm font-medium mb-3">Top Competitors</h4>
        <div className="space-y-3">
          {competitors.map((competitor) => (
            <div
              key={competitor.place_id}
              className="p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-medium text-sm">{competitor.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs ml-1">
                        {competitor.rating || "N/A"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({competitor.user_ratings_total || 0} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {competitor.website && (
                    <a
                      href={competitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-accent"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {competitor.phone && (
                    <a
                      href={`tel:${competitor.phone}`}
                      className="p-1.5 rounded-md hover:bg-accent"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {competitor.types?.slice(0, 3).map((type) => (
                  <span
                    key={type}
                    className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {formatType(type)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div>
        <Button className="w-full">Generate Improvement Report</Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Get a detailed analysis and actionable steps to improve your online
          presence
        </p>
      </div>
    </div>
  );
}
