import React from 'react';
import { motion } from 'framer-motion';
import './PCComponentCard.css';

/**
 * PCComponentCard - Displays a PC component with image, details and compatibility status
 * 
 * @param {Object} component - The component object with name, price, specs, etc.
 * @param {boolean} selected - Whether this component is currently selected
 * @param {function} onClick - Function to call when card is clicked
 * @param {string} compatibilityStatus - One of: 'compatible', 'incompatible', 'warning'
 */
const PCComponentCard = ({ component, selected, onClick, compatibilityStatus }) => {
  return (
    <motion.div 
      className={`component-card relative bg-surface backdrop-blur-md rounded-lg p-4 overflow-hidden cursor-pointer
                ${selected ? 'border-2 border-accent shadow-neon' : 'border border-gray-700'}
                ${compatibilityStatus === 'incompatible' ? 'border-error' : ''}
                ${compatibilityStatus === 'warning' ? 'border-yellow-400' : ''}
              `}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Removed component image container */}
        <div className="flex-1">
          <h3 className="text-textMain font-medium text-lg">{component.name}</h3>
          <div className="text-textDim text-sm">
            {component.price && <p>${component.price.toFixed(2)}</p>}
            {component.specs && <p className="mt-1 line-clamp-2">{component.specs}</p>}
          </div>
        </div>
      </div>
      
      {compatibilityStatus === 'incompatible' && (
        <div className="compatibility-indicator incompatible">
          Incompatible
        </div>
      )}
      
      {compatibilityStatus === 'warning' && (
        <div className="compatibility-indicator warning">
          Potential issue
        </div>
      )}
      
      {selected && (
        <div className="selected-indicator absolute bottom-2 right-2 text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

export default PCComponentCard;