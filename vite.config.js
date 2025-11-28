import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),

  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        
          supabase: ['@supabase/supabase-js'],
          carousel: ['embla-carousel-react', 'embla-carousel-autoplay'],
          editor: ['react-quill-new', 'quill'],
          pdf: ['react-pdf', 'pdfjs-dist'],
          animations: ['framer-motion']
        },
      },
    },

    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'react-is',
      'prop-types',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'hoist-non-react-statics'
    ],
    // ❌ REMOVE EXCLUDE → It breaks MUI and Emotion
  },

  esbuild: {
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
  },
})
