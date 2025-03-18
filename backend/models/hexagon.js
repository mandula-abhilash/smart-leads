import db from "../db/index.js";

export async function createHexagon(hexagonData) {
  const { hexagon_id, geometry, center } = hexagonData;

  return db("hexagons")
    .insert({
      hexagon_id,
      geometry: db.raw("ST_GeomFromGeoJSON(?)", [JSON.stringify(geometry)]),
      center,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning("*");
}

export async function getHexagonById(hexagonId) {
  return db("hexagons").where("hexagon_id", hexagonId).first();
}

export async function updateHexagonStatus(hexagonId, status) {
  return db("hexagons").where("hexagon_id", hexagonId).update({
    businesses_fetched: status.businesses_fetched,
    no_businesses_found: status.no_businesses_found,
    updated_at: db.fn.now(),
  });
}

export async function getHexagonsInBounds(bounds) {
  const { north, south, east, west } = bounds;

  return db("hexagons")
    .select(
      "hexagon_id",
      "businesses_fetched",
      "no_businesses_found",
      db.raw("ST_AsGeoJSON(geometry) as geometry"),
      "center"
    )
    .whereRaw("ST_Intersects(geometry, ST_MakeEnvelope(?, ?, ?, ?, 4326))", [
      west,
      south,
      east,
      north,
    ]);
}
