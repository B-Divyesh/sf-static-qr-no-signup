import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        privacy: resolve(process.cwd(), 'privacy/index.html'),
        terms: resolve(process.cwd(), 'terms/index.html'),
        notFound: resolve(process.cwd(), '404.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('jsqr')) return 'verify';
          if (id.includes('fflate')) return 'zip';
        },
      },
    },
  },
});
