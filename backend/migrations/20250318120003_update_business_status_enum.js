/*
  # Update business status enum constraint

  1. Changes
    - Drop existing status enum constraint
    - Add new status enum constraint with follow_up status
    - Maintain existing data integrity
*/

export async function up(knex) {
  await knex.raw(`
      ALTER TABLE vd_sw_businesses 
      DROP CONSTRAINT IF EXISTS vd_sw_businesses_status_check;
  
      ALTER TABLE vd_sw_businesses 
      ADD CONSTRAINT vd_sw_businesses_status_check 
      CHECK (status IN ('new', 'contacted', 'responded', 'converted', 'rejected', 'ignored', 'follow_up'));
    `);
}

export async function down(knex) {
  await knex.raw(`
      ALTER TABLE vd_sw_businesses 
      DROP CONSTRAINT IF EXISTS vd_sw_businesses_status_check;
  
      ALTER TABLE vd_sw_businesses 
      ADD CONSTRAINT vd_sw_businesses_status_check 
      CHECK (status IN ('new', 'contacted', 'responded', 'converted', 'rejected', 'ignored'));
    `);
}
