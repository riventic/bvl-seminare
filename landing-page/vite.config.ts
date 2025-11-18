import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Enable minification (using esbuild, the default)
    minify: 'esbuild',

    // Optimize chunk size
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Manual chunking disabled for Safari compatibility
        // MUI v6.1.0+ has circular dependencies between React/Emotion/MUI that cause
        // "Cannot access uninitialized variable" errors in Safari when split into chunks
        // Let Vite handle automatic chunking which respects module initialization order
        // manualChunks: (id) => {
        //   // Safari-compatible chunking strategy
        //   // Keep interdependent libraries together to avoid circular dependencies
        //   if (id.includes('node_modules')) {
        //     // MUI icons FIRST (must check before general @mui/)
        //     if (id.includes('@mui/icons-material')) {
        //       return 'mui-icons';
        //     }

        //     // React + MUI + Emotion MUST be together (circular deps since MUI v6.1.0)
        //     // Safari's strict module loading fails with "Cannot access uninitialized variable" if split
        //     // IMPORTANT: Include ALL @mui packages and React ecosystem dependencies
        //     if (
        //       id.includes('react') ||
        //       id.includes('react-dom') ||
        //       id.includes('react-router') ||
        //       id.includes('@mui/') ||  // ALL MUI packages (material, system, base, utils, etc.)
        //       id.includes('@emotion') ||
        //       id.includes('scheduler') ||
        //       id.includes('prop-types') ||
        //       id.includes('react-is')
        //     ) {
        //       return 'react-mui-vendor';
        //     }

        //     // React Query + Axios
        //     if (id.includes('@tanstack/react-query') || id.includes('axios')) {
        //       return 'data-vendor';
        //     }

        //     // Recharts (only loads on BDE page)
        //     if (id.includes('recharts') || id.includes('d3-')) {
        //       return 'charts';
        //     }

        //     // Date utilities
        //     if (id.includes('date-fns')) {
        //       return 'utils';
        //     }

        //     // Everything else from node_modules
        //     return 'vendor';
        //   }
        // },
      },
    },

    // Enable source maps for debugging (disable in production)
    sourcemap: false,

    // Optimize CSS
    cssCodeSplit: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      '@mui/material',
      '@tanstack/react-query',
    ],
  },
})
