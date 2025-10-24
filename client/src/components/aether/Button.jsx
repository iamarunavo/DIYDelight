import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Button component implementing PC FORGE design system
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon = null,
  onClick,
  className = '',
  as,
  to,
  ...props 
}) => {
  // Style variants
  const baseClasses = 'font-display flex items-center justify-center gap-2 rounded-md transition-all duration-300';
  
  const variantClasses = {
    primary: 'bg-violet-500 hover:bg-violet-600 text-white shadow-neon hover:shadow-accent font-medium',
    secondary: 'bg-surface hover:bg-surface/50 text-textMain border border-accent/30',
    ghost: 'bg-transparent hover:bg-surface text-textMain hover:shadow-neon',
    danger: 'bg-error hover:bg-error/90 text-white',
    error: 'bg-red-500 hover:bg-red-600 text-white font-medium',
    success: 'bg-success hover:bg-success/90 text-bg',
  };
  
  const sizeClasses = {
    small: 'text-sm py-1 px-3',
    medium: 'text-base py-2 px-4',
    large: 'text-lg py-3 px-6',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Determine which component to render based on 'as' prop
  const Component = as || 'button';
  
  // For Link component we need to use 'to' instead of 'href'
  const linkProps = as === Link || Component === Link ? { to } : {};
  
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <Component
        className={`
          ${baseClasses} 
          ${variantClasses[variant]} 
          ${sizeClasses[size]}
          ${disabledClasses}
          ${widthClasses}
          ${className}
        `}
        onClick={disabled ? undefined : onClick}
        disabled={Component === 'button' ? disabled : undefined}
        {...linkProps}
        {...props}
      >
        {icon && <span className="button-icon">{icon}</span>}
        {children}
      </Component>
    </motion.div>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'error', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
    PropTypes.func
  ]),
  to: PropTypes.string,
};

export default Button;