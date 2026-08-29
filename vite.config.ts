/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      // `injectManifest` porque o service worker é escrito à mão: o modo
      // gerado não permite acrescentar o tratamento de `push`, e sem ele a
      // notificação chega ao aparelho mas não aparece na tela.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
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
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}'],
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
