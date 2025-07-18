// astro.config.mjs
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  site: 'https://new.greenorbit.space',
  base: '/',
  integrations: [
    alpinejs(),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    // Do NOT expose secret keys in client-side code
    // Remove any define for STRIPE_SECRET_KEY here
  },
});