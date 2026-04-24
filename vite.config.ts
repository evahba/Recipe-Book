import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5200,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
      '/best-practices': { target: 'https://3847sst.kuftyrev.cloud', changeOrigin: true },
      '/quality-checks': { target: 'https://3847sst.kuftyrev.cloud', changeOrigin: true },
      '/comparisons': { target: 'https://3847sst.kuftyrev.cloud', changeOrigin: true },
      '/execution-issues': { target: 'https://3847sst.kuftyrev.cloud', changeOrigin: true },
      '/execution-overview': { target: 'https://3847sst.kuftyrev.cloud', changeOrigin: true },
      '/quality-guide': { target: 'https://3847sst.kuftyrev.cloud', changeOrigin: true },
    },
  },
})
