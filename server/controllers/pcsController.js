import { pool } from '../config/database.js';

/**
 * Get all PCs
 */
export const getAllPCs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM custom_pcs ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching all PCs:', error);
    res.status(500).json({ message: 'Server error while fetching PCs' });
  }
};

/**
 * Get a specific PC by ID
 */
export const getPC = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Get the basic PC info
    const pcResult = await pool.query('SELECT * FROM custom_pcs WHERE id = $1', [id]);
    
    if (pcResult.rows.length === 0) {
      return res.status(404).json({ message: `PC with ID ${id} not found` });
    }
    
    const pc = pcResult.rows[0];
    
    // Get component details
    const componentDetails = {};
    
    // Get CPU details
    if (pc.cpu) {
      const cpuResult = await pool.query('SELECT * FROM pc_components WHERE id = $1', [pc.cpu]);
      if (cpuResult.rows.length > 0) {
        componentDetails.cpu_details = cpuResult.rows[0];
      }
    }
    
    // Get cooler details
    if (pc.cooler) {
      const coolerResult = await pool.query('SELECT * FROM pc_components WHERE id = $1', [pc.cooler]);
      if (coolerResult.rows.length > 0) {
        componentDetails.cooler_details = coolerResult.rows[0];
      }
    }
    
    // Get motherboard details
    if (pc.motherboard) {
      const mbResult = await pool.query('SELECT * FROM pc_components WHERE id = $1', [pc.motherboard]);
      if (mbResult.rows.length > 0) {
        componentDetails.motherboard_details = mbResult.rows[0];
      }
    }
    
    // Get GPU details
    if (pc.gpu) {
      const gpuResult = await pool.query('SELECT * FROM pc_components WHERE id = $1', [pc.gpu]);
      if (gpuResult.rows.length > 0) {
        componentDetails.gpu_details = gpuResult.rows[0];
      }
    }
    
    // Get RAM details
    if (pc.ram) {
      const ramResult = await pool.query('SELECT * FROM pc_components WHERE id = $1', [pc.ram]);
      if (ramResult.rows.length > 0) {
        componentDetails.ram_details = ramResult.rows[0];
      }
    }
    
    // Get storage details
    if (pc.storage) {
      const storageResult = await pool.query('SELECT * FROM pc_components WHERE id = $1', [pc.storage]);
      if (storageResult.rows.length > 0) {
        componentDetails.storage_details = storageResult.rows[0];
      }
    }
    
    // Get case details
    if (pc.case_type) {
      const caseResult = await pool.query('SELECT * FROM pc_components WHERE id = $1', [pc.case_type]);
      if (caseResult.rows.length > 0) {
        componentDetails.case_details = caseResult.rows[0];
      }
    }
    
    // Get PSU details
    if (pc.psu) {
      const psuResult = await pool.query('SELECT * FROM pc_components WHERE id = $1', [pc.psu]);
      if (psuResult.rows.length > 0) {
        componentDetails.psu_details = psuResult.rows[0];
      }
    }
    
    // Combine PC and component details
    const pcWithDetails = {
      ...pc,
      ...componentDetails
    };
    
    res.status(200).json(pcWithDetails);
  } catch (error) {
    console.error(`Error fetching PC with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error while fetching PC' });
  }
};

/**
 * Create a new PC
 */
export const createPC = async (req, res) => {
  try {
    const { 
      name, 
      cpu,
      cooler,
      motherboard,
      gpu, 
      ram, 
      storage, 
      case_type, 
      psu,
      price,
      image_url = null // Default to null if not provided
    } = req.body;

    // Check for compatibility
    const isCompatible = await checkCompatibility(cpu, motherboard, gpu, ram, psu);
    
    if (!isCompatible.compatible) {
      return res.status(400).json({ message: isCompatible.message });
    }
    
    try {
      // First check if all columns exist
      const columnsExist = await pool.query(`
        SELECT 
          EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_pcs' AND column_name = 'motherboard') as has_motherboard
      `);

      let result;
      
      // Check if cooler column exists
      const coolerColumnExists = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='custom_pcs' AND column_name='cooler';
      `);
      
      const hasCoolerColumn = coolerColumnExists.rows.length > 0;
      
      if (columnsExist.rows[0].has_motherboard && hasCoolerColumn) {
        // If both motherboard and cooler columns exist
        result = await pool.query(
          `INSERT INTO custom_pcs (name, cpu, cooler, motherboard, gpu, ram, storage, case_type, psu, price, image_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
           RETURNING *`,
          [name, cpu, cooler, motherboard, gpu, ram, storage, case_type, psu, price, image_url]
        );
      } else if (columnsExist.rows[0].has_motherboard) {
        // If only motherboard column exists
        result = await pool.query(
          `INSERT INTO custom_pcs (name, cpu, motherboard, gpu, ram, storage, case_type, psu, price, image_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
           RETURNING *`,
          [name, cpu, motherboard, gpu, ram, storage, case_type, psu, price, image_url]
        );
      } else {
        // If neither motherboard nor cooler column exists
        result = await pool.query(
          `INSERT INTO custom_pcs (name, cpu, gpu, ram, storage, case_type, psu, price, image_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           RETURNING *`,
          [name, cpu, gpu, ram, storage, case_type, psu, price, image_url]
        );
      }
      
      if (result.rows && result.rows.length > 0) {
        res.status(201).json(result.rows[0]);
      } else {
        throw new Error('Failed to create PC entry');
      }
    } catch (insertError) {
      console.error('Error inserting PC into database:', insertError);
      res.status(500).json({ message: 'Database error while creating PC: ' + insertError.message });
    }
  } catch (error) {
    console.error('Error creating PC:', error);
    res.status(500).json({ message: 'Server error while creating PC' });
  }
};

