// * Home Page – Product Inventory
//  *
//  * Displays a list of all products in inventory with filter options.
//  * Filters:
//  *  - All Products
//  *  - Low Stock (quantity <= alert threshold)
//  *  - Almost Low (within 5 units of threshold)
//  *  - Expired (expiry_date has passed)
//  *  - Almost Expired (expiry within 5 days)
//  *
//  * Highlights:
//  *  - Dynamic filtering by stock and expiry status
//  *  - Color-coded cards based on stock and expiry
//  *  - Navigation to edit each product

import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { Link } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch all products on component mount
  useEffect(() => {
    setLoading(true);
    axios.get(`/api/products/`)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        alert('Failed to load products.');
        setLoading(false);
      });
  }, []);

  // Show spinner while loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Loading inventory...</h2>
        <p className="text-gray-500 mt-2">Please wait while we connect to the backend.</p>
      </div>
    );
  }

  // Apply dynamic filtering based on stock level and expiry
  const filteredProducts = Array.isArray(products)
    ? products.filter(product => {
        const now = new Date();
        const expiry = product.expiry_date ? new Date(product.expiry_date) : null;
        const daysLeft = expiry ? (expiry - now) / (1000 * 60 * 60 * 24) : null;

        if (filter === 'low') return product.quantity <= product.alert_threshold;
        if (filter === 'almost') {
          return (
            product.quantity > product.alert_threshold &&
            product.quantity <= product.alert_threshold + 5
          );
        }
        if (filter === 'expired') return expiry && expiry < now;
        if (filter === 'almost_expired') return expiry && expiry >= now && daysLeft <= 5;
        return true; // default to all
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Page Heading */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-indigo-800 border-b-2 border-orange-400 inline-block pb-1">
          Product Inventory
        </h2>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'All', value: 'all', style: 'bg-indigo-400 text-white' },
          { label: 'Low Stock', value: 'low', style: 'bg-red-400 text-white' },
          { label: 'Almost Low Stock', value: 'almost', style: 'bg-yellow-300 text-yellow-900' },
          { label: 'Expired', value: 'expired', style: 'bg-black text-white' },
          { label: 'Almost Expired', value: 'almost_expired', style: 'bg-yellow-800 text-white' }
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

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const now = new Date();
          const expiry = product.expiry_date ? new Date(product.expiry_date) : null;
          const isExpired = expiry && expiry < now;
          const isAlmostExpired = expiry && expiry >= now && (expiry - now) / (1000 * 60 * 60 * 24) <= 5;
          const isLow = product.quantity <= product.alert_threshold;
          const isAlmostLow = product.quantity > product.alert_threshold &&
                              product.quantity <= product.alert_threshold + 5;

          return (
            <div
              key={product.id}
              className={`p-5 rounded-lg border transition-all duration-300 shadow-sm hover:shadow-md ${
                isLow
                  ? 'bg-red-50 border-red-300'
                  : isAlmostLow
                  ? 'bg-yellow-50 border-yellow-300'
                  : isExpired
                  ? 'bg-gray-200 border-black'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Product Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <div className="flex flex-wrap gap-1">
                  {isExpired && (
                    <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded-full">
                      Expired
                    </span>
                  )}
                  {!isExpired && isAlmostExpired && (
                    <span className="text-xs font-medium text-yellow-900 bg-yellow-200 px-2 py-0.5 rounded-full">
                      Almost Expired
                    </span>
                  )}
                  {isLow && (
                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                      Low
                    </span>
                  )}
                  {isAlmostLow && (
                    <span className="text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">
                      Almost Low Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <p className="text-sm text-gray-600">SKU: {product.sku}</p>
              <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
              {product.expiry_date && (
                <p className="text-sm text-gray-600">
                  Expiry: {new Date(product.expiry_date).toLocaleDateString()}
                </p>
              )}

              {/* Edit Button */}
              <Link
                to={`/edit/${product.id}`}
                className="inline-block mt-3 text-sm font-semibold text-indigo-600 hover:text-orange-500 transition-colors"
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
