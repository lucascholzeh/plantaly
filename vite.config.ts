/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'Plantaly',
        short_name: 'Plantaly',
        description: 'Cuidado de plantas de casa: saiba quando regar cada uma.',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#E9EFE4',
        theme_color: '#E9EFE4',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icone-mascarado-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}'],
        runtimeCaching: [
          {
            // Dados do Supabase: rede primeiro, cache como rede de segurança.
            // O contrário mostraria rega de ontem como se fosse de hoje — e a
            // seção 12 exige que o app não finja.
            urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/rest\/v1\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dados-plantaly',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Autenticação nunca é servida de cache: token vencido em cache
            // produz sessão fantasma.
            urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/auth\//,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'testes/**/*.test.ts'],
    // Prefixo vazio: carrega também as variáveis sem VITE_ (credenciais de
    // teste). Fica restrito a `test`, então nada disso entra no bundle.
    env: loadEnv(mode, process.cwd(), ''),
    testTimeout: 30000,
  },
}))
