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
        geometry: db.raw("ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)", {
          lng: location.lng,
          lat: location.lat,
        }),
        hexagon_id,
        opportunity_score,
        insights: jsonData.insights,
        priority,
        updated_at: db.fn.now(),
      })
      .returning([
        "*",
        db.raw("ST_X(geometry) as lng"),
        db.raw("ST_Y(geometry) as lat"),
      ]);
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
      geometry: db.raw("ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)", {
        lng: location.lng,
        lat: location.lat,
      }),
      hexagon_id,
      opportunity_score,
      insights: jsonData.insights,
      priority,
      status,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning([
      "*",
      db.raw("ST_X(geometry) as lng"),
      db.raw("ST_Y(geometry) as lat"),
    ]);
}

export async function getBusinessesByHexagon(hexagonId) {
  return db("vd_sw_businesses")
    .select([
      "*",
      db.raw("ST_X(geometry) as lng"),
      db.raw("ST_Y(geometry) as lat"),
    ])
    .where("hexagon_id", hexagonId)
    .then((businesses) =>
      businesses.map((business) => {
        // Parse JSON fields safely
        const safeParseJSON = (str) => {
          if (!str) return null;
          try {
            return JSON.parse(str);
          } catch (error) {
            console.error("Error parsing JSON field:", error);
            return null;
          }
        };

        // Extract lat/lng from geometry
        const lat = parseFloat(business.lat);
        const lng = parseFloat(business.lng);

        return {
          ...business,
          photos: safeParseJSON(business.photos),
          opening_hours: safeParseJSON(business.opening_hours),
          reviews: safeParseJSON(business.reviews),
          insights: safeParseJSON(business.insights),
          location: {
            lat,
            lng,
          },
        };
      })
    );
}

export async function getBusinessById(placeId) {
  return db("vd_sw_businesses")
    .select([
      "*",
      db.raw("ST_X(geometry) as lng"),
      db.raw("ST_Y(geometry) as lat"),
    ])
    .where("place_id", placeId)
    .first()
    .then((business) => {
      if (!business) return null;

      // Extract lat/lng from geometry
      const lat = parseFloat(business.lat);
      const lng = parseFloat(business.lng);

      return {
        ...business,
        photos: business.photos ? JSON.parse(business.photos) : null,
        opening_hours: business.opening_hours
          ? JSON.parse(business.opening_hours)
          : null,
        reviews: business.reviews ? JSON.parse(business.reviews) : null,
        insights: business.insights ? JSON.parse(business.insights) : null,
        location: {
          lat,
          lng,
        },
      };
    });
}

export async function updateBusinessStatus(placeId, status) {
  return db("vd_sw_businesses")
    .where("place_id", placeId)
    .update({
      status,
      updated_at: db.fn.now(),
    })
    .returning([
      "*",
      db.raw("ST_X(geometry) as lng"),
      db.raw("ST_Y(geometry) as lat"),
    ])
    .then((results) => {
      const business = results[0];
      if (!business) return null;

      return {
        ...business,
        location: {
          lat: parseFloat(business.lat),
          lng: parseFloat(business.lng),
        },
      };
    });
}
