// lib/stripeClient.js
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

const stripe = secretKey ? new Stripe(secretKey, {
  apiVersion: '2024-04-10', // or your preferred version
}) : null;

export default stripe;