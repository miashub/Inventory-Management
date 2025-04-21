// frontend/src/pages/Home.jsx

/**
 * Home Page – Product Inventory
 *
 * Displays a list of all products in inventory with filter options.
 * Filters:
 *  - All Products
 *  - Low Stock (quantity <= alert threshold)
 *  - Almost Low (within 5 units of threshold)
 *
 * Highlights:
 *  - Dynamic filtering
 *  - Color-coded cards based on stock levels
 *  - Navigation to edit each product
 */

import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { Link } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');

  // Fetch all products on component mount
  useEffect(() => {
    axios.get(`/api/products/`)
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error('Error fetching products:', err);
        alert('Failed to load products.');
      });
  }, []);

  // Filter logic based on stock levels
  const filteredProducts = products.filter(product => {
    if (filter === 'low') return product.quantity <= product.alert_threshold;
    if (filter === 'almost') {
      return (
        product.quantity > product.alert_threshold &&
        product.quantity <= product.alert_threshold + 5
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-indigo-800 border-b-2 border-orange-400 inline-block pb-1">
          Product Inventory
        </h2>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        {[
          { label: 'All', value: 'all', style: 'bg-indigo-400 text-white' },
          { label: 'Low Stock', value: 'low', style: 'bg-red-400 text-white' },
          { label: 'Almost Low', value: 'almost', style: 'bg-yellow-300 text-yellow-900' }
        ].map(({ label, value, style }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full font-medium transition-all duration-300 shadow-sm ${
              filter === value ? style : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const isLow = product.quantity <= product.alert_threshold;
          const isAlmostLow =
            product.quantity > product.alert_threshold &&
            product.quantity <= product.alert_threshold + 5;

          return (
            <div
              key={product.id}
              className={`p-5 rounded-lg border transition-all duration-300 shadow-sm hover:shadow-md ${
                isLow
                  ? 'bg-red-50 border-red-300'
                  : isAlmostLow
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Header + Stock Badge */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                {isLow && (
                  <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    Low
                  </span>
                )}
                {isAlmostLow && (
                  <span className="text-sm font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">
                    Almost Low
                  </span>
                )}
              </div>

              {/* Product Info */}
              <p className="text-sm text-gray-600">SKU: {product.sku}</p>
              <p className="text-sm text-gray-600 mb-3">Qty: {product.quantity}</p>

              {/* Edit Link */}
              <Link
                to={`/edit/${product.id}`}
                className="inline-block mt-2 text-sm font-semibold text-indigo-600 hover:text-orange-500 transition-colors"
              >
                Edit Product →
              </Link>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center mt-10 text-gray-500">
          No products to display for this filter.
        </div>
      )}
    </div>
  );
}
