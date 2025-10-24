import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * PriceCard component for displaying build name and total price
 * Implements PC FORGE design system
 */
const PriceCard = ({ buildName, totalPrice, className = '' }) => {
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(totalPrice);
  
  return (
    <motion.div
      className={`price-card rounded-lg overflow-hidden border border-accent/30 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div className="p-4">
        <div className="text-sm font-medium text-gray-300 mb-2">Total Price</div>
        <motion.div 
          className="text-3xl font-bold text-accent drop-shadow-[0_0_10px_rgba(0,224,255,0.4)]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {formattedPrice}
        </motion.div>
      </div>
    </motion.div>
  );
};

PriceCard.propTypes = {
  buildName: PropTypes.string.isRequired,
  totalPrice: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default PriceCard;