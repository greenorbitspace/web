import React, { useState } from 'react';

export default function CheckoutButton({
  priceId,
  successUrl,
  cancelUrl,
  quantity = 1,
  mode = 'subscription',
  customerEmail = null,
  metadata = {},
  buttonText = 'Subscribe',
  className = 'btn-primary px-6 py-3 rounded text-white bg-blue-600 hover:bg-blue-700 transition',
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

async function handleCheckout() {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    // Just read text once here
    const raw = await response.text();

    console.log('Raw response text:', raw);

    if (!response.ok) {
      throw new Error(raw);
    }

    const data = JSON.parse(raw);

    if (!data.url) {
      throw new Error('No checkout URL returned');
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
        className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-busy={loading}
      >
        {loading ? 'Processing...' : buttonText}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}