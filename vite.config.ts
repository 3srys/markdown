import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/mermaid')) {
            return 'vendor-mermaid';
          }
          if (id.includes('node_modules/chart.js')) {
            return 'vendor-chartjs';
          }
          if (id.includes('node_modules/katex')) {
            return 'vendor-katex';
          }
          if (id.includes('node_modules/shiki') || id.includes('node_modules/@shikijs')) {
            return 'vendor-shiki';
          }
        }
      }
    }
  }
});

