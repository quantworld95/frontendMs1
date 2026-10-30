import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/alojamientos': { target: 'http://localhost:8081', changeOrigin: true },
      '/catalogos-alojamiento': { target: 'http://localhost:8081', changeOrigin: true },
      '/sesiones': { target: 'http://localhost:8081', changeOrigin: true },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
