import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Stub out @mediapipe/pose since we're only using MoveNet
      '@mediapipe/pose': path.resolve(__dirname, './src/stubs/mediapipe-pose-stub.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@mediapipe/pose'],
    include: [
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow-models/pose-detection',
    ],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
})
