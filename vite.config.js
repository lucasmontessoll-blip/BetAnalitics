import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  server: {
    host: '0.0.0.0',
    port: 5173
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('recharts')) {
            return 'vendor-charts';
          }

          if (id.includes('firebase')) {
            return 'vendor-firebase';
          }

          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }

          if (
            id.includes('@mercadopago') ||
            id.includes('/mercadopago/')
          ) {
            return 'vendor-payments';
          }

          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }

          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router') ||
            id.includes('\\react\\') ||
            id.includes('\\react-dom\\')
          ) {
            return 'vendor-react';
          }

          if (id.includes('jspdf')) {
            return 'vendor-pdf';
          }

          return;
        }
      }
    }
  }
});