/**
 * Update an existing PC
 */
export const updatePC = async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      name, 
      cpu,
      cooler,
      motherboard,
      gpu, 
      ram, 
      storage, 
      case_type, 
      psu,
      price,
      image_url
    } = req.body;
    
    // Check if PC exists
    const checkResult = await pool.query('SELECT * FROM custom_pcs WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: `PC with ID ${id} not found` });
    }
    
    // Check for compatibility
    const isCompatible = await checkCompatibility(cpu, motherboard, gpu, ram, psu);
    
    if (!isCompatible.compatible) {
      return res.status(400).json({ message: isCompatible.message });
    }
    
    // First check if motherboard column exists
    const columnsExist = await pool.query(`
      SELECT 
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_pcs' AND column_name = 'motherboard') as has_motherboard
    `);
    
    let result;
    
    // Check if cooler column exists
    const coolerColumnExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='custom_pcs' AND column_name='cooler';
    `);
    
    const hasCoolerColumn = coolerColumnExists.rows.length > 0;
    
    if (columnsExist.rows[0].has_motherboard && hasCoolerColumn) {
      // If both motherboard and cooler columns exist
      result = await pool.query(
        `UPDATE custom_pcs 
         SET name = $1, cpu = $2, cooler = $3, motherboard = $4, gpu = $5, ram = $6, storage = $7, 
             case_type = $8, psu = $9, price = $10, image_url = $11, updated_at = NOW()
         WHERE id = $12 
         RETURNING *`,
        [name, cpu, cooler, motherboard, gpu, ram, storage, case_type, psu, price, image_url, id]
      );
    } else if (columnsExist.rows[0].has_motherboard) {
      // If only motherboard column exists
      result = await pool.query(
        `UPDATE custom_pcs 
         SET name = $1, cpu = $2, motherboard = $3, gpu = $4, ram = $5, storage = $6, 
             case_type = $7, psu = $8, price = $9, image_url = $10, updated_at = NOW()
         WHERE id = $11 
         RETURNING *`,
        [name, cpu, motherboard, gpu, ram, storage, case_type, psu, price, image_url, id]
      );
    } else {
      // If neither motherboard nor cooler column exists
      result = await pool.query(
        `UPDATE custom_pcs 
         SET name = $1, cpu = $2, gpu = $3, ram = $4, storage = $5, 
             case_type = $6, psu = $7, price = $8, image_url = $9, updated_at = NOW()
         WHERE id = $10 
         RETURNING *`,
        [name, cpu, gpu, ram, storage, case_type, psu, price, image_url, id]
      );
    }
  
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating PC with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error while updating PC' });
  }
};

/**
 * Delete a PC
 */
export const deletePC = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if PC exists
    const checkResult = await pool.query('SELECT * FROM custom_pcs WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: `PC with ID ${id} not found` });
    }
    
    await pool.query('DELETE FROM custom_pcs WHERE id = $1', [id]);
    
    res.status(200).json({ message: `PC with ID ${id} successfully deleted` });
  } catch (error) {
    console.error(`Error deleting PC with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error while deleting PC' });
  }
};

