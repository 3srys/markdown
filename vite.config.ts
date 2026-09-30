import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    modulePreload: {
      polyfill: false,
      resolveDependencies: (_filename, deps) => {
        // Do NOT preload heavy vendor chunks on page load; load on-demand instead
        return deps.filter((dep) => !dep.includes('vendor-'));
      },
    },
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
        },
      },
    },
  },
});

