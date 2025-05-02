// frontend/src/components/Navbar.jsx

/**
 * Navbar Component
 *
 * A responsive, sticky navigation bar for the Inventory System.
 * Features:
 * - Highlights the active route with animated Framer Motion background
 * - Fully mobile responsive with Tailwind CSS
 * - Hamburger menu for small screens
 * - Accessible and scalable with dynamic nav item config
 */

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

// Navigation routes
const navItems = [
  { to: '/', label: 'Home' },
  { to: '/add', label: 'Add' },
  { to: '/scan', label: 'Scan' },
  { to: '/scan-log', label: 'Scan Log' },
  { to: '/product-log', label: 'Product Log' },
];

export default function Navbar() {
  const { pathname } = useLocation(); // Current route
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu toggle

  return (
    <nav className="sticky top-0 z-50 bg-indigo-700 text-white px-4 sm:px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* App Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Inventory System</h1>

        {/* Hamburger Button (Mobile Only) */}
        <button
          className="sm:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Nav */}
        <div className="hidden sm:flex gap-4 text-sm sm:text-base">
          {navItems.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <div key={to} className="relative">
                <NavLink
                  to={to}
                  className={`relative z-10 px-4 py-2 rounded-full transition-colors duration-300 ${
                    isActive ? 'text-black' : 'text-white hover:text-orange-400'
                  }`}
                >
                  {label}
                </NavLink>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 z-0 bg-orange-400"
                      style={{ borderRadius: '9999px' }}
                      initial={{ opacity: 0.5, scaleX: 1 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.9 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 12, mass: 0.4 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {menuOpen && (
        <div className="sm:hidden mt-3 flex flex-col items-center gap-3">
          {navItems.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <div key={to} className="relative w-full text-center">
                <NavLink
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`relative z-10 inline-block px-4 py-2 rounded-full transition-colors duration-300 w-full ${
                    isActive ? 'text-black bg-orange-400' : 'text-white hover:text-orange-300'
                  }`}
                >
                  {label}
                </NavLink>
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}
