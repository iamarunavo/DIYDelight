import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Card component for displaying PC parts with glass morphism effect
 * Implements PC FORGE design system
 */
const Card = ({
  children,
  selected = false,
  incompatible = false,
  onClick,
  compare = false,
  onCompareToggle,
  className = '',
  ...props
}) => {
  const baseClasses = 'backdrop-blur-md p-4 rounded-lg transition-all duration-300';
  
  const stateClasses = selected
    ? 'bg-surface border-2 border-accent shadow-neon'
    : incompatible
      ? 'bg-surface border-2 border-error'
      : 'bg-surface border border-white/5 hover:border-accent/30';
  
  const cursorClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <motion.div
      className={`${baseClasses} ${stateClasses} ${cursorClasses} ${className}`}
      whileHover={onClick && !incompatible ? { y: -4 } : {}}
      animate={selected ? { 
        boxShadow: ['0 0 0px #00E0FF', '0 0 8px #00E0FF', '0 0 4px #00E0FF'],
      } : {}}
      transition={{ duration: 0.8, repeat: selected ? Infinity : 0, repeatType: 'reverse' }}
      onClick={incompatible ? undefined : onClick}
      {...props}
    >
      {compare && (
        <div className="absolute top-2 right-2 z-10">
          <label className="flex items-center space-x-2 text-xs">
            <input 
              type="checkbox" 
              className="form-checkbox text-accent rounded border-accent/50 bg-transparent"
              checked={compare}
              onChange={(e) => onCompareToggle && onCompareToggle(e.target.checked)}
            />
            <span className="text-textDim">Compare</span>
          </label>
        </div>
      )}
      
      {children}
      
      {incompatible && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/70 rounded-lg">
          <div className="text-error text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-2">Incompatible</p>
          </div>
        </div>
      )}

      {selected && (
        <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-accent flex items-center justify-center text-bg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  selected: PropTypes.bool,
  incompatible: PropTypes.bool,
  onClick: PropTypes.func,
  compare: PropTypes.bool,
  onCompareToggle: PropTypes.func,
  className: PropTypes.string,
};

export default Card;