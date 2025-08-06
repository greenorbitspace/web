import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeWrapper({ items = [], customerEmail = null }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function createPaymentIntent() {
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, customerEmail }),
        });

        let data;
        try {
          data = await res.json();
        } catch {
          const text = await res.text();
          throw new Error(text || 'Failed to parse response from server');
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to create PaymentIntent');
        }

        if (isMounted) {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      }
    }

    createPaymentIntent();

    return () => {
      isMounted = false;
    };
  }, [items, customerEmail]);

  const options = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  if (error) return <p className="text-red-600">{error}</p>;

  return clientSecret ? (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm customerEmail={customerEmail} />
    </Elements>
  ) : (
    <p>Loading payment form...</p>
  );
}