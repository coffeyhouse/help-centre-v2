import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    },
    // Watch for file changes in public directory
    watch: {
      usePolling: true,
      interval: 300,
    },
    // Configure headers to prevent caching of data files in development
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  }
})
