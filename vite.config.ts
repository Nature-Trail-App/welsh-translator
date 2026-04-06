import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    svelte(),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'core/index': resolve(__dirname, 'src/core/index.ts'),
        'svelte/index': resolve(__dirname, 'src/svelte/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['svelte', 'bits-ui', /^svelte\//],
    },
  },
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
