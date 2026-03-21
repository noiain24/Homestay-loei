import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api/booking': {
          target: 'https://n8n.srv1515012.hstgr.cloud/webhook/booking_log',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/booking/, ''),
        },
        '/api/checkphone': {
          target: 'https://n8n.srv1515012.hstgr.cloud/webhook/checkphone',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/checkphone/, ''),
        },
        '/api/cancel': {
          target: 'https://n8n.srv1515012.hstgr.cloud/webhook/cancle',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cancel/, ''),
        },
        '/api/gas-room-status': {
          target: 'https://script.google.com/macros/s/AKfycbxkwUBjmR1W9e51sV9DqOcK7N-jLXLdWpZM4f8kQemwQxHgPoWTli2dwrYuezHSAhtp/exec',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gas-room-status/, ''),
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
