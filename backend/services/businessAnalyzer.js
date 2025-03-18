// Business opportunity scoring and analysis service
import ALLOWED_TYPES from "../constants/allowedTypes.js";

// Priority categories that are most valuable for business opportunities
const PRIORITY_CATEGORIES = [
  "restaurant",
  "cafe",
  "store",
  "beauty_salon",
  "hair_care",
  "gym",
  "hotel",
  "spa",
  "real_estate_agency",
  "shopping_mall",
];

// Categories that typically need strong web presence
const WEB_DEPENDENT_CATEGORIES = [
  "restaurant",
  "hotel",
  "real_estate_agency",
  "shopping_mall",
  "tourist_attraction",
  "store",
  "beauty_salon",
];

/**
 * Calculate opportunity score for a business
 * @param {Object} business - Business data from Google Places API
 * @returns {number} - Score from 0-100
 */
export function calculateOpportunityScore(business) {
  let score = 0;

  // No website is a major opportunity
  if (!business.website) {
    score += 30;
    // Extra points if the business type typically needs a web presence
    if (
      business.types.some((type) => WEB_DEPENDENT_CATEGORIES.includes(type))
    ) {
      score += 10;
    }
  }

  // No or few reviews indicates opportunity for improvement
  if (!business.reviews || business.reviews.length === 0) {
    score += 25;
  } else if (business.reviews.length < 5) {
    score += 15;
  }

  // Low rating but high review count indicates potential for improvement
  if (business.rating && business.user_ratings_total) {
    if (business.rating < 4.0 && business.user_ratings_total > 50) {
      score += 20;
    }
  }

  // No phone number is an opportunity
  if (!business.phone) {
    score += 15;
  }

  // High traffic/popular businesses
  const popularity =
    (business.rating || 0) * (business.user_ratings_total || 0);
  if (popularity > 1000) score += 20;
  else if (popularity > 500) score += 10;

  // Priority business categories
  if (business.types.some((type) => PRIORITY_CATEGORIES.includes(type))) {
    score += 10;
  }

  return Math.min(100, score); // Cap at 100
}

/**
 * Generate actionable insights for a business
 * @param {Object} business - Business data
 * @returns {Array} - List of insights
 */
export function generateInsights(business) {
  const insights = [];

  // Website-related insights
  if (!business.website) {
    insights.push({
      type: "website",
      priority: "high",
      message:
        "No website detected - prime candidate for web development services",
      action: "Offer website development",
    });
  }

  // Review-related insights
  if (!business.reviews || business.reviews.length === 0) {
    insights.push({
      type: "reviews",
      priority: "high",
      message: "No online reviews - needs reputation management",
      action: "Offer review management",
    });
  } else if (business.reviews.length < 5) {
    insights.push({
      type: "reviews",
      priority: "medium",
      message: "Limited online reviews - could benefit from review generation",
      action: "Propose review strategy",
    });
  }

  // Rating-related insights
  if (business.rating && business.rating < 4.0) {
    insights.push({
      type: "rating",
      priority: "high",
      message: `Low rating (${business.rating}) - needs reputation improvement`,
      action: "Offer reputation management",
    });
  }

  // Phone-related insights
  if (!business.phone) {
    insights.push({
      type: "contact",
      priority: "medium",
      message: "No phone number listed - may need better online presence",
      action: "Suggest contact management",
    });
  }

  // Business category specific insights
  if (
    business.types.some((type) => WEB_DEPENDENT_CATEGORIES.includes(type)) &&
    !business.website
  ) {
    insights.push({
      type: "industry",
      priority: "high",
      message: "Business type typically requires strong web presence",
      action: "Priority for web development",
    });
  }

  return insights;
}

/**
 * Analyze area statistics for a collection of businesses
 * @param {Array} businesses - List of businesses
 * @returns {Object} Area statistics
 */
export function analyzeArea(businesses) {
  const stats = {
    totalBusinesses: businesses.length,
    highOpportunity: 0,
    mediumOpportunity: 0,
    lowOpportunity: 0,
    noWebsite: 0,
    noReviews: 0,
    lowRating: 0,
    categoryBreakdown: {},
    averageRating: 0,
    totalReviews: 0,
  };

  let ratingSum = 0;
  let ratedBusinesses = 0;

  businesses.forEach((business) => {
    // Calculate opportunity level
    const score = calculateOpportunityScore(business);
    if (score > 70) stats.highOpportunity++;
    else if (score > 40) stats.mediumOpportunity++;
    else stats.lowOpportunity++;

    // Website stats
    if (!business.website) stats.noWebsite++;

    // Review stats
    if (!business.reviews || business.reviews.length === 0) stats.noReviews++;

    // Rating stats
    if (business.rating) {
      ratingSum += business.rating;
      ratedBusinesses++;
      if (business.rating < 4.0) stats.lowRating++;
    }

    // Category breakdown
    business.types.forEach((type) => {
      if (ALLOWED_TYPES.includes(type)) {
        stats.categoryBreakdown[type] =
          (stats.categoryBreakdown[type] || 0) + 1;
      }
    });

    // Total reviews
    stats.totalReviews += business.user_ratings_total || 0;
  });

  // Calculate average rating
  stats.averageRating = ratedBusinesses > 0 ? ratingSum / ratedBusinesses : 0;

  // Sort categories by frequency
  stats.topCategories = Object.entries(stats.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  return stats;
}

/**
 * Enrich business data with analysis
 * @param {Object} business - Business data
 * @returns {Object} Enriched business data
 */
export function enrichBusinessData(business) {
  return {
    ...business,
    analysis: {
      opportunityScore: calculateOpportunityScore(business),
      insights: generateInsights(business),
      priority:
        calculateOpportunityScore(business) > 70
          ? "high"
          : calculateOpportunityScore(business) > 40
          ? "medium"
          : "low",
    },
  };
}

/**
 * Process and analyze all businesses in an area
 * @param {Array} businesses - List of businesses
 * @returns {Object} Processed data with analysis
 */
export function processBusinesses(businesses) {
  const enrichedBusinesses = businesses
    .map(enrichBusinessData)
    .sort((a, b) => b.analysis.opportunityScore - a.analysis.opportunityScore);

  return {
    businesses: enrichedBusinesses,
    areaAnalysis: analyzeArea(businesses),
  };
}
