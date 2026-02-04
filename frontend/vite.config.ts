/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const viteConfig = defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
        clientPort: 80
    },
    watch: {
      usePolling: true,
    },
  },
})

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})

export default mergeConfig(viteConfig, vitestConfig)
