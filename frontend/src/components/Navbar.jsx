// frontend/src/components/Navbar.jsx

/**
 * Navbar Component
 *
 * A responsive navigation bar for the Inventory System.
 * It includes animated tab highlighting using Framer Motion,
 * dynamic active link detection via React Router, and
 * scalable structure using a route config array.
 *
 * Features:
 * - Highlights the current route with a smooth animated background
 * - Fully responsive with Tailwind CSS
 * - Accessible and visually consistent across screen sizes
 */

import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Navigation routes
const navItems = [
  { to: '/', label: 'Home' },
  { to: '/add', label: 'Add' },
  { to: '/scan', label: 'Scan' },
  { to: '/scan-log', label: 'Scan Log' },
  { to: '/product-log', label: 'Product Log' },
];

export default function Navbar() {
  const { pathname } = useLocation(); // Get current route path

  return (
    <nav className="bg-indigo-700 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* App Title */}
        <h1 className="text-2xl font-bold tracking-wide">Inventory System</h1>

        {/* Navigation Links */}
        <div className="relative flex flex-wrap gap-3 text-sm sm:text-base">
          {navItems.map(({ to, label }) => {
            const isActive = pathname === to;

            return (
              <div key={to} className="relative">
                {/* Link Label */}
                <NavLink
                  to={to}
                  className={`relative z-10 px-4 py-2 rounded-full transition-colors duration-300 ${
                    isActive ? 'text-black' : 'text-white hover:text-orange-400'
                  }`}
                >
                  {label}
                </NavLink>

                {/* Animated Active Tab Highlight */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 z-0 bg-orange-400"
                      style={{ borderRadius: '9999px' }} // pill shape
                      initial={{ opacity: 0.5, scaleX: 1 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.9 }}
                      transition={{
                        type: 'spring',
                        stiffness: 120,
                        damping: 12,
                        mass: 0.4,
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
