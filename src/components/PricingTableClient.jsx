import React, { useEffect, useState } from 'react';

export default function PricingTableClient() {
  const [plans, setPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const pageSize = 5;

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/pricing');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPlans(data);
      } catch (err) {
        console.error('Error loading Stripe plans:', err);
        setError('Failed to load plans.');
      }
    }
    fetchPlans();
  }, []);

  const totalPages = Math.ceil(plans.length / pageSize);
  const paginatedPlans = plans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left border border-gray-700">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3">Plan</th>
            <th className="p-3">Description</th>
            <th className="p-3">Price</th>
            <th className="p-3">Billing</th>
            <th className="p-3">Features</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>

        {error && (
          <tbody>
            <tr>
              <td colSpan="6" className="p-4 text-center text-red-500">{error}</td>
            </tr>
          </tbody>
        )}

        {!error && plans.length === 0 && (
          <tbody>
            <tr>
              <td colSpan="6" className="p-4 text-center">Loading plans...</td>
            </tr>
          </tbody>
        )}

        {!error && plans.length > 0 && (
          <>
            <tbody>
              {paginatedPlans.map((plan) => {
                const defaultPrice =
                  plan.prices.find(p => p.id === plan.default_price_id) || plan.prices[0];

                if (!defaultPrice) return null; // Skip plans without a price

                const price = defaultPrice.unit_amount
                  ? `£${(defaultPrice.unit_amount / 100).toFixed(2)}`
                  : 'Contact us';

                const interval = defaultPrice.recurring?.interval || 'One-time';

                const features = (
                  plan.metadata?.features ||
                  plan.product?.metadata?.features ||
                  ''
                )
                  .split(',')
                  .map(f => f.trim())
                  .filter(Boolean);

                const ctaLabel =
                  plan.metadata?.cta || 'Select';

                return (
                  <tr key={plan.id} className="border-t border-gray-700">
                    <td className="p-3 font-medium">{plan.name || plan.product?.name}</td>
                    <td className="p-3">{plan.description || plan.product?.description || '—'}</td>
                    <td className="p-3">{price}</td>
                    <td className="p-3 capitalize">{interval}</td>
                    <td className="p-3">
                      <ul className="list-disc list-inside space-y-1">
                        {features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3 text-center">
                      <a
                        href={`/checkout?price_id=${defaultPrice.id}`}
                        className="btn btn-primary"
                      >
                        {ctaLabel}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="6" className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      className="px-4 py-2 bg-accent-500 rounded hover:bg-secondary-500 disabled:opacity-50"
                      onClick={handlePrev}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-white">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="px-4 py-2 bg-accent-500 rounded hover:bg-secondary-500 disabled:opacity-50"
                      onClick={handleNext}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </td>
              </tr>
            </tfoot>
          </>
        )}
      </table>
    </div>
  );
}