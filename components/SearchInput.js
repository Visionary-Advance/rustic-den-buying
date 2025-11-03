'use client';

import { useState } from 'react';

export default function SearchInput({ onSearch, onToggleScanner }) {
  const [upc, setUpc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!upc.trim()) return;

    setIsLoading(true);
    await onSearch(upc.trim());
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={upc}
          onChange={(e) => setUpc(e.target.value)}
          placeholder="Enter UPC code..."
          className="flex-1 px-4 py-3 text-lg border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          disabled={isLoading}
          pattern="[0-9]*"
          inputMode="numeric"
        />
        <button
          type="submit"
          disabled={isLoading || !upc.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <button
        type="button"
        onClick={onToggleScanner}
        className="w-full px-6 py-3 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Scan Barcode with Camera
      </button>
    </div>
  );
}
