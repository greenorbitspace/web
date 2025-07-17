// /src/pages/api/stripe-pricing.ts
import Stripe from 'stripe';

const stripeSecret = import.meta.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-04-10',
});

export async function GET() {
  try {
    // Fetch all active prices with expanded product info
    const prices = await stripe.prices.list({
      expand: ['data.product'],
      active: true,
    });

    // Map Stripe response to a cleaner JSON structure for frontend
    const result = prices.data.map((price) => {
      const product = price.product as Stripe.Product;
      return {
        id: price.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          metadata: product.metadata,
        },
      };
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return new Response('Failed to fetch Stripe pricing', {
      status: 500,
    });
  }
}