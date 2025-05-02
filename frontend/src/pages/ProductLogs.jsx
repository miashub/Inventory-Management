// frontend/src/pages/ProductLogs.jsx

/**
 * Product Logs Page Component
 * 
 * Displays a comprehensive view of product inventory change logs with advanced filtering,
 * sorting, and pagination capabilities. Integrates with backend API to fetch and display
 * product modification history.
 * 
 * Key Features:
 * - Real-time log data fetching with error handling
 * - Multi-criteria filtering (product name, SKU, action type, source, date range)
 * - Configurable sorting on multiple columns
 * - Client-side pagination with configurable page size
 * - CSV export functionality for filtered data
 * - Responsive design with mobile-friendly layout
 * - Visual status indicators for product state (expired, deleted, low stock)
 * 
 * State Management:
 * - Maintains filter, sort, and pagination states
 * - Memoizes filtered results for performance optimization
 * - Handles API errors gracefully with console logging
 */

import { useEffect, useMemo, useState } from 'react';
import axios from '../utils/axiosInstance';

export default function ProductLogs() {
  // State for storing raw log data from API
  const [logs, setLogs] = useState([]);

  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting and pagination states
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10; // Configurable items per page

  /**
   * Resets all filters to their initial state
   * @function
   */
  const resetFilters = () => {
    setNameFilter('');
    setSkuFilter('');
    setActionFilter('');
    setSourceFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Fetch logs data on component mount
  useEffect(() => {
    axios.get(`/api/logs/`)
      .then(res => setLogs(res.data))
      .catch(err => console.error('Failed to fetch product logs:', err));
  }, []);

  /**
   * Toggles sorting direction or changes sort field
   * @param {string} field - The field to sort by
   */
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  /**
   * Memoized filtered and sorted logs data
   * @type {Array}
   */
  const filtered = useMemo(() => {
    let updated = logs.filter(log =>
      (log.product?.name || '').toLowerCase().includes(nameFilter.toLowerCase()) &&
      (log.product?.sku || '').toLowerCase().includes(skuFilter.toLowerCase()) &&
      (!actionFilter || log.action === actionFilter) &&
      (!sourceFilter || log.source === sourceFilter)
    );

    // Apply date range filtering if dates are provided
    if (startDate) updated = updated.filter(log => new Date(log.timestamp) >= new Date(startDate));
    if (endDate) updated = updated.filter(log => new Date(log.timestamp) <= new Date(endDate));

    // Apply sorting based on current sort field and direction
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
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return updated;
  }, [logs, nameFilter, skuFilter, actionFilter, sourceFilter, startDate, endDate, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / logsPerPage);
  const paginatedLogs = filtered.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  /**
   * Generates and downloads a CSV file of the currently filtered logs
   */
  const downloadCSV = () => {
    const headers = [
      'Product', 'SKU', 'Action', 'Source', 'Qty Change',
      'Current Qty', 'Threshold Change', 'Current Threshold',
      'Expiry Date', 'Timestamp'
    ];

    const rows = filtered.map(log => [
      log.product?.name || 'Unknown',
      log.product?.sku || 'Unknown',
      log.action,
      log.source,
      log.quantity_change || '0',
      log.product?.id === null ? '0' : (log.current_quantity ?? '-'),
      log.threshold_change || '0',
      log.current_threshold ?? '-',
      log.product?.expiry_date || '-',
      new Date(log.timestamp).toLocaleString()
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Determines the status of a product based on log data
   * param {Object} log - The log entry to evaluate
   * returns {string} Status label ('Deleted', 'Expired', 'Low Stock', or 'OK')
   */
  const getStatus = (log) => {
    if (log.product?.id === null) return 'Deleted';
    const expiry = new Date(log.product?.expiry_date);
    const today = new Date();
    if (log.product?.expiry_date && expiry < today) return 'Expired';
    if (log.current_quantity !== undefined && log.current_threshold !== undefined &&
        log.current_quantity <= log.current_threshold) return 'Low Stock';
    return 'OK';
  };

  /**
   * Returns Tailwind CSS classes for a given status
   * @param {string} status - The status to get styles for
   * @returns {string} Tailwind CSS classes
   */
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Expired': return 'bg-red-100 text-red-700';
      case 'Deleted': return 'bg-gray-100 text-gray-600 italic';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      {/* Header Section with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-indigo-800">Product Logs</h2>
          <p className="text-sm text-gray-600">Today: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={downloadCSV} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm shadow"
            aria-label="Download filtered data as CSV"
          >
            Download CSV
          </button>
          <button 
            onClick={resetFilters} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm shadow"
            aria-label="Reset all filters"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Filter Controls Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Name Filter */}
        <input 
          placeholder="Filter by Name" 
          value={nameFilter} 
          onChange={e => setNameFilter(e.target.value)} 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm w-full" 
          aria-label="Filter by product name"
        />
        
        {/* SKU Filter */}
        <input 
          placeholder="Filter by SKU" 
          value={skuFilter} 
          onChange={e => setSkuFilter(e.target.value)} 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm w-full" 
          aria-label="Filter by product SKU"
        />
        
        {/* Action Type Filter */}
        <select 
          value={actionFilter} 
          onChange={e => setActionFilter(e.target.value)} 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm w-full"
          aria-label="Filter by action type"
        >
          <option value="">All Actions</option>
          <option value="add">Add</option>
          <option value="edit">Edit</option>
          <option value="delete">Delete</option>
        </select>
        
        {/* Source Filter */}
        <select 
          value={sourceFilter} 
          onChange={e => setSourceFilter(e.target.value)} 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm w-full"
          aria-label="Filter by source"
        >
          <option value="">All Sources</option>
          <option value="manual">Manual</option>
          <option value="scanned">Scanned</option>
        </select>

        {/* Date Range Filters */}
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-xs text-gray-500 mb-1">From</label>
          <input 
            id="startDate" 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm w-full" 
            aria-label="Filter by start date"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-xs text-gray-500 mb-1">To</label>
          <input 
            id="endDate" 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm w-full" 
            aria-label="Filter by end date"
          />
        </div>

        {/* Sort Controls */}
        <select 
          value={sortField} 
          onChange={e => setSortField(e.target.value)} 
          className="border border-indigo-300 px-3 py-2 rounded-md text-sm bg-white text-indigo-700 focus:ring-2 focus:ring-indigo-500 w-full"
          aria-label="Select field to sort by"
        >
          <option value="timestamp">Sort by Timestamp</option>
          <option value="product_name">Sort by Product Name</option>
          <option value="quantity_change">Sort by Quantity</option>
        </select>
        <select 
          value={sortOrder} 
          onChange={e => setSortOrder(e.target.value)} 
          className="border border-indigo-300 px-3 py-2 rounded-md text-sm bg-white text-indigo-700 focus:ring-2 focus:ring-indigo-500 w-full"
          aria-label="Select sort order"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Logs Table Section */}
      <div className="w-full overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="min-w-[1000px] w-full text-sm border-collapse">
          <thead className="bg-orange-50 text-indigo-800 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort('product_name')}>
                Product {sortField === 'product_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort('quantity_change')}>
                Qty Change {sortField === 'quantity_change' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-left">Current Qty</th>
              <th className="p-3 text-left">Threshold Change</th>
              <th className="p-3 text-left">Current Threshold</th>
              <th className="p-3 text-left">Expiry</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort('timestamp')}>
                Timestamp {sortField === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center text-gray-500 py-4">
                  No logs match the current filters.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, i) => {
                const status = getStatus(log);
                return (
                  <tr 
                    key={`${log.id || i}-${log.timestamp}`} 
                    className={log.action === 'delete' ? 'text-gray-500 bg-gray-100' : i % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}
                  >
                    <td className="p-2 whitespace-nowrap">{log.product?.name || 'Unknown'}</td>
                    <td className="p-2 whitespace-nowrap">{log.product?.sku || 'Unknown'}</td>
                    <td className="p-2 capitalize">{log.action}</td>
                    <td className="p-2">{log.source}</td>
                    <td className={`p-2 ${log.quantity_change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {log.action === 'delete' ? `-${Math.abs(parseInt(log.quantity_change || 0))}` : log.quantity_change}
                    </td>
                    <td className="p-2">{log.product?.id === null ? '0' : (log.current_quantity ?? '-')}</td>
                    <td className="p-2">{log.threshold_change}</td>
                    <td className="p-2">{log.current_threshold ?? '-'}</td>
                    <td className="p-2 whitespace-nowrap">
                      {log.product?.expiry_date ? new Date(log.product.expiry_date).toLocaleDateString() : '—'}
                    </td>
                    <td className={`p-2 text-xs font-semibold rounded ${getStatusStyle(status)}`}>
                      {status}
                    </td>
                    <td className="p-2 text-indigo-700 font-semibold whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap justify-center mt-6 gap-4">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1} 
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          aria-label="Previous page"
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
          disabled={currentPage === totalPages} 
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}