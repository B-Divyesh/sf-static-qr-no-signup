import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('jsqr')) return 'verify';
          if (id.includes('fflate')) return 'zip';
        },
      },
    },
  },
});
