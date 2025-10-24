/**
 * PCsAPI.jsx - Service for interacting with the PC customization API
 * Part of the PC FORGE Design System
 */

const API_URL = '/api';

/**
 * Get all custom PCs
 * @returns {Promise<Array>} Array of custom PC objects
 */
export const getAllPCs = async () => {
  try {
    const response = await fetch(`${API_URL}/pcs`);
    
    if (!response.ok) {
      throw new Error(`Error fetching PCs: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch PCs:', error);
    throw error;
  }
};

/**
 * Get a specific PC by ID
 * @param {string|number} id - The PC ID
 * @returns {Promise<Object>} PC object
 */
export const getPC = async (id) => {
  try {
    const response = await fetch(`${API_URL}/pcs/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching PC with ID ${id}: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch PC with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new custom PC
 * @param {Object} pcData - PC data object
 * @returns {Promise<Object>} Created PC object
 */
export const createPC = async (pcData) => {
  try {
    const response = await fetch(`${API_URL}/pcs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pcData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error creating PC: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create PC:', error);
    throw error;
  }
};

/**
 * Update an existing PC
 * @param {string|number} id - The PC ID
 * @param {Object} pcData - Updated PC data
 * @returns {Promise<Object>} Updated PC object
 */
export const updatePC = async (id, pcData) => {
  try {
    const response = await fetch(`${API_URL}/pcs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pcData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error updating PC with ID ${id}: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to update PC with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a PC
 * @param {string|number} id - The PC ID to delete
 * @returns {Promise<void>}
 */
export const deletePC = async (id) => {
  try {
    const response = await fetch(`${API_URL}/pcs/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting PC with ID ${id}: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to delete PC with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get all available PC components by type
 * @param {string} componentType - Component type (cpu, gpu, ram, storage, psu, case)
 * @returns {Promise<Array>} Array of component objects
 */
export const getComponents = async (componentType) => {
  try {
    const response = await fetch(`${API_URL}/components/${componentType}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching ${componentType} components: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${componentType} components:`, error);
    throw error;
  }
};
