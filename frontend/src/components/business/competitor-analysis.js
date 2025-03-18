"use client";

import {
  Star,
  TrendingUp,
  AlertCircle,
  Globe,
  Phone,
  BarChart2,
  Award,
  Users,
  Image,
} from "lucide-react";
import { Button } from "../ui/button";

function formatType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function calculateOnlinePresenceScore(business) {
  let score = 0;
  let maxScore = 0;
  let breakdown = {};

  // Website presence (30 points max)
  maxScore += 30;
  if (business.website) {
    const isComplete = business.website.includes(
      business.name.toLowerCase().replace(/\s+/g, "")
    );
    score += 30; // Base points for having a website
    breakdown.website = {
      score: 30,
      maxScore: 30,
      details: "Has a business website",
    };
  } else {
    breakdown.website = {
      score: 0,
      maxScore: 30,
      details: "No website found",
    };
  }

  // Reviews and Rating (35 points max)
  maxScore += 35;
  let reviewScore = 0;
  if (business.user_ratings_total && business.rating) {
    // Rating quality (15 points max)
    const ratingScore = Math.min(15, business.rating * 3);
    reviewScore += ratingScore;

    // Review quantity (20 points max)
    // Scale: 0-10 reviews (5pts), 11-50 reviews (10pts), 51-100 reviews (15pts), 100+ reviews (20pts)
    let quantityScore = 0;
    if (business.user_ratings_total >= 100) quantityScore = 20;
    else if (business.user_ratings_total >= 51) quantityScore = 15;
    else if (business.user_ratings_total >= 11) quantityScore = 10;
    else if (business.user_ratings_total > 0) quantityScore = 5;

    reviewScore += quantityScore;
    score += reviewScore;

    breakdown.reviews = {
      score: reviewScore,
      maxScore: 35,
      details: `${business.rating}★ rating with ${business.user_ratings_total} reviews`,
    };
  } else {
    breakdown.reviews = {
      score: 0,
      maxScore: 35,
      details: "No reviews or rating",
    };
  }

  // Photos (15 points max)
  maxScore += 15;
  if (business.photos?.length) {
    const photoScore = Math.min(15, business.photos.length * 3);
    score += photoScore;
    breakdown.photos = {
      score: photoScore,
      maxScore: 15,
      details: `${business.photos.length} photos available`,
    };
  } else {
    breakdown.photos = {
      score: 0,
      maxScore: 15,
      details: "No photos found",
    };
  }

  // Contact Information (20 points max)
  maxScore += 20;
  let contactScore = 0;
  let contactDetails = [];

  if (business.phone) {
    contactScore += 10;
    contactDetails.push("phone number");
  }
  if (business.address) {
    contactScore += 5;
    contactDetails.push("address");
  }
  if (business.opening_hours) {
    contactScore += 5;
    contactDetails.push("business hours");
  }

  score += contactScore;
  breakdown.contact = {
    score: contactScore,
    maxScore: 20,
    details: contactDetails.length
      ? `Has ${contactDetails.join(", ")}`
      : "Limited contact information",
  };

  // Calculate final percentage
  const finalScore = Math.round((score / maxScore) * 100);

  return {
    score: finalScore,
    breakdown: breakdown,
    totalScore: score,
    maxPossibleScore: maxScore,
  };
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
      const aScore = calculateOnlinePresenceScore(a).score;
      const bScore = calculateOnlinePresenceScore(b).score;
      return bScore - aScore;
    })
    .slice(0, 3); // Top 3 competitors
}

export default function CompetitorAnalysis({ business, allBusinesses }) {
  if (!business || !allBusinesses) return null;

  const competitors = findCompetitors(business, allBusinesses);
  if (competitors.length === 0) return null;

  const businessScoreData = calculateOnlinePresenceScore(business);
  const businessScore = businessScoreData.score;
  const competitorScores = competitors.map(
    (comp) => calculateOnlinePresenceScore(comp).score
  );
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
      <div className="rounded-lg bg-muted/30">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          Online Presence Score
        </h4>
        <div className="space-y-4 p-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Your Business</span>
              <span className="font-medium">{businessScore}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${businessScore}%` }}
              />
            </div>
            {/* Score Breakdown */}
            <div className="mt-3 space-y-2">
              {Object.entries(businessScoreData.breakdown).map(
                ([key, data]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 bg-muted/50 p-2 rounded-md"
                  >
                    {key === "website" && (
                      <Globe className="h-4 w-4 shrink-0" />
                    )}
                    {key === "reviews" && <Star className="h-4 w-4 shrink-0" />}
                    {key === "photos" && <Image className="h-4 w-4 shrink-0" />}
                    {key === "contact" && (
                      <Phone className="h-4 w-4 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium capitalize">{key}</span>
                        <span>
                          {data.score}/{data.maxScore}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {data.details}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Best Competitor</span>
              </div>
              <span className="font-medium">{bestCompetitorScore}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-600"
                style={{ width: `${bestCompetitorScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Average Competitor</span>
              </div>
              <span className="font-medium">{avgCompetitorScore}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2">
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
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
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
        <h4 className="text-sm font-semibold mb-3">Top Competitors</h4>
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
