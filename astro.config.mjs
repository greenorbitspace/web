// astro.config.mjs
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; // Correct Tailwind integration

export default defineConfig({
  site: 'https://greenorbit.space',
  base: '/', // Change if you're deploying to a subdirectory
  integrations: [
    alpinejs(),
    react(),
    tailwind({
      config: {
        applyBaseStyles: true,
      },
    }),
  ],
  vite: {
    server: {
      fs: {
        strict: false, // Useful if you're referencing files outside project root
      },
    },
    build: {
      target: 'esnext',
    },
  },
});