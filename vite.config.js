import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { splitVendorChunkPlugin } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    // Bundle analyzer (only in build)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  build: {
    // Enable tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          firebase: ['firebase'],
          supabase: ['@supabase/supabase-js'],
          carousel: ['embla-carousel-react', 'embla-carousel-autoplay'],
          editor: ['react-quill-new', 'quill'],
          pdf: ['react-pdf', 'pdfjs-dist'],
          animations: ['framer-motion']
        },
      },
    },
    // Enable source maps for development, disable for production
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Enable compression
  server: {
    compress: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion'
    ],
    exclude: [
      // Let Vite handle these for better tree shaking
      '@mui/material',
      '@mui/icons-material'
    ],
  },
  // Enable better tree shaking
  esbuild: {
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
  },
})
