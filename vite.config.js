import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/jake-shop/',
  build: {
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        studio: resolve(import.meta.dirname, 'studio/index.html'),
        card: resolve(import.meta.dirname, 'card/index.html'),
      },
    },
  },
});
