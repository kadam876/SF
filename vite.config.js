import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Raise the warning limit slightly — splits will bring it down
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor: cached permanently between deploys (hash changes only with package updates)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', '@react-oauth/google'],
          // Admin pages: never downloaded by regular shoppers
          'chunk-admin': [
            './src/pages/admin/Dashboard',
            './src/pages/admin/Orders',
            './src/pages/admin/AdminUsers',
            './src/pages/admin/InventoryDashboard',
          ],
          // User pages: separate from admin
          'chunk-user': [
            './src/pages/user/Shop',
            './src/pages/user/ProductDetail',
            './src/pages/user/Profile',
            './src/pages/user/MyOrders',
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
