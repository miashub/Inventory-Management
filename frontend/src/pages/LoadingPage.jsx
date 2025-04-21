/**
 * LoadingPage Component
 *
 * Shows a loading screen while waiting for backend or data to be ready.
 */

import React from 'react';

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Connecting to inventory system...</h2>
      <p className="text-gray-500 mt-2">Please wait while we fetch your data.</p>
    </div>
  );
}
