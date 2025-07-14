// @ts-check
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  base: '/', // ✅ Set this to your GitHub repo name
  integrations: [
    alpinejs()
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});