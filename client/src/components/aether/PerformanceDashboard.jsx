import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { calculatePerformanceScore, calculateTotalPrice } from '../../utilities/pcutils-extension';

/**
 * Performance Dashboard component for displaying PC metrics
 * Implements PC FORGE design system
 */
const PerformanceDashboard = ({
  components = {},
  totalPrice,
  metrics = {
    gamingPerformance: 0,
    powerEfficiency: 0,
    thermals: 0,
    noise: 0
  },
  className = ""
}) => {
  // Calculate performance score from components
  const performanceScore = calculatePerformanceScore(components);
  console.log("PerformanceDashboard calculated score:", performanceScore);
  
  // Use provided totalPrice or calculate if not provided
  const calculatedTotalPrice = totalPrice || calculateTotalPrice(components);
  
  // Always ensure metrics have valid values
  const safeMetrics = {
    gamingPerformance: isNaN(metrics.gamingPerformance) ? 0.4 : metrics.gamingPerformance,
    powerEfficiency: isNaN(metrics.powerEfficiency) ? 0.6 : metrics.powerEfficiency,
    thermals: isNaN(metrics.thermals) ? 0.5 : metrics.thermals,
    noise: isNaN(metrics.noise) ? 0.5 : metrics.noise
  };
  
  // Determine performance category based on score
  const getPerformanceCategory = (score) => {
    if (score >= 85) return 'Enthusiast';
    if (score >= 70) return 'High-End Gaming';
    if (score >= 55) return 'Mid-Range Gaming';
    if (score >= 40) return 'Entry-Level Gaming';
    return 'Basic Computing';
  };
  
  // Get recommended use cases based on performance score
  const getUseCases = (score) => {
    if (score >= 85) {
      return [
        '4K Gaming',
        'Professional 3D Rendering',
        'AI/Machine Learning',
        'Video Production'
      ];
    }
    
    if (score >= 70) {
      return [
        '1440p High FPS Gaming',
        'Streaming + Gaming',
        'Video Editing',
        'CAD Design'
      ];
    }
    
    if (score >= 55) {
      return [
        '1080p Gaming',
        'Content Creation',
        'Photo Editing',
        'Programming'
      ];
    }
    
    if (score >= 40) {
      return [
        'Esports Titles',
        'Web Development',
        'Office Applications',
        'Media Consumption'
      ];
    }
    
    return [
      'Web Browsing',
      'Office Work',
      'Email',
      'Video Streaming'
    ];
  };
  
  const performanceCategory = getPerformanceCategory(performanceScore);
  const useCases = getUseCases(performanceScore);
  
  // Convert metrics to percentages for visualization
  const normalizeMetric = (value) => {
    if (isNaN(value) || value === null || value === undefined) {
      return 0;
    }
    return Math.min(Math.max(value * 100, 0), 100);
  };
  
  const gamingPerformance = normalizeMetric(safeMetrics.gamingPerformance);
  const powerEfficiency = normalizeMetric(safeMetrics.powerEfficiency);
  const thermals = normalizeMetric(safeMetrics.thermals);
  const noise = normalizeMetric(safeMetrics.noise);
  
  // Animate number counter for price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(price);
  };
  
  return (
    <div className={`p-4 rounded-lg backdrop-blur-md bg-surface ${className}`}>
      <h3 className="text-lg font-display font-semibold text-textMain mb-4">Build Performance</h3>
      
      {/* Build tier badge */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-1 px-2 py-1 bg-surface/50 rounded">
          <span className={`h-2 w-2 rounded-full ${
            calculatedTotalPrice > 2000 ? 'bg-error' :
            calculatedTotalPrice > 1500 ? 'bg-yellow-400' :
            'bg-success'
          }`}></span>
          <span className="text-xs">
            {calculatedTotalPrice > 2000 ? <span className="text-white font-medium drop-shadow-sm">Premium Build</span> :
             calculatedTotalPrice > 1500 ? 'Balanced Build' :
             'Budget Build'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Gaming Performance Metric */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-textDim">Gaming Performance</span>
            <span className="text-xs text-textMain">{isNaN(gamingPerformance) ? "0" : Math.round(gamingPerformance)}%</span>
          </div>
          <div className="h-2 bg-surface/50 rounded overflow-hidden">
            <motion.div 
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${isNaN(gamingPerformance) || gamingPerformance < 0 ? 0 : Math.min(gamingPerformance, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        
        {/* Power Efficiency Metric */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-textDim">Power Efficiency</span>
            <span className="text-xs text-textMain">{isNaN(powerEfficiency) ? "0" : Math.round(powerEfficiency)}%</span>
          </div>
          <div className="h-2 bg-surface/50 rounded overflow-hidden">
            <motion.div 
              className="h-full bg-success"
              initial={{ width: 0 }}
              animate={{ width: `${isNaN(powerEfficiency) || powerEfficiency < 0 ? 0 : Math.min(powerEfficiency, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            />
          </div>
        </div>
        
        {/* Thermals Metric */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-textDim">Cooling Performance</span>
            <span className="text-xs text-textMain">{isNaN(thermals) ? "0" : Math.round(thermals)}%</span>
          </div>
          <div className="h-2 bg-surface/50 rounded overflow-hidden">
            <motion.div 
              className={`h-full ${thermals > 75 ? 'bg-success' : thermals > 40 ? 'bg-yellow-400' : 'bg-error'}`}
              initial={{ width: 0 }}
              animate={{ width: `${isNaN(thermals) || thermals < 0 ? 0 : Math.min(thermals, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
        
        {/* Noise Metric */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-textDim">Noise Level</span>
            <span className="text-xs text-textMain">{isNaN(noise) ? "100" : (100 - Math.round(noise))}% Quiet</span>
          </div>
          <div className="h-2 bg-surface/50 rounded overflow-hidden">
            <motion.div 
              className={`h-full ${noise < 30 ? 'bg-success' : noise < 70 ? 'bg-yellow-400' : 'bg-error'}`}
              initial={{ width: 0 }}
              animate={{ width: `${isNaN(noise) ? 100 : Math.min(Math.max(100 - noise, 0), 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

PerformanceDashboard.propTypes = {
  components: PropTypes.object,
  totalPrice: PropTypes.number,
  metrics: PropTypes.shape({
    gamingPerformance: PropTypes.number,
    powerEfficiency: PropTypes.number,
    thermals: PropTypes.number,
    noise: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default PerformanceDashboard;