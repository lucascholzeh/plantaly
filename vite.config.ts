/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
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
