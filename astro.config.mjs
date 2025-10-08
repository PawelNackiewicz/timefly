import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable SSR for API routes
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
