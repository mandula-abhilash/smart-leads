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
  } = businessData;

  return db("businesses")
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
      photos,
      icon,
      url,
      price_level,
      opening_hours,
      reviews,
      geometry: db.raw("ST_SetSRID(ST_MakePoint(?, ?), 4326)", [
        location.lng,
        location.lat,
      ]),
      hexagon_id,
      opportunity_score,
      insights,
      priority,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning("*");
}

export async function getBusinessesByHexagon(hexagonId) {
  return db("businesses")
    .select("*", db.raw("ST_AsGeoJSON(geometry) as geometry"))
    .where("hexagon_id", hexagonId);
}

export async function getBusinessById(placeId) {
  return db("businesses")
    .select("*", db.raw("ST_AsGeoJSON(geometry) as geometry"))
    .where("place_id", placeId)
    .first();
}

export async function updateBusinessStatus(placeId, status) {
  return db("businesses").where("place_id", placeId).update({
    status,
    updated_at: db.fn.now(),
  });
}
