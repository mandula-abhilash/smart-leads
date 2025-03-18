import db from "../db/index.js";

export async function createBusiness(businessData) {
  const {
    place_id,
    name,
    formatted_address,
    website,
    formatted_phone_number,
    rating,
    user_ratings_total,
    types,
    business_status,
    photos,
    icon,
    url,
    price_level,
    opening_hours,
    reviews,
    location,
    hexagon_id,
    opportunity_score,
    insights,
    priority,
    status = "new",
  } = businessData;

  // Ensure JSON fields are properly stringified
  const jsonData = {
    photos: Array.isArray(photos) ? JSON.stringify(photos) : null,
    opening_hours: opening_hours ? JSON.stringify(opening_hours) : null,
    reviews: Array.isArray(reviews) ? JSON.stringify(reviews) : null,
    insights: insights ? JSON.stringify(insights) : null,
  };

  // Check if business already exists
  const existingBusiness = await db("vd_sw_businesses")
    .where("place_id", place_id)
    .first();

  if (existingBusiness) {
    // Update existing business
    return db("vd_sw_businesses")
      .where("place_id", place_id)
      .update({
        name,
        formatted_address,
        website,
        formatted_phone_number,
        rating,
        user_ratings_total,
        types,
        business_status,
        photos: jsonData.photos,
        icon,
        url,
        price_level,
        opening_hours: jsonData.opening_hours,
        reviews: jsonData.reviews,
        geometry: db.raw("ST_SetSRID(ST_MakePoint(?, ?), 4326)", [
          location.lng,
          location.lat,
        ]),
        hexagon_id,
        opportunity_score,
        insights: jsonData.insights,
        priority,
        updated_at: db.fn.now(),
      })
      .returning("*");
  }

  // Create new business
  return db("vd_sw_businesses")
    .insert({
      place_id,
      name,
      formatted_address,
      website,
      formatted_phone_number,
      rating,
      user_ratings_total,
      types,
      business_status,
      photos: jsonData.photos,
      icon,
      url,
      price_level,
      opening_hours: jsonData.opening_hours,
      reviews: jsonData.reviews,
      geometry: db.raw("ST_SetSRID(ST_MakePoint(?, ?), 4326)", [
        location.lng,
        location.lat,
      ]),
      hexagon_id,
      opportunity_score,
      insights: jsonData.insights,
      priority,
      status,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning("*");
}

export async function getBusinessesByHexagon(hexagonId) {
  return db("vd_sw_businesses")
    .select(
      "*",
      db.raw("ST_X(geometry::geometry) as lng, ST_Y(geometry::geometry) as lat")
    )
    .where("hexagon_id", hexagonId)
    .then((businesses) =>
      businesses.map((business) => ({
        ...business,
        // Parse JSON fields
        photos: business.photos ? JSON.parse(business.photos) : null,
        opening_hours: business.opening_hours
          ? JSON.parse(business.opening_hours)
          : null,
        reviews: business.reviews ? JSON.parse(business.reviews) : null,
        insights: business.insights ? JSON.parse(business.insights) : null,
        location: {
          lat: parseFloat(business.lat),
          lng: parseFloat(business.lng),
        },
      }))
    );
}

export async function getBusinessById(placeId) {
  return db("vd_sw_businesses")
    .select(
      "*",
      db.raw("ST_X(geometry::geometry) as lng, ST_Y(geometry::geometry) as lat")
    )
    .where("place_id", placeId)
    .first()
    .then((business) =>
      business
        ? {
            ...business,
            // Parse JSON fields
            photos: business.photos ? JSON.parse(business.photos) : null,
            opening_hours: business.opening_hours
              ? JSON.parse(business.opening_hours)
              : null,
            reviews: business.reviews ? JSON.parse(business.reviews) : null,
            insights: business.insights ? JSON.parse(business.insights) : null,
            location: {
              lat: parseFloat(business.lat),
              lng: parseFloat(business.lng),
            },
          }
        : null
    );
}

export async function updateBusinessStatus(placeId, status) {
  return db("vd_sw_businesses").where("place_id", placeId).update({
    status,
    updated_at: db.fn.now(),
  });
}
