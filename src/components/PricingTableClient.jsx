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

  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan="6" className="p-4 text-center text-red-500">{error}</td>
        </tr>
      </tbody>
    );
  }

  if (plans.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan="6" className="p-4 text-center">Loading plans...</td>
        </tr>
      </tbody>
    );
  }

  return (
    <>
      <tbody>
        {paginatedPlans.map((plan) => {
          // Since your API returns products with prices array,
          // you might want to display the default price or the first price:
          const defaultPrice = plan.prices.find(p => p.id === plan.default_price_id) || plan.prices[0];
          const price = defaultPrice?.unit_amount
            ? `£${(defaultPrice.unit_amount / 100).toFixed(2)}`
            : 'Contact us';
          const interval = defaultPrice?.recurring?.interval || 'One-time';
          const features = (plan.metadata?.features || plan.product?.metadata?.features || '')
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean);

          return (
            <tr key={plan.id} className="border-t">
              <td className="p-2">{plan.name || plan.product?.name}</td>
              <td className="p-2">{plan.description || plan.product?.description || '—'}</td>
              <td className="p-2">{price}</td>
              <td className="p-2">{interval}</td>
              <td className="p-2">
                <ul className="list-disc ml-4">
                  {features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </td>
              <td className="p-2 text-center">
                <a href={`/checkout?price_id=${defaultPrice?.id}`} className="btn">
                  Select
                </a>
              </td>
            </tr>
          );
        })}
      </tbody>

      <tfoot>
        <tr>
          <td colSpan="6" className="pt-4 text-center">
            <div className="flex items-center justify-between max-w-md mx-auto">
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
  );
}