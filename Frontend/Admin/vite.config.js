import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../Shared'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-hook-form': path.resolve(__dirname, 'node_modules/react-hook-form'),
      '@hookform/resolvers': path.resolve(__dirname, 'node_modules/@hookform/resolvers'),
      zod: path.resolve(__dirname, 'node_modules/zod'),
      axios: path.resolve(__dirname, 'node_modules/axios'),
      'socket.io-client': path.resolve(__dirname, 'node_modules/socket.io-client'),
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
