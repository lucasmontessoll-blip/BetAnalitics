import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname =
  path.dirname(
    fileURLToPath(import.meta.url)
  );

function playConsumptionOnly(mode) {
  return {
    name: 'betanalytics-play-consumption-only',
    enforce: 'pre',

    transform(code, id) {
      const normalized =
        String(id || '').replace(/\\/g, '/');

      if (
        mode === 'play' &&
        normalized.endsWith('/src/lazyViews.js')
      ) {
        return {
          code: code.replace(
            "() => import('./components/CasasParceirasPro.jsx')",
            "() => Promise.resolve({ default: () => null })"
          ),
          map: null
        };
      }

      if (
        mode !== 'play' ||
        !normalized.endsWith('/src/App.jsx')
      ) {
        return null;
      }

      const transformed =
        code
          .replace(
            "import { initMercadoPago } from '@mercadopago/sdk-react';",
            "const initMercadoPago = () => {};"
          )
          .replaceAll(
            '/api/pagamento/pix',
            '/api/playstore/disabled/pix'
          )
          .replaceAll(
            '/api/pagamento/cartao',
            '/api/playstore/disabled/cartao'
          )
          .replaceAll(
            '/api/pagamento/status/',
            '/api/playstore/disabled/status/'
          )
          .replaceAll(
            'https://sdk.mercadopago.com/js/v2',
            'about:blank'
          );

      return {
        code: transformed,
        map: null
      };
    }
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    playConsumptionOnly(mode),
    react(),
    tailwindcss()
  ],

  resolve: {
    alias: {
      '@bet-assinatura':
        path.resolve(
          __dirname,
          mode === 'play'
            ? 'src/components/AssinaturaPlayStore.jsx'
            : 'src/components/AssinaturaPro.jsx'
        )
    }
  },

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
}));
