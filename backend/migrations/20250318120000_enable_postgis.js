export async function up(knex) {
  // Enable PostGIS extension
  await knex.raw("CREATE EXTENSION IF NOT EXISTS postgis");
}

export async function down(knex) {
  // Drop PostGIS extension
  await knex.raw("DROP EXTENSION IF EXISTS postgis");
}
