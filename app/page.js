'use client';

import { useState } from 'react';
import SearchInput from '@/components/SearchInput';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductDisplay from '@/components/ProductDisplay';

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [product, setProduct] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (upc) => {
    setIsLoading(true);
    setError(null);
    setProduct(null);
    setPricing(null);

    try {
      // Fetch product info from UPC database
      const productResponse = await fetch(`/api/lookup-upc?upc=${encodeURIComponent(upc)}`);

      if (!productResponse.ok) {
        const errorData = await productResponse.json();
        throw new Error(errorData.error || 'Failed to lookup UPC');
      }

      const productData = await productResponse.json();

      // Check if we have results
      if (!productData.items || productData.items.length === 0) {
        throw new Error('No product found with this UPC code');
      }

      const foundProduct = productData.items[0];

      // Fetch pricing info
      const pricingResponse = await fetch(`/api/pricing?upc=${encodeURIComponent(upc)}`);
      const pricingData = await pricingResponse.json();

      setProduct(foundProduct);
      setPricing(pricingData);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (upc) => {
    setShowScanner(false);
    await handleSearch(upc);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Rustic Den Buying
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Scan or enter UPC codes to get instant pricing
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <SearchInput
            onSearch={handleSearch}
            onToggleScanner={() => setShowScanner(true)}
          />

          {isLoading && (
            <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Looking up product...</span>
            </div>
          )}

          {error && (
            <div className="w-full max-w-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg">
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
            </div>
          )}

          {product && pricing && (
            <ProductDisplay product={product} pricing={pricing} />
          )}

          {!product && !error && !isLoading && (
            <div className="text-center text-zinc-500 dark:text-zinc-500 mt-8">
              <p>Enter a UPC code or scan a barcode to get started</p>
            </div>
          )}
        </div>
      </main>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
