// frontend/pages/ScanLogs.jsx

/**
 * ScanLog Page
 *
 * Displays a searchable, sortable table of barcode scan history.
 * - Each entry shows the product name, SKU, barcode, and timestamp.
 * - Filters: product name, SKU
 * - Sorting: by scan time or product name
 * - Supports CSV download of filtered results
 */

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ScanLog() {
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterSKU, setFilterSKU] = useState('');
  const [sortField, setSortField] = useState('scanned_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch scan history on load
  useEffect(() => {
    axios.get('/api/history/').then((res) => setHistory(res.data));
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let updated = history.filter(item =>
      (item.product?.name || '').toLowerCase().includes(filterName.toLowerCase()) &&
      (item.product?.sku || '').toLowerCase().includes(filterSKU.toLowerCase())
    );

    updated.sort((a, b) => {
      const valA = sortField === 'product_name'
        ? (a.product?.name || '').toLowerCase()
        : new Date(a.scanned_at);
      const valB = sortField === 'product_name'
        ? (b.product?.name || '').toLowerCase()
        : new Date(b.scanned_at);

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFiltered(updated);
  }, [filterName, filterSKU, sortField, sortOrder, history]);

  // CSV Export
  const downloadCSV = () => {
    const headers = ['Barcode', 'SKU', 'Product Name', 'Scanned At'];
    const rows = filtered.map(item => [
      item.barcode,
      item.product?.sku || 'Unknown',
      item.product?.name || 'Unknown',
      new Date(item.scanned_at).toLocaleString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'scan_log.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white border border-orange-200 rounded-xl shadow-lg">
      {/* Header + Export */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-indigo-800">Scan Log History</h2>
        <button
          onClick={downloadCSV}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
        >
          Download CSV
        </button>
      </div>

      {/* Filters & Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by Name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Filter by SKU"
          value={filterSKU}
          onChange={(e) => setFilterSKU(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border border-indigo-300 px-3 py-2 rounded-md text-sm bg-white text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="scanned_at">Scanned At</option>
          <option value="product_name">Product Name</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-indigo-300 px-3 py-2 rounded-md text-sm bg-white text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-orange-50 text-indigo-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Barcode</th>
              <th className="px-6 py-3">Scanned At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr
                  key={idx}
                  className="bg-indigo-50 even:bg-white hover:bg-indigo-100 transition-colors duration-200 ease-in-out"
                >
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {item.product?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-3">{item.product?.sku || 'N/A'}</td>
                  <td className="px-6 py-3">{item.barcode}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(item.scanned_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
