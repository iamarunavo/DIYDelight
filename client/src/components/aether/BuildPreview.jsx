import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Simple Build Summary component
 * Implements PC FORGE design system
 */
const BuildPreview = memo(({ 
  selectedComponents = {},
  className = '',
  ...props
}) => {
  
  return (
    <div className={`relative rounded-lg overflow-hidden bg-surface p-4 ${className}`} {...props}>
      <h3 className="text-lg font-display font-semibold mb-4">Build Summary</h3>
      
      <div className="space-y-3">
        {Object.entries(selectedComponents).filter(([_, component]) => component).map(([type, component]) => {
          // Format the component type display name
          let displayType = type;
          if (type === 'cpu') displayType = 'Processor';
          else if (type === 'gpu') displayType = 'Graphics Card';
          else if (type === 'ram') displayType = 'Memory';
          else if (type === 'psu') displayType = 'Power Supply';
          else if (type === 'cooler') displayType = 'CPU Cooler';
          else displayType = type.charAt(0).toUpperCase() + type.slice(1);
          
          return (
            <div key={type} className="flex justify-between items-center border-b border-accent/10 pb-2">
              <div className="font-medium">{displayType}</div>
              <div className="text-sm text-textDim">{component.name}</div>
            </div>
          );
        })}
        
        {Object.values(selectedComponents).filter(component => component).length === 0 && (
          <div className="text-center text-textDim py-4">
            No components selected yet
          </div>
        )}
      </div>
    </div>
  );
});

// No 3D models or loading fallbacks needed anymore

BuildPreview.propTypes = {
  selectedComponents: PropTypes.shape({
    cpu: PropTypes.object,
    cooler: PropTypes.object,
    motherboard: PropTypes.object,
    gpu: PropTypes.object,
    ram: PropTypes.object,
    storage: PropTypes.object,
    psu: PropTypes.object,
    case: PropTypes.object
  }),
  className: PropTypes.string,
};

export default BuildPreview;