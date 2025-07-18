import stripe from '../../lib/stripeClient.js';

export async function GET() {
  if (!stripe) {
    console.error('Stripe client not initialised. Check STRIPE_SECRET_KEY in .env');
    return new Response(
      JSON.stringify({ error: 'Stripe configuration error.' }),
      { status: 500 }
    );
  }

  try {
    const [products, prices] = await Promise.all([
      stripe.products.list({ active: true }),
      stripe.prices.list({ active: true }),
    ]);

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
    console.error('Stripe Pricing API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to load Stripe pricing.' }),
      { status: 500 }
    );
  }
}