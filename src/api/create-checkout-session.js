import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
const app = express();

app.use(express.json());

// Consider loading this from a config file, database, or Stripe products/prices API
const ALLOWED_PRICE_IDS = new Set([
  'price_1Hh1YZ2eZvKYlo2CYOURIDHERE',
  'price_1Hh1YZ2eZvKYlo2COTHERIDHERE',
]);

// Helper to validate URLs more robustly
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

app.post('/create-checkout-session', async (req, res) => {
  const {
    priceId,
    successUrl,
    cancelUrl,
    quantity = 1,
    mode = 'subscription',
    customerEmail,
    metadata = {},
  } = req.body;

  if (!priceId || !successUrl || !cancelUrl) {
    return res.status(400).json({ error: 'Missing required parameters: priceId, successUrl, cancelUrl' });
  }

  if (!ALLOWED_PRICE_IDS.has(priceId)) {
    return res.status(400).json({ error: 'Invalid priceId' });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be a positive integer' });
  }

  if (!isValidUrl(successUrl) || !isValidUrl(cancelUrl)) {
    return res.status(400).json({ error: 'successUrl and cancelUrl must be valid HTTPS URLs' });
  }

  try {
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity }],
      mode, // 'subscription' or 'payment'
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    };

    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);

    // In development, you might want to return err.message for easier debugging
    const errorMsg = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';

    return res.status(500).json({ error: errorMsg });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));