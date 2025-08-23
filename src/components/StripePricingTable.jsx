// src/components/StripePricingTable.jsx
import { useEffect } from 'react';

export default function StripePricingTable({ pricingTableId, publishableKey }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      const table = document.createElement('stripe-pricing-table');
      table.setAttribute('pricing-table-id', pricingTableId);
      table.setAttribute('publishable-key', publishableKey);
      document.getElementById('stripe-container').appendChild(table);
    };
  }, [pricingTableId, publishableKey]);

  return <div id="stripe-container"></div>;
}