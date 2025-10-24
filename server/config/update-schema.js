import { pool } from './database.js';

async function updateDatabase() {
  try {
    console.log('Checking if motherboard column exists...');

    // Check if the column already exists
    const checkResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='custom_pcs' AND column_name='motherboard';
    `);

    if (checkResult.rows.length === 0) {
      console.log('Adding motherboard column to custom_pcs table...');
      
      // Add motherboard column if it doesn't exist
      await pool.query(`
        ALTER TABLE custom_pcs
        ADD COLUMN motherboard INTEGER REFERENCES pc_components(id);
      `);
      
      console.log('Motherboard column added successfully!');
    } else {
      console.log('Motherboard column already exists. No changes made.');
    }
    
    console.log('Database update completed successfully!');
  } catch (error) {
    console.error('Error updating database schema:', error);
  } finally {
    // Close the pool connection
    await pool.end();
  }
}

updateDatabase();