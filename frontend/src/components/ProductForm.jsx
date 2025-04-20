// frontend/src/components/ProductForm.jsx

/**
 * ProductForm Component
 *
 * A reusable form component used to create or update product data.
 * It includes form validation, barcode scanning integration, and
 * dynamic field initialization based on passed props.
 *
 * Props:
 * - onSubmit (function): Callback to handle form submission.
 * - initial (object): Pre-filled values for the form fields (optional).
 * - submitLabel (string): Text for the form title and submit button.
 * - showScanButton (boolean): If true, shows the barcode scanner button.
 */

import { useState } from 'react';
import BarcodeScannerModal from '../pages/BarcodeScannerModal';

export default function ProductForm({
  onSubmit,
  initial = {},
  submitLabel = "Add Product",
  showScanButton = false
}) {
  // Initialize form state with optional pre-filled values
  const [form, setForm] = useState({
    name: initial.name || '',
    sku: initial.sku || '',
    barcode: initial.barcode || '',
    quantity: initial.quantity || '',
    alert_threshold: initial.alert_threshold || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Validate form input before submission
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.sku.trim()) newErrors.sku = 'SKU is required';

    if (form.quantity === '') {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(form.quantity) || Number(form.quantity) < 0) {
      newErrors.quantity = 'Quantity must be 0 or more';
    }

    if (form.alert_threshold !== '') {
      if (isNaN(form.alert_threshold) || Number(form.alert_threshold) < 0) {
        newErrors.alert_threshold = 'Alert threshold must be 0 or more';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change and update form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the form after validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const cleanedForm = { ...form };

    // If alert threshold is empty, exclude it from submission
    if (cleanedForm.alert_threshold === '') {
      delete cleanedForm.alert_threshold;
    }

    try {
      await onSubmit(cleanedForm);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.sku) {
        setErrors((prev) => ({ ...prev, sku: 'SKU already exists' }));
      } else {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Define form fields for dynamic rendering
  const fields = [
    { name: 'name', label: 'Product Name', type: 'text' },
    { name: 'sku', label: 'SKU', type: 'text' },
    { name: 'barcode', label: 'UPC', type: 'text' },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'alert_threshold', label: 'Alert Threshold', type: 'number' }
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white border border-orange-200 rounded-2xl p-8 shadow-lg"
    >
      {/* Title */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-orange-400 inline-block pb-1">
          {submitLabel}
        </h2>
      </div>

      {/* Form Fields */}
      <div className="grid gap-5">
        {fields.map(({ name, label, type }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-indigo-700 mb-1">
              {label}
            </label>

            {/* Conditionally show scan button for barcode */}
            {name === 'barcode' && showScanButton ? (
              <div className="flex gap-2">
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md shadow transition"
                >
                  Scan
                </button>
              </div>
            ) : (
              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            )}

            {/* Error message display */}
            {errors[name] && (
              <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : submitLabel}
        </button>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(scanned) => setForm((prev) => ({ ...prev, barcode: scanned }))}
      />
    </form>
  );
}
