// src/pages/api/pricing.js
import stripe from '../../../lib/stripeClient.js'; // Adjust path as needed

export async function GET() {
  try {
    // Get active products and prices
    const [products, prices] = await Promise.all([
      stripe.products.list({ active: true }),
      stripe.prices.list({ active: true }),
    ]);

    // Combine price data with corresponding product
    const productsWithPrices = products.data.map((product) => {
      const productPrices = prices.data.filter(
        (price) => price.product === product.id
      );

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        default_price_id: product.default_price || productPrices[0]?.id,
        prices: productPrices.map((price) => ({
          id: price.id,
          currency: price.currency,
          unit_amount: price.unit_amount,
          recurring: price.recurring,
        })),
      };
    });

    return new Response(JSON.stringify(productsWithPrices), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error loading Stripe pricing:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to load Stripe pricing.' }),
      { status: 500 }
    );
  }
}