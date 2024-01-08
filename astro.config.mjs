import { defineConfig } from 'astro/config';
import vue from "@astrojs/vue";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [vue(), tailwind()],
  server: { port: 8282 },
  build: {
    assets: 'astro'
  },
  outDir: 'projectmoon'
});