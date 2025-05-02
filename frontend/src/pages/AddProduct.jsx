// frontend/src/pages/AddProduct.jsx

/**
 * AddProduct Page Component
 * 
 * Provides an interface for adding new products to inventory. Handles both manual entry
 * and barcode-scanned product additions. Pre-fills form data from URL parameters when
 * coming from scanner or deep links.
 * 
 * Features:
 * - Responsive layout (mobile/desktop optimized)
 * - Pre-filled form data from URL parameters
 * - Barcode scanning integration
 * - Form validation and error handling
 * - Clear navigation patterns
 * 
 * @component
 * @example
 * // Basic usage
 * <AddProduct />
 * 
 * // With pre-filled data
 * <AddProduct location={{ search: '?barcode=12345&name=Sample' }} />
 */
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import ProductForm from '../components/ProductForm';

export default function AddProduct() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(useLocation().search);

  /**
   * Initialize form data from URL parameters
   * @type {Object}
   * @property {string} name - Product name from URL
   * @property {string} sku - SKU from URL
   * @property {string} barcode - Barcode from URL
   * @property {string} quantity - Quantity from URL
   * @property {string} alert_threshold - Alert threshold from URL
   */
  const formData = {
    name: searchParams.get('name') || '',
    sku: searchParams.get('sku') || '',
    barcode: searchParams.get('barcode') || '',
    quantity: searchParams.get('quantity') || '',
    alert_threshold: searchParams.get('alert_threshold') || ''
  };

  // Track the source of the product addition (scanner/manual)
  const source = searchParams.get('source') || 'manual';

  /**
   * Handles form submission
   * @async
   * @param {Object} productData - Form data to submit
   * @param {string} productData.name - Product name
   * @param {string} productData.sku - Product SKU
   * @param {string} productData.barcode - Product barcode
   * @param {number} productData.quantity - Current stock quantity
   * @param {number} [productData.alert_threshold] - Low stock threshold
   * @returns {Promise<void>}
   * @throws Will throw and display errors if submission fails
   */
  const handleAdd = async (productData) => {
    try {
      await axios.post(`/api/products/?source=${source}`, productData);
      alert('Product added successfully!');
      navigate('/');
    } catch (err) {
      console.error('Product submission failed:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to add product';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        {/* Mobile Navigation: Back to Home Button */}
        {/*
          * Only visible on mobile devices
          * Provides quick navigation back to dashboard
          * Uses icon-only design to save space
          */}
        <div className="block md:hidden mb-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Return to dashboard"
            data-testid="mobile-back-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>

        {/* Desktop Title */}
        {/*
          * Hidden on mobile since ProductForm has its own title
          * Provides context for desktop users
          */}
        <h1 className="hidden md:block text-2xl font-semibold mb-6 text-center text-gray-800">
          Add New Product
        </h1>

        {/* Product Form Component */}
        {/*
          * Main form component with validation
          * Handles both manual and scanned product entry
          */}
        <ProductForm
          onSubmit={handleAdd}
          initial={formData}
          submitLabel="Add Product"
          showScanButton={true}
        />

        {/* Mobile Help Text */}
        {/*
          * Contextual help for mobile users
          * Guides users to use barcode scanning feature
          */}
        <p className="mt-4 text-sm text-gray-500 text-center md:hidden">
          Tip: Use the barcode scanner for faster product entry
        </p>
      </div>
    </div>
  );
}