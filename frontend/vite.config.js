import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/escrowly/',
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          if (id.includes('lottie-web')) return 'vendor-lottie'
          if (id.includes('@tsparticles') || id.includes('/tsparticles/')) return 'vendor-particles'
          if (id.includes('three') || id.includes('@react-three')) return 'vendor-three'
          if (id.includes('framer-motion') || id.includes('gsap') || id.includes('lenis')) return 'vendor-motion'
          if (id.includes('ethers')) return 'vendor-chain'
          if (id.includes('lucide-react') || id.includes('lottie-react')) return 'vendor-ui'
          return 'vendor-core'
        },
      },
    },
  },
})