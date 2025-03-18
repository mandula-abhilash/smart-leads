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

  // Ensure proper stringification of JSON fields
  const stringifyField = (field) => {
    if (!field) return null;
    if (typeof field === "string") return field; // Already a string
    return JSON.stringify(field);
  };

  const businessRecord = {
    place_id,
    name,
    formatted_address,
    website,
    formatted_phone_number,
    rating,
    user_ratings_total,
    types,
    business_status,
    photos: stringifyField(photos),
    icon,
    url,
    price_level,
    opening_hours: stringifyField(opening_hours),
    reviews: stringifyField(reviews),
    geometry: db.raw("ST_SetSRID(ST_MakePoint(?, ?), 4326)", [
      location.lng,
      location.lat,
    ]),
    hexagon_id,
    opportunity_score,
    insights: stringifyField(insights),
    priority,
    status,
  };

  // Check if business already exists
  const existingBusiness = await db("vd_sw_businesses")
    .where("place_id", place_id)
    .first();

  if (existingBusiness) {
    // Update existing business
    const [updated] = await db("vd_sw_businesses")
      .where("place_id", place_id)
      .update({
        ...businessRecord,
        updated_at: db.fn.now(),
      })
      .returning([
        "*",
        db.raw("ST_X(geometry::geometry) as lng"),
        db.raw("ST_Y(geometry::geometry) as lat"),
      ]);

    return [updated];
  }

  // Create new business
  return db("vd_sw_businesses")
    .insert({
      ...businessRecord,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning([
      "*",
      db.raw("ST_X(geometry::geometry) as lng"),
      db.raw("ST_Y(geometry::geometry) as lat"),
    ]);
}

export async function getBusinessesByHexagon(hexagonId) {
  return db("vd_sw_businesses")
    .select(
      "*",
      db.raw("ST_X(geometry::geometry) as lng"),
      db.raw("ST_Y(geometry::geometry) as lat")
    )
    .where("hexagon_id", hexagonId)
    .then((businesses) =>
      businesses.map((business) => {
        // Parse JSON fields safely
        const parseField = (field) => {
          if (!field) return null;
          try {
            // Check if already parsed
            if (typeof field === "object") return field;
            return JSON.parse(field);
          } catch (error) {
            console.error("Error parsing JSON field:", error);
            return null;
          }
        };

        // Extract lat/lng and create location object
        const lat = parseFloat(business.lat);
        const lng = parseFloat(business.lng);

        // Create a clean business object
        const cleanBusiness = {
          ...business,
          photos: parseField(business.photos),
          opening_hours: parseField(business.opening_hours),
          reviews: parseField(business.reviews),
          insights: parseField(business.insights),
          location: { lat, lng },
        };

        // Remove unnecessary fields
        delete cleanBusiness.lat;
        delete cleanBusiness.lng;
        delete cleanBusiness.geometry;

        return cleanBusiness;
      })
    );
}

export async function getBusinessById(placeId) {
  return db("vd_sw_businesses")
    .select(
      "*",
      db.raw("ST_X(geometry::geometry) as lng"),
      db.raw("ST_Y(geometry::geometry) as lat")
    )
    .where("place_id", placeId)
    .first()
    .then((business) => {
      if (!business) return null;

      // Parse JSON fields safely
      const parseField = (field) => {
        if (!field) return null;
        try {
          // Check if already parsed
          if (typeof field === "object") return field;
          return JSON.parse(field);
        } catch (error) {
          console.error("Error parsing JSON field:", error);
          return null;
        }
      };

      // Extract lat/lng and create location object
      const lat = parseFloat(business.lat);
      const lng = parseFloat(business.lng);

      // Create a clean business object
      const cleanBusiness = {
        ...business,
        photos: parseField(business.photos),
        opening_hours: parseField(business.opening_hours),
        reviews: parseField(business.reviews),
        insights: parseField(business.insights),
        location: { lat, lng },
      };

      // Remove unnecessary fields
      delete cleanBusiness.lat;
      delete cleanBusiness.lng;
      delete cleanBusiness.geometry;

      return cleanBusiness;
    });
}

export async function updateBusinessStatus(placeId, status) {
  return db("vd_sw_businesses").where("place_id", placeId).update({
    status,
    updated_at: db.fn.now(),
  });
}
