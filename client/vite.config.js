
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react({
      // Ensure React is properly configured for all components
      include: "**/*.{jsx,tsx}",
    }),

    // ✅ Enable Gzip Compression for Faster Load Times
    viteCompression(),

    // ✅ Add Progressive Web App (PWA) Support
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit instead of default 2MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      manifest: {
        name: "DiabolicalXme",
        short_name: "DiabolicalXme",
        description: "Discover bold contemporary fashion at DiabolicalXme.",
        theme_color: "#093624",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "/vite.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Ensure React is available globally
    global: 'globalThis',
  },
  build: {
    // ✅ Enable Code Splitting to Reduce Initial Load Time
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep all React-related code in one chunk to prevent hook issues
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          // Redux and state management
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          // UI and animation libraries
          'ui-vendor': ['framer-motion', 'lucide-react'],
          // Utility libraries
          'utils-vendor': ['axios', 'clsx', 'class-variance-authority']
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173, // or any other available port
    open: true, // Opens the browser automatically
    strictPort: true, // Prevents port conflicts
    cors: true, // Ensures CORS works properly
  },

});
  