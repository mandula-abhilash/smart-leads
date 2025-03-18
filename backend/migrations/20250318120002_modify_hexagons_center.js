/*
  # Modify hexagons table center column

  1. Changes
    - Make center column nullable by removing not null constraint
    - Add default value of null

  2. Notes
    - This is a non-destructive change that maintains existing data
    - Allows hexagons to be created without center coordinates initially
*/

export async function up(knex) {
  await knex.schema.alterTable("vd_sw_hexagons", (table) => {
    // Drop the not null constraint and set default to null
    table.jsonb("center").alter().defaultTo(null);
  });
}

export async function down(knex) {
  await knex.schema.alterTable("vd_sw_hexagons", (table) => {
    // Restore the not null constraint
    table.jsonb("center").notNullable().alter();
  });
}
