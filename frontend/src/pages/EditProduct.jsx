// frontend/src/pages/EditProduct.jsx

/**
 * EditProduct Page Component
 * 
 * Provides an interface for editing existing product details. Handles:
 * - Fetching and displaying current product data
 * - Form submission with updated values
 * - Product deletion with confirmation
 * - Responsive layout for all device sizes
 * 
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import ProductForm from '../components/ProductForm';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const source = new URLSearchParams(useLocation().search).get('source') || 'manual';
  const [product, setProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Fetches product details on component mount
   * @async
   * @function fetchProduct
   * @throws {Error} When product fetch fails
   */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}/`);
        setProduct(response.data);
      } catch (error) {
        console.error('Product fetch error:', error);
        alert('Failed to load product details');
      }
    };

    fetchProduct();
  }, [id]);

  /**
   * Handles form submission for product updates
   * @async
   * @param {Object} formData - Updated product data
   */
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await axios.put(`/api/products/${id}/?source=${source}`, formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      alert('Product updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Update error:', error);
      alert(error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles product deletion after confirmation
   * @async
   */
  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/products/${id}/`);
      navigate('/');
    } catch (error) {
      console.error('Deletion error:', error);
      alert('Failed to delete product');
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        {/* Mobile Navigation Header */}
        <div className="block md:hidden mb-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Return to dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>

        {/* Product Edit Form */}
        <ProductForm
          initial={product}
          onSubmit={handleSubmit}
          submitLabel={isSubmitting ? 'Updating...' : 'Update Product'}
          disabled={isSubmitting}
        />

        {/* Delete Button - Mobile Optimized */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-6 w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors md:p-2 md:text-sm"
          disabled={isSubmitting}
        >
          Delete Product
        </button>

        {/* Deletion Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to permanently delete this product?
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}