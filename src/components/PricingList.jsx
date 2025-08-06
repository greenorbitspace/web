import React, { useState, useMemo } from 'react';

const fallbackLogo = '/logos/default-placeholder.svg';

function formatPrice(amount, currency) {
  if (typeof amount !== 'number') return '';
  const formatted = (amount / 100).toFixed(2);
  return currency?.toLowerCase() === 'gbp' ? `£${formatted}` : `${formatted} ${currency?.toUpperCase() || ''}`;
}

function CheckoutButton({ priceId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: window.location.origin + '/success',
          cancelUrl: window.location.origin + '/pricing',
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create checkout session';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const text = await response.text();
          errorMessage = text.length > 200 ? text.slice(0, 200) + '...' : text;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('No checkout URL returned from server');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`mt-3 inline-block px-4 py-2 bg-accent-600 text-white rounded hover:bg-accent-700 disabled:opacity-50`}
        aria-busy={loading}
      >
        {loading ? 'Processing...' : 'Buy / Subscribe'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </>
  );
}

export default function PricingList({ products = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeInterval, setActiveInterval] = useState('All');

  // Collect unique categories
  const categories = useMemo(() => {
    const catSet = new Set();
    products.forEach(({ category }) => {
      if (category && category.trim()) catSet.add(category.trim());
    });
    return ['All', ...Array.from(catSet).sort()];
  }, [products]);

  // Filter products by search term, category and interval
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return products.filter(({ product_name, description, category, prices }) => {
      const searchableText = [product_name, description, category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchableText.includes(term);
      const matchesCategory = activeCategory === 'All' || (category || '').toLowerCase() === activeCategory.toLowerCase();
      const matchesInterval =
        activeInterval === 'All' ||
        prices.some(
          (price) =>
            price.recurring?.interval &&
            price.recurring.interval.toLowerCase() === activeInterval.toLowerCase()
        );

      return matchesSearch && matchesCategory && matchesInterval;
    });
  }, [products, searchTerm, activeCategory, activeInterval]);

  return (
    <section className="space-y-8" aria-label="Pricing Directory">
      {/* Category Filter */}
      <nav
        className="flex flex-wrap gap-2 border-b pb-3 border-gray-300 dark:border-gray-600"
        role="tablist"
        aria-label="Filter by Category"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
              activeCategory === cat
                ? 'bg-accent-600 text-white shadow'
                : 'text-gray-700 dark:text-gray-200 hover:bg-accent-100 dark:hover:bg-accent-700'
            }`}
          >
            {cat === 'All' ? 'All Categories' : cat}
          </button>
        ))}
      </nav>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold" id="pricing-search-heading">
          Our Pricing Plans
        </h2>
        <input
          type="search"
          placeholder="Search pricing plans..."
          aria-labelledby="pricing-search-heading"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Products List */}
      <ul
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredProducts.length === 0 ? (
          <li className="italic text-accent-500" role="alert">
            No pricing plans found.
          </li>
        ) : (
          filteredProducts.map(
            ({
              id,
              product_name,
              description,
              category,
              prices,
              marketing_features = [], // Array of feature strings
              featureDescription = '', // Optional feature description
            }) => (
              <li
                key={id}
                className="border border-accent-500 rounded-lg p-6 bg-white dark:bg-secondary-700 hover:shadow-lg transition flex flex-col"
                role="listitem"
              >
                <article className="flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-accent-600 mb-1">{product_name}</h3>

                  {category && (
                    <p className="mb-2 text-xs font-semibold text-white uppercase">{category}</p>
                  )}

                  {description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">{description}</p>
                  )}

                  {/* Marketing Feature List */}
                  {marketing_features.length > 0 && (
                    <section className="mb-4">
                      <h4 className="text-lg font-semibold text-accent-700 mb-2">Marketing Feature List</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {marketing_features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                      {featureDescription && (
                        <p className="mt-2 text-sm italic text-gray-600 dark:text-gray-400">
                          {featureDescription}
                        </p>
                      )}
                    </section>
                  )}

                  <ul className="space-y-6">
                    {prices.map((price, idx) => (
                      <li
                        key={`${id}-price-${idx}`}
                        className="border-t pt-4 first:border-t-0 first:pt-0"
                      >
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                          {price.nickname || price.description || product_name}
                        </p>
                        <p className="text-lg font-bold text-accent-500 dark:text-accent-500">
                          {formatPrice(price.unit_amount, price.currency)}
                          {price.recurring
                            ? ` / ${price.recurring.interval_count > 1 ? price.recurring.interval_count : ''}${price.recurring.interval}`
                            : ''}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Billing scheme: {price.billing_scheme}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Tax behavior: {price.tax_behavior}
                        </p>

                        <CheckoutButton priceId={price.id} />
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            )
          )
        )}
      </ul>
    </section>
  );
}