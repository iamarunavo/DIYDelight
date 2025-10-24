import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../css/Navigation.css';

/**
 * Navigation component using PC FORGE design system
 */
const Navigation = () => {
  return (
    <motion.nav
      className="bg-bg/30 backdrop-blur-md border-b border-surface flex justify-between items-center px-6 py-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Link to="/" className="no-underline">
        <div className="flex" style={{ alignItems: "center" }}>
          {/* PC FORGE text */}
          <motion.h1 
            className="text-textMain font-display font-bold text-2xl"
            whileHover={{ textShadow: '0 0 5px rgba(255,255,255,0.5)' }}
          >
            PC FORGE
          </motion.h1>
        </div>
      </Link>

      <div className="flex space-x-2">
        <NavLink to="/" label="Build PC" />
        <NavLink to="/custombuilds" label="My Builds" />
      </div>
    </motion.nav>
  );
};

// Helper NavLink component with animations
const NavLink = ({ to, label }) => {
  return (
    <Link to={to} className="no-underline">
      <motion.div
        className="px-4 py-2 rounded-lg bg-surface text-textMain hover:bg-primary hover:text-white transition-colors"
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
      >
        {label}
      </motion.div>
    </Link>
  );
};

export default Navigation;