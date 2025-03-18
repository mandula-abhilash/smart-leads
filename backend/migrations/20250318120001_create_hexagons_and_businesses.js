export async function up(knex) {
  // Create hexagons table
  await knex.schema.createTable("vd_sw_hexagons", (table) => {
    table.increments("id").primary();
    table.string("hexagon_id").notNullable().unique();
    table.boolean("businesses_fetched").notNullable().defaultTo(false);
    table.boolean("no_businesses_found").notNullable().defaultTo(false);
    table.specificType("geometry", "geometry(Polygon,4326)");
    table.jsonb("center").notNullable(); // Store center coordinates as {lat, lng}
    table.timestamps(true, true);

    // Add spatial index
    table.index(["geometry"], "idx_vd_sw_hexagons_geometry", "GIST");
  });

  // Create businesses table
  await knex.schema.createTable("vd_sw_businesses", (table) => {
    table.increments("id").primary();
    table.string("place_id").notNullable().unique();
    table.string("name").notNullable();
    table.string("formatted_address");
    table.string("website");
    table.string("formatted_phone_number");
    table.decimal("rating", 2, 1);
    table.integer("user_ratings_total");
    table.specificType("types", "text[]");
    table.string("business_status");
    table.jsonb("photos"); // Store photo references
    table.string("icon");
    table.string("url"); // Google Maps URL
    table.integer("price_level");
    table.jsonb("opening_hours");
    table.jsonb("reviews");
    table.specificType("geometry", "geometry(Point,4326)").notNullable();

    // Analysis fields
    table.integer("opportunity_score");
    table.jsonb("insights");
    table.enu("priority", ["high", "medium", "low"]).defaultTo("low");

    // Status tracking
    table
      .enu("status", [
        "new",
        "contacted",
        "responded",
        "converted",
        "rejected",
        "ignored",
      ])
      .defaultTo("new");

    // Timestamps and foreign key
    table.string("hexagon_id").notNullable();
    table
      .foreign("hexagon_id")
      .references("hexagon_id")
      .inTable("vd_sw_hexagons")
      .onDelete("CASCADE");
    table.timestamps(true, true);

    // Add spatial index
    table.index(["geometry"], "idx_vd_sw_businesses_geometry", "GIST");
    // Add index for common queries
    table.index(["status", "priority"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("vd_sw_businesses");
  await knex.schema.dropTableIfExists("vd_sw_hexagons");
}
