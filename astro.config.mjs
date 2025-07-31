import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://greenorbit.space',
  base: '/',
  integrations: [
    alpinejs(),
    react({
      fastRefresh: true,
      // reactVersion auto-detected, so no need to specify explicitly
    }),
    tailwind({
      config: {
        applyBaseStyles: true,
      },
    }),
  ],
  vite: {
    server: {
      fs: {
        strict: false, // Required if serving files outside root (symlinks/monorepos)
      },
    },
    build: {
      target: 'esnext',      // Modern browsers; can speed up build & output smaller code
      minify: 'esbuild',     // Fast minifier, good default
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
      include: [
        'react',
        'react-dom',
        // Avoid '@astrojs/react/client' here due to known build issues
      ],
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