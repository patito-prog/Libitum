import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA: hace la web instalable en el móvil (icono en la pantalla de inicio,
    // se abre a pantalla completa). 'autoUpdate' = los usuarios reciben siempre
    // la última versión sin tener que limpiar caché.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Libitum · Música en vivo y arte callejero',
        short_name: 'Libitum',
        description: 'Descubre conciertos y artistas de calle, síguelos y no te pierdas ningún directo.',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        theme_color: '#1a7d82',
        background_color: '#f4efe3',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            // Icono "maskable": se adapta a la forma del icono de cada móvil.
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
