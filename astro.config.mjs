// @ts-check
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';      // <-- Import React integration
import dotenv from 'dotenv';

// Load .env file into import.meta.env
dotenv.config();

// https://astro.build/config
export default defineConfig({
  site: 'https://new.greenorbit.space',
  base: process.env.NODE_ENV === 'production' ? '/web/' : '/',
  integrations: [
    alpinejs(),
    react(),              // <-- Add React integration here
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Optional: Make env variables accessible in client (if needed)
      'import.meta.env.STRIPE_SECRET_KEY': JSON.stringify(process.env.STRIPE_SECRET_KEY),
    },
  },
});