'use client';

export default function ProductDisplay({ product, pricing }) {
  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getPricingColor = (tier) => {
    const colors = {
      HIGH_DEMAND: 'text-green-600 dark:text-green-400',
      MEDIUM_DEMAND: 'text-blue-600 dark:text-blue-400',
      LOW_DEMAND: 'text-yellow-600 dark:text-yellow-400',
      OVERSUPPLIED: 'text-orange-600 dark:text-orange-400',
      NOT_ACCEPTING: 'text-red-600 dark:text-red-400',
    };
    return colors[tier] || 'text-zinc-600 dark:text-zinc-400';
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Product Image Placeholder */}
          <div className="flex-shrink-0 w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18"
              />
            </svg>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              {product.title || 'Product Information'}
            </h2>

            {product.alias && (
              <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                {product.alias}
              </p>
            )}

            {product.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">
                {product.description}
              </p>
            )}

            <div className="space-y-1 text-sm">
              <p className="text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold">UPC:</span> {product.barcode}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        {pricing && (
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                  We'll buy this for:
                </span>
                <span
                  className={`text-3xl font-bold ${getPricingColor(
                    pricing.tier
                  )}`}
                >
                  {formatPrice(pricing.price)}
                </span>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {pricing.reason}
              </p>

              {pricing.tier === 'NOT_ACCEPTING' && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    We currently have too many copies of this item and are not
                    accepting more at this time.
                  </p>
                </div>
              )}

              {pricing.tier === 'HIGH_DEMAND' && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Great choice! This is a high-demand item we're actively looking for.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
