import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Unit tests for pure logic (no DOM). Mirrors the `@` alias / envPrefix from vite.config.ts.
export default defineConfig({
  envPrefix: ['VITE_', 'API_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      API_BASE_URL: 'http://localhost:3000/api/v1',
    },
  },
})
