// frontend/pages/ProductLogs.jsx

/**
 * ProductLogs Page
 *
 * Displays a detailed, filterable, and sortable table of all product-related actions (add/edit).
 * Features:
 * - Dynamic filters (name, SKU, action, source)
 * - Sorting options by name, quantity change, and timestamp
 * - Downloadable CSV export of the filtered logs
 * - Visual indicators for low or scanned actions
 */

import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

export default function ProductLogs() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [nameFilter, setNameFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    axios.get(`/api/logs/`).then(res => {
      setLogs(res.data);
      setFiltered(res.data);
    }).catch(err => {
      console.error('Failed to fetch product logs:', err);
    });
  }, []);

  useEffect(() => {
    let updated = logs.filter(log =>
      (log.product?.name || '').toLowerCase().includes(nameFilter.toLowerCase()) &&
      (log.product?.sku || '').toLowerCase().includes(skuFilter.toLowerCase()) &&
      (!actionFilter || log.action === actionFilter) &&
      (!sourceFilter || log.source === sourceFilter)
    );

    updated.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'product_name':
          valA = (a.product?.name || '').toLowerCase();
          valB = (b.product?.name || '').toLowerCase();
          break;
        case 'quantity_change':
          valA = parseInt(a.quantity_change || 0);
          valB = parseInt(b.quantity_change || 0);
          break;
        case 'timestamp':
        default:
          valA = new Date(a.timestamp);
          valB = new Date(b.timestamp);
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFiltered(updated);
  }, [logs, nameFilter, skuFilter, actionFilter, sourceFilter, sortField, sortOrder]);

  const resetFilters = () => {
    setNameFilter('');
    setSkuFilter('');
    setActionFilter('');
    setSourceFilter('');
    setSortField('timestamp');
    setSortOrder('desc');
  };

  const downloadCSV = () => {
    const headers = ['Product', 'SKU', 'Action', 'Source', 'Qty Change', 'Current Qty', 'Threshold Change', 'Current Threshold', 'Timestamp'];
    const rows = filtered.map(log => [
      log.product?.name || 'Unknown',
      log.product?.sku || 'Unknown',
      log.action,
      log.source,
      log.quantity_change || '0',
      log.current_quantity ?? '-',
      log.threshold_change || '0',
      log.current_threshold ?? '-',
      new Date(log.timestamp).toLocaleString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-indigo-800">Product Logs</h2>
        <div className="flex gap-3">
          <button onClick={resetFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm">
            Reset Filters
          </button>
          <button onClick={downloadCSV} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">
            Download CSV
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by Name"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Filter by SKU"
          value={skuFilter}
          onChange={e => setSkuFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="border border-indigo-300 px-3 py-2 rounded-md text-sm bg-white text-indigo-700 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Actions</option>
          <option value="add">Add</option>
          <option value="edit">Edit</option>
        </select>
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="border border-indigo-300 px-3 py-2 rounded-md text-sm bg-white text-indigo-700 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Sources</option>
          <option value="manual">Manual</option>
          <option value="scanned">Scanned</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value)}
          className="border border-indigo-300 px-3 py-2 rounded-md text-sm bg-white text-indigo-700 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="timestamp">Sort by Timestamp</option>
          <option value="product_name">Sort by Product Name</option>
          <option value="quantity_change">Sort by Quantity</option>
        </select>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="border border-indigo-300 px-3 py-2 rounded-md text-sm bg-white text-indigo-700 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-orange-50 text-indigo-700 uppercase text-xs tracking-wider">
            <tr className="text-center">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">SKU</th>
              <th className="p-2 border">Action</th>
              <th className="p-2 border">Source</th>
              <th className="p-2 border">Qty Δ</th>
              <th className="p-2 border">Current Qty</th>
              <th className="p-2 border">Threshold Δ</th>
              <th className="p-2 border">Current Threshold</th>
              <th className="p-2 border">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((log, index) => (
                <tr
                  key={index}
                  className={`text-center ${
                    log.product?.id === null ? 'text-gray-500 italic' : ''
                  } ${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}`}
                >
                  <td className="p-2 border">{log.product?.name || 'Unknown'}</td>
                  <td className="p-2 border">{log.product?.sku || 'Unknown'}</td>
                  <td className="p-2 border capitalize">{log.action}</td>
                  <td
                    className={`p-2 border ${
                      log.source === 'scanned' ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {log.source}
                  </td>
                  <td className="p-2 border">{log.quantity_change || '0'}</td>
                  <td className="p-2 border">{log.current_quantity ?? '-'}</td>
                  <td className="p-2 border">{log.threshold_change || '0'}</td>
                  <td className="p-2 border">{log.current_threshold ?? '-'}</td>
                  <td className="p-2 border text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500 italic">
                  No matching logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
