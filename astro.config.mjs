import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://greenorbit.space',
  base: '/',
  integrations: [
    alpinejs(),
    react({ fastRefresh: true }),
    tailwind({ config: { applyBaseStyles: true } }),
  ],
  vite: {
    server: {
      fs: { strict: false },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      rollupOptions: {
        // Treat gray-matter as external so it's not bundled for the browser
        external: ['gray-matter', 'node-fetch'],
      },
    },
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
        '@data': '/src/data',
        '@assets': '/src/assets',
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['lightningcss', 'fsevents', 'gray-matter', 'node-fetch'],
      esbuildOptions: {
        loader: {
          '.ts': 'ts',
          '.tsx': 'tsx',
          '.js': 'js',
          '.jsx': 'jsx',
        },
      },
    },
    esbuild: {
      loader: 'tsx',
      include: /src\/.*\.(ts|tsx|js|jsx|astro)$/,
      exclude: [],
    },
  },
});