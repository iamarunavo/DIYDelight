import { pool } from './database.js';

async function updateDatabase() {
  try {
    console.log('Checking if cooler column exists...');

    // Check if the column already exists
    const checkResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='custom_pcs' AND column_name='cooler';
    `);

    if (checkResult.rows.length === 0) {
      console.log('Adding cooler column to custom_pcs table...');
      
      // Add cooler column if it doesn't exist
      await pool.query(`
        ALTER TABLE custom_pcs
        ADD COLUMN cooler INTEGER REFERENCES pc_components(id);
      `);
      
      console.log('Cooler column added successfully!');
    } else {
      console.log('Cooler column already exists. No changes made.');
    }
    
    // Update the pc_components type CHECK constraint to include 'cooler'
    console.log('Updating pc_components type constraint to include cooler...');
    
    await pool.query(`
      ALTER TABLE pc_components
      DROP CONSTRAINT IF EXISTS pc_components_type_check;
      
      ALTER TABLE pc_components
      ADD CONSTRAINT pc_components_type_check
      CHECK (type IN ('cpu', 'cooler', 'gpu', 'ram', 'storage', 'psu', 'case', 'motherboard'));
    `);
    
    console.log('Type constraint updated successfully!');
    
    // Add sample cooler components
    console.log('Adding sample cooler components...');
    
    await pool.query(`
      INSERT INTO pc_components (type, name, brand, price, specs, image_url) VALUES
      ('cooler', 'Kraken Z73 360mm AIO', 'NZXT', 249.99, '{"cooling_type": "Liquid", "tdp_rating": "360", "fan_rpm": "500-2000 RPM", "noise_level": "21-36 dBA"}', null),
      ('cooler', 'NH-D15 Dual Tower CPU Cooler', 'Noctua', 109.99, '{"cooling_type": "Air", "tdp_rating": "220", "fan_rpm": "300-1500 RPM", "noise_level": "19.2-24.6 dBA"}', null),
      ('cooler', 'H100i RGB Pro XT 240mm AIO', 'Corsair', 119.99, '{"cooling_type": "Liquid", "tdp_rating": "250", "fan_rpm": "400-2400 RPM", "noise_level": "10-37 dBA"}', null),
      ('cooler', 'Hyper 212 Black Edition', 'Cooler Master', 44.99, '{"cooling_type": "Air", "tdp_rating": "150", "fan_rpm": "650-2000 RPM", "noise_level": "8-27 dBA"}', null);
    `);
    
    console.log('Sample cooler components added successfully!');
    console.log('Database update completed successfully!');
  } catch (error) {
    console.error('Error updating database schema:', error);
  } finally {
    // Close the pool connection
    await pool.end();
  }
}

updateDatabase();