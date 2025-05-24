import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'process.env': {}
  },
  server: {
    proxy: {
      '/ipfs': {
        target: 'https://ipfs.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ipfs/, ''),
      },
      '/pinata': {
        target: 'https://gateway.pinata.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pinata/, ''),
      }
    }
  }
});
