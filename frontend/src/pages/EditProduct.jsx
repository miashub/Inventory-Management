// frontend/src/pages/EditProduct.jsx

/**
 * EditProduct Page
 *
 * Fetches and displays a product form pre-filled with existing product data.
 * Allows editing and updating the product, or deleting it entirely.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductForm from '../components/ProductForm';

// Load API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const source = new URLSearchParams(useLocation().search).get('source') || 'manual';
  const [product, setProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch product details on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(() => alert('Failed to fetch product'));
  }, [id]);

  // Submit updated form
  const handleSubmit = async (form) => {
    try {
      await axios.put(`${API_BASE_URL}/api/products/${id}/?source=${source}`, form, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      alert('Product updated!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to update product');
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}/`);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  if (!product) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-3xl">
        <ProductForm
          initial={product}
          onSubmit={handleSubmit}
          submitLabel="Update Product"
        />
        <button
          onClick={() => setShowModal(true)}
          className="mt-6 w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          Delete Product
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
