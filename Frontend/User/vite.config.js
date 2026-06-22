import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(currentDir, '../Shared'),
      react: path.resolve(currentDir, 'node_modules/react'),
      'react-dom': path.resolve(currentDir, 'node_modules/react-dom'),
      'react-hook-form': path.resolve(currentDir, 'node_modules/react-hook-form'),
      '@hookform/resolvers': path.resolve(currentDir, 'node_modules/@hookform/resolvers'),
      zod: path.resolve(currentDir, 'node_modules/zod'),
      axios: path.resolve(currentDir, 'node_modules/axios'),
      'socket.io-client': path.resolve(currentDir, 'node_modules/socket.io-client'),
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
