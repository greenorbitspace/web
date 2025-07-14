// @ts-check
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://greenorbitspace.github.io',
  base: process.env.NODE_ENV === 'production' ? '/web/' : '/',
  integrations: [
    alpinejs()
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});