/**
 * Get all components by type
 */
export const getComponents = async (req, res) => {
  try {
    const componentType = req.params.type;
    const validTypes = ['cpu', 'cooler', 'gpu', 'ram', 'storage', 'psu', 'case', 'motherboard'];
    
    if (!validTypes.includes(componentType)) {
      return res.status(400).json({ message: `Invalid component type: ${componentType}` });
    }
    
    const result = await pool.query(`SELECT * FROM pc_components WHERE type = $1`, [componentType]);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error fetching ${req.params.type} components:`, error);
    res.status(500).json({ message: `Server error while fetching ${req.params.type} components` });
  }
};

/**
 * Helper function to check PC part compatibility
 */
const checkCompatibility = async (cpu, motherboard, gpu, ram, psu) => {
  try {
    // Validate inputs first
    if (!cpu || !motherboard || !gpu || !ram || !psu) {
      return { compatible: false, message: 'Missing component IDs' };
    }
    
    // Get component details
    const cpuResult = await pool.query('SELECT * FROM pc_components WHERE id = $1 AND type = $2', [cpu, 'cpu']);
    const motherboardResult = await pool.query('SELECT * FROM pc_components WHERE id = $1 AND type = $2', [motherboard, 'motherboard']);
    const gpuResult = await pool.query('SELECT * FROM pc_components WHERE id = $1 AND type = $2', [gpu, 'gpu']);
    const ramResult = await pool.query('SELECT * FROM pc_components WHERE id = $1 AND type = $2', [ram, 'ram']);
    const psuResult = await pool.query('SELECT * FROM pc_components WHERE id = $1 AND type = $2', [psu, 'psu']);
    
    if (cpuResult.rows.length === 0 || motherboardResult.rows.length === 0 || gpuResult.rows.length === 0 || 
        ramResult.rows.length === 0 || psuResult.rows.length === 0) {
      return { compatible: false, message: 'One or more components not found' };
    }
    
    const cpuDetails = cpuResult.rows[0];
    const gpuDetails = gpuResult.rows[0];
    const psuDetails = psuResult.rows[0];
    
    // Check PSU wattage is sufficient for CPU + GPU
    const cpuTDP = cpuDetails.specs.tdp || 0;
    const gpuTDP = gpuDetails.specs.tdp || 0;
    const totalPowerNeeded = cpuTDP + gpuTDP + 100; // Adding 100W buffer for other components
    
    if (psuDetails.specs.wattage < totalPowerNeeded) {
      return { 
        compatible: false, 
        message: `Power supply insufficient (${psuDetails.specs.wattage}W). System needs at least ${totalPowerNeeded}W.` 
      };
    }
    
    // Check CPU and RAM compatibility
    const ramDetails = ramResult.rows[0];
    
    // Skip the compatibility check if either the RAM or CPU doesn't have the necessary specs
    if (ramDetails.specs && ramDetails.specs.compatibleWith && cpuDetails.specs && cpuDetails.specs.socket) {
      try {
        // Check if RAM is compatible with the CPU socket
        // compatibleWith could be a single value or an array
        const compatibleSockets = Array.isArray(ramDetails.specs.compatibleWith) 
          ? ramDetails.specs.compatibleWith 
          : [ramDetails.specs.compatibleWith];
        
        if (!compatibleSockets.includes(cpuDetails.specs.socket)) {
          return {
            compatible: false,
            message: `RAM is not compatible with the selected CPU socket type`
          };
        }
      } catch (err) {
        console.error('Error checking RAM compatibility:', err);
        // Rather than failing, just log the error and continue
      }
    }
    
    return { compatible: true };
  } catch (error) {
    console.error('Error checking compatibility:', error);
    return { compatible: false, message: 'Error checking component compatibility' };
  }
};

export default {
  getAllPCs,
  getPC,
  createPC,
  updatePC,
  deletePC,
  getComponents
};