import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Financial System',
        short_name: 'FinSys',
        description: 'Саркофаг Финансовой Независимости',
        theme_color: '#0c1426',
        background_color: '#0c1426',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
