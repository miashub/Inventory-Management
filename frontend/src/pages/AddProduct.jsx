// frontend/src/pages/AddProduct.jsx

/**
 * AddProduct Page
 *
 * Renders a form to add a new product to the inventory.
 * If a barcode is pre-scanned (e.g. from the scanner page), the form pre-fills the value.
 * Additional product details can also be passed via URL parameters.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import ProductForm from '../components/ProductForm';

export default function AddProduct() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(useLocation().search);

  // Extract pre-filled values from URL params
  const formData = {
    name: searchParams.get('name') || '',
    sku: searchParams.get('sku') || '',
    barcode: searchParams.get('barcode') || '',
    quantity: searchParams.get('quantity') || '',
    alert_threshold: searchParams.get('alert_threshold') || ''
  };

  const source = searchParams.get('source') || 'manual';

  // Submit handler for form
  const handleAdd = async (productData) => {
    try {
      await axios.post(`/api/products/?source=${source}`, productData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      alert('Product added!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-3xl">
        <ProductForm
          onSubmit={handleAdd}
          initial={formData}
          submitLabel="Add Product"
          showScanButton
        />
      </div>
    </div>
  );
}
