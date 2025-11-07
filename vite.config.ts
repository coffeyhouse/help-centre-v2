import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { watch } from 'fs'

// Custom plugin to watch public/data directory and trigger HMR
function watchPublicData() {
  return {
    name: 'watch-public-data',
    configureServer(server) {
      // Watch the public/data directory for changes
      const watcher = watch(
        './public/data',
        { recursive: true },
        (eventType, filename) => {
          if (filename) {
            console.log(`[public/data] ${eventType}: ${filename}`)
            // Trigger full reload when data files change
            server.ws.send({
              type: 'full-reload',
              path: '*'
            })
          }
        }
      )

      server.httpServer?.once('close', () => {
        watcher.close()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    watchPublicData(),
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
