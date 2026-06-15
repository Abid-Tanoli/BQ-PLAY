import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../Shared'),
    },
  },
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
    allowedHosts: ['localhost'],
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    fs: {
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
