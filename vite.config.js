import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'
import portfolioPlugin from './vite-plugin-portfolio.js'

export default defineConfig({
  plugins: [react(), svgr(), portfolioPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
