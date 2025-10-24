import { pool } from './database.js';

async function resetDatabase() {
  try {
    // Drop existing tables if they exist
    await pool.query(`
      DROP TABLE IF EXISTS custom_pcs CASCADE;
      DROP TABLE IF EXISTS pc_components CASCADE;
    `);

    console.log('Dropped existing tables');

    // Create pc_components table
    await pool.query(`
      CREATE TABLE pc_components (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('cpu', 'gpu', 'ram', 'storage', 'psu', 'case', 'motherboard')),
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        specs JSONB NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Created pc_components table');

    // Create custom_pcs table
    await pool.query(`
      CREATE TABLE custom_pcs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cpu INTEGER REFERENCES pc_components(id),
        motherboard INTEGER REFERENCES pc_components(id),
        gpu INTEGER REFERENCES pc_components(id),
        ram INTEGER REFERENCES pc_components(id),
        storage INTEGER REFERENCES pc_components(id),
        case_type INTEGER REFERENCES pc_components(id),
        psu INTEGER REFERENCES pc_components(id),
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Created custom_pcs table');

    // Insert sample CPU components
    await pool.query(`
      INSERT INTO pc_components (type, name, brand, price, specs, image_url) VALUES
      ('cpu', 'Ryzen 9 7950X', 'AMD', 699.99, '{"cores": 16, "threads": 32, "base_clock": "4.5 GHz", "boost_clock": "5.7 GHz", "tdp": 170, "socket": "AM5"}', null),
      ('cpu', 'Core i9-13900K', 'Intel', 589.99, '{"cores": 24, "threads": 32, "base_clock": "3.0 GHz", "boost_clock": "5.8 GHz", "tdp": 125, "socket": "LGA1700"}', null),
      ('cpu', 'Ryzen 7 7700X', 'AMD', 399.99, '{"cores": 8, "threads": 16, "base_clock": "4.5 GHz", "boost_clock": "5.4 GHz", "tdp": 105, "socket": "AM5"}', null),
      ('cpu', 'Core i5-13600K', 'Intel', 319.99, '{"cores": 14, "threads": 20, "base_clock": "3.5 GHz", "boost_clock": "5.1 GHz", "tdp": 125, "socket": "LGA1700"}', null);
    `);
    console.log('Inserted CPU components');

    // Insert sample GPU components
    await pool.query(`
      INSERT INTO pc_components (type, name, brand, price, specs, image_url) VALUES
      ('gpu', 'RTX 4090', 'NVIDIA', 1599.99, '{"memory": "24GB GDDR6X", "boost_clock": "2.52 GHz", "tdp": 450, "rtx": true}', null),
      ('gpu', 'RX 7900 XTX', 'AMD', 999.99, '{"memory": "24GB GDDR6", "boost_clock": "2.5 GHz", "tdp": 355, "rtx": false}', null),
      ('gpu', 'RTX 4070 Ti', 'NVIDIA', 799.99, '{"memory": "12GB GDDR6X", "boost_clock": "2.61 GHz", "tdp": 285, "rtx": true}', null),
      ('gpu', 'RX 6800 XT', 'AMD', 579.99, '{"memory": "16GB GDDR6", "boost_clock": "2.25 GHz", "tdp": 300, "rtx": false}', null);
    `);
    console.log('Inserted GPU components');

    // Insert sample RAM components
    await pool.query(`
      INSERT INTO pc_components (type, name, brand, price, specs, image_url) VALUES
      ('ram', 'Vengeance RGB DDR5 64GB', 'Corsair', 339.99, '{"capacity": "64GB", "speed": "6000MHz", "latency": "CL36", "compatibleWith": "AM5"}', null),
      ('ram', 'Trident Z5 RGB DDR5 32GB', 'G.Skill', 179.99, '{"capacity": "32GB", "speed": "6400MHz", "latency": "CL32", "compatibleWith": "LGA1700"}', null),
      ('ram', 'Fury Beast DDR5 32GB', 'Kingston', 154.99, '{"capacity": "32GB", "speed": "5600MHz", "latency": "CL40", "compatibleWith": "AM5"}', null),
      ('ram', 'Ripjaws S5 DDR5 32GB', 'G.Skill', 134.99, '{"capacity": "32GB", "speed": "5200MHz", "latency": "CL42", "compatibleWith": "LGA1700"}', null);
    `);
    console.log('Inserted RAM components');

    // Insert sample Storage components
    await pool.query(`
      INSERT INTO pc_components (type, name, brand, price, specs, image_url) VALUES
      ('storage', '980 PRO 2TB NVMe SSD', 'Samsung', 179.99, '{"capacity": "2TB", "type": "NVMe", "read_speed": "7000 MB/s", "write_speed": "5100 MB/s"}', null),
      ('storage', 'FireCuda 530 2TB NVMe SSD', 'Seagate', 239.99, '{"capacity": "2TB", "type": "NVMe", "read_speed": "7300 MB/s", "write_speed": "6900 MB/s"}', null),
      ('storage', 'SN850X 1TB NVMe SSD', 'Western Digital', 139.99, '{"capacity": "1TB", "type": "NVMe", "read_speed": "7300 MB/s", "write_speed": "6300 MB/s"}', null),
      ('storage', 'MP600 PRO XT 2TB NVMe SSD', 'Corsair', 219.99, '{"capacity": "2TB", "type": "NVMe", "read_speed": "7100 MB/s", "write_speed": "6800 MB/s"}', null);
    `);
    console.log('Inserted Storage components');

    // Insert sample PSU components
    await pool.query(`
      INSERT INTO pc_components (type, name, brand, price, specs, image_url) VALUES
      ('psu', 'RM1000x 1000W 80+ Gold', 'Corsair', 189.99, '{"wattage": 1000, "certification": "80+ Gold", "modularity": "Full"}', null),
      ('psu', 'SuperNOVA 850 G7 850W 80+ Gold', 'EVGA', 149.99, '{"wattage": 850, "certification": "80+ Gold", "modularity": "Full"}', null),
      ('psu', 'ROG Thor 1200P 1200W 80+ Platinum', 'ASUS', 329.99, '{"wattage": 1200, "certification": "80+ Platinum", "modularity": "Full"}', null),
      ('psu', 'Focus GX-750 750W 80+ Gold', 'Seasonic', 129.99, '{"wattage": 750, "certification": "80+ Gold", "modularity": "Full"}', null);
    `);
    console.log('Inserted PSU components');

    // Insert sample Case components
    await pool.query(`
      INSERT INTO pc_components (type, name, brand, price, specs, image_url) VALUES
      ('case', '5000D AIRFLOW', 'Corsair', 174.99, '{"size": "Mid Tower", "color": "Black", "material": "Steel, Tempered Glass"}', null),
      ('case', 'H510 Flow', 'NZXT', 89.99, '{"size": "Mid Tower", "color": "White", "material": "Steel, Tempered Glass"}', null),
      ('case', 'O11 Dynamic EVO', 'Lian Li', 169.99, '{"size": "Mid Tower", "color": "Black", "material": "Aluminum, Tempered Glass"}', null),
      ('case', 'Torrent', 'Fractal Design', 189.99, '{"size": "Mid Tower", "color": "Black", "material": "Steel, Tempered Glass"}', null);
    `);
    console.log('Inserted Case components');

    // Insert sample Motherboard components
    await pool.query(`
      INSERT INTO pc_components (type, name, brand, price, specs, image_url) VALUES
      ('motherboard', 'ROG Strix Z790-E Gaming WiFi', 'ASUS', 399.99, '{"chipset": "Intel Z790", "socket": "LGA 1700", "memory_type": "DDR5", "pcie_version": "5.0"}', null),
      ('motherboard', 'MPG B650 Gaming Edge WiFi', 'MSI', 259.99, '{"chipset": "AMD B650", "socket": "AM5", "memory_type": "DDR5", "pcie_version": "4.0"}', null),
      ('motherboard', 'Z690 AORUS MASTER', 'Gigabyte', 389.99, '{"chipset": "Intel Z690", "socket": "LGA 1700", "memory_type": "DDR5", "pcie_version": "5.0"}', null),
      ('motherboard', 'B550M Pro4', 'ASRock', 114.99, '{"chipset": "AMD B550", "socket": "AM4", "memory_type": "DDR4", "pcie_version": "4.0"}', null);
    `);
    console.log('Inserted Motherboard components');

    console.log('Database reset successful!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    pool.end();
  }
}

// Run the reset function
resetDatabase();
