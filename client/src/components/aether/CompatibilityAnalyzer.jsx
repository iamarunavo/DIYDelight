import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * CompatibilityAnalyzer component for displaying system-wide status
 * Implements PC FORGE design system
 */
const CompatibilityAnalyzer = ({
  compatibility = {
    cpu: 'compatible',
    gpu: 'compatible',
    ram: 'compatible',
    storage: 'compatible',
    psu: 'compatible',
    case: 'compatible',
  },
  issues = [],
  className = '',
}) => {
  // Status colors for different compatibility states
  const statusColors = {
    compatible: 'bg-success',
    bottleneck: 'bg-yellow-400',
    incompatible: 'bg-error'
  };
  
  // Icons for component types
  const icons = {
    cpu: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    gpu: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    ram: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    storage: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    psu: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    case: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  };
  
  // Count the number of issues by status
  const statusCounts = Object.values(compatibility).reduce((counts, status) => {
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  
  // Determine overall system status
  let overallStatus = 'compatible';
  if (statusCounts.incompatible > 0) {
    overallStatus = 'incompatible';
  } else if (statusCounts.bottleneck > 0) {
    overallStatus = 'bottleneck';
  }
  
  return (
    <div className={`p-4 rounded-lg backdrop-blur-md bg-surface ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-display font-semibold text-textMain">System Compatibility</h3>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full ${statusColors[overallStatus]}`}></div>
          <span className="ml-2 text-sm text-textDim">
            {overallStatus === 'compatible' 
              ? 'All components compatible' 
              : overallStatus === 'bottleneck' 
                ? 'Potential bottlenecks' 
                : 'Incompatible components'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(compatibility).map(([component, status]) => (
          <motion.div 
            key={component}
            className="flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
              status === 'compatible' 
                ? 'border-success text-success' 
                : status === 'bottleneck' 
                  ? 'border-yellow-400 text-yellow-400' 
                  : 'border-error text-error'
            }`}>
              {icons[component]}
            </div>
            <p className="mt-2 text-xs text-center text-textDim capitalize">{component}</p>
            
            {status !== 'compatible' && (
              <motion.span
                className={`w-2 h-2 mt-1 rounded-full ${status === 'bottleneck' ? 'bg-yellow-400' : 'bg-error'}`}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2 
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
      
      {issues.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-textMain mb-2">Issues Detected:</h4>
          <ul className="space-y-2">
            {issues.map((issue, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className={`mt-1 mr-2 h-2 w-2 rounded-full flex-shrink-0 ${
                  issue.severity === 'warning' ? 'bg-yellow-400' : 'bg-error'
                }`} />
                <span className="text-textDim">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

CompatibilityAnalyzer.propTypes = {
  compatibility: PropTypes.shape({
    cpu: PropTypes.oneOf(['compatible', 'bottleneck', 'incompatible']),
    gpu: PropTypes.oneOf(['compatible', 'bottleneck', 'incompatible']),
    ram: PropTypes.oneOf(['compatible', 'bottleneck', 'incompatible']),
    storage: PropTypes.oneOf(['compatible', 'bottleneck', 'incompatible']),
    psu: PropTypes.oneOf(['compatible', 'bottleneck', 'incompatible']),
    case: PropTypes.oneOf(['compatible', 'bottleneck', 'incompatible']),
  }),
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string.isRequired,
      severity: PropTypes.oneOf(['warning', 'error']).isRequired,
    })
  ),
  className: PropTypes.string,
};

export default CompatibilityAnalyzer;