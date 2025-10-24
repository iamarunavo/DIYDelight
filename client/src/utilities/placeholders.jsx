/**
 * Utilities for PC component placeholder images
 */

// Removed placeholder SVG imports as they are no longer used

/**
 * Returns the appropriate SVG placeholder element for a component type
 * @param {string} componentType - The type of component (cpu, gpu, etc.)
 * @returns {JSX.Element} - SVG placeholder element
 */
export const getPlaceholderSVG = (componentType) => {
  // Return a simple blank placeholder instead of the detailed component SVGs
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 opacity-0">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
};

/**
 * Returns an empty placeholder image for a component type
 * 
 * @param {string} componentType - The type of component (cpu, gpu, etc.)
 * @returns {JSX.Element} - Empty React element
 */
export const getPlaceholderImage = (componentType) => {
  // Return null to ensure no images are displayed
  return null;
};

// For backwards compatibility
export default getPlaceholderImage;