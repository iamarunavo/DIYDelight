import { pool } from './database.js';

async function checkDatabaseSetup() {
  try {
    console.log('Checking database structure...');

    // Check if pc_components table exists
    const componentTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pc_components'
      );
    `);

    if (!componentTableCheck.rows[0].exists) {
      console.error('pc_components table does not exist!');
      return false;
    }

    // Check if custom_pcs table exists
    const pcsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'custom_pcs'
      );
    `);

    if (!pcsTableCheck.rows[0].exists) {
      console.error('custom_pcs table does not exist!');
      return false;
    }

    // Check if motherboard column exists in custom_pcs
    const motherboardColumnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='custom_pcs' AND column_name='motherboard';
    `);

    if (motherboardColumnCheck.rows.length === 0) {
      console.error('motherboard column missing from custom_pcs table!');
      
      // Add the column if it doesn't exist
      console.log('Adding motherboard column...');
      await pool.query(`
        ALTER TABLE custom_pcs
        ADD COLUMN motherboard INTEGER REFERENCES pc_components(id);
      `);
      console.log('motherboard column added successfully');
    } else {
      console.log('motherboard column exists');
    }

    // Check for required component types
    const componentTypes = ['cpu', 'motherboard', 'gpu', 'ram', 'storage', 'psu', 'case'];
    for (const type of componentTypes) {
      const result = await pool.query('SELECT COUNT(*) FROM pc_components WHERE type = $1', [type]);
      console.log(`${type}: ${result.rows[0].count} components found`);
      
      if (parseInt(result.rows[0].count) === 0) {
        console.error(`No ${type} components found in database!`);
      }
    }

    console.log('Database check complete');
    return true;
  } catch (error) {
    console.error('Error checking database setup:', error);
    return false;
  } finally {
    // Don't close the pool here as it might be needed for other operations
  }
}

// Run the check
checkDatabaseSetup()
  .then((result) => {
    console.log('Database check result:', result ? 'OK' : 'FAILED');
  })
  .catch((error) => {
    console.error('Database check failed with error:', error);
  });