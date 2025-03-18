import db from "../db/index.js";
import * as h3 from "h3-js";

export async function createHexagon(hexagonData) {
  const { hexagon_id, businesses_fetched, no_businesses_found } = hexagonData;

  // Calculate center from h3 index
  const [lat, lng] = h3.cellToLatLng(hexagon_id);
  const center = { lat, lng };

  // Calculate boundary for geometry
  const boundary = h3.cellToBoundary(hexagon_id);
  const polygonCoords = [...boundary, boundary[0]]; // Close the polygon by repeating first point
  const geojson = {
    type: "Polygon",
    coordinates: [polygonCoords.map(([lat, lng]) => [lng, lat])], // GeoJSON uses [lng, lat] order
  };

  return db("vd_sw_hexagons")
    .insert({
      hexagon_id,
      businesses_fetched,
      no_businesses_found,
      center,
      geometry: db.raw("ST_GeomFromGeoJSON(?)", [JSON.stringify(geojson)]),
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning("*");
}

export async function getHexagonById(hexagonId) {
  return db("vd_sw_hexagons")
    .select("*", db.raw("ST_AsGeoJSON(geometry) as geometry_json"))
    .where("hexagon_id", hexagonId)
    .first()
    .then((hexagon) => {
      if (!hexagon) return null;
      return {
        ...hexagon,
        geometry: hexagon.geometry_json
          ? JSON.parse(hexagon.geometry_json)
          : null,
      };
    });
}

export async function updateHexagonStatus(hexagonId, status) {
  return db("vd_sw_hexagons").where("hexagon_id", hexagonId).update({
    businesses_fetched: status.businesses_fetched,
    no_businesses_found: status.no_businesses_found,
    updated_at: db.fn.now(),
  });
}

export async function getAllHexagonIds() {
  const hexagons = await db("vd_sw_hexagons").select(
    "hexagon_id",
    "no_businesses_found"
  );

  const hexagonIds = [];
  const noBusinessHexagonIds = [];

  hexagons.forEach((hexagon) => {
    hexagonIds.push(hexagon.hexagon_id);
    if (hexagon.no_businesses_found) {
      noBusinessHexagonIds.push(hexagon.hexagon_id);
    }
  });

  return {
    hexagonIds,
    noBusinessHexagonIds,
  };
}
