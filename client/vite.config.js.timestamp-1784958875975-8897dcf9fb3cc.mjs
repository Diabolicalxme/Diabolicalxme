// vite.config.js
import path from "path";
import { defineConfig } from "file:///D:/DiabolicalXme/client/node_modules/vite/dist/node/index.js";
import react from "file:///D:/DiabolicalXme/client/node_modules/@vitejs/plugin-react/dist/index.mjs";
import viteCompression from "file:///D:/DiabolicalXme/client/node_modules/vite-plugin-compression/dist/index.mjs";
import { VitePWA } from "file:///D:/DiabolicalXme/client/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "D:\\DiabolicalXme\\client";
var vite_config_default = defineConfig({
  plugins: [
    react({
      // Ensure React is properly configured for all components
      include: "**/*.{jsx,tsx}"
    }),
    // ✅ Enable Gzip Compression for Faster Load Times
    viteCompression(),
    // ✅ Add Progressive Web App (PWA) Support
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // 5MB limit instead of default 2MB
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // 1 year
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
            type: "image/x-icon"
          },
          {
            src: "/vite.svg",
            sizes: "any",
            type: "image/svg+xml"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  define: {
    // Ensure React is available globally
    global: "globalThis"
  },
  build: {
    // ✅ Enable Code Splitting to Reduce Initial Load Time
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep all React-related code in one chunk to prevent hook issues
          "react-vendor": [
            "react",
            "react-dom",
            "react-router-dom",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast"
          ],
          // Redux and state management
          "redux-vendor": ["@reduxjs/toolkit", "react-redux"],
          // UI and animation libraries
          "ui-vendor": ["framer-motion", "lucide-react"],
          // Utility libraries
          "utils-vendor": ["axios", "clsx", "class-variance-authority"]
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1e3
  },
  server: {
    port: 5173,
    // or any other available port
    open: true,
    // Opens the browser automatically
    strictPort: true,
    // Prevents port conflicts
    cors: true
    // Ensures CORS works properly
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEaWFib2xpY2FsWG1lXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRGlhYm9saWNhbFhtZVxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0RpYWJvbGljYWxYbWUvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tIFwidml0ZS1wbHVnaW4tY29tcHJlc3Npb25cIjtcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3Qoe1xyXG4gICAgICAvLyBFbnN1cmUgUmVhY3QgaXMgcHJvcGVybHkgY29uZmlndXJlZCBmb3IgYWxsIGNvbXBvbmVudHNcclxuICAgICAgaW5jbHVkZTogXCIqKi8qLntqc3gsdHN4fVwiLFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gXHUyNzA1IEVuYWJsZSBHemlwIENvbXByZXNzaW9uIGZvciBGYXN0ZXIgTG9hZCBUaW1lc1xyXG4gICAgdml0ZUNvbXByZXNzaW9uKCksXHJcblxyXG4gICAgLy8gXHUyNzA1IEFkZCBQcm9ncmVzc2l2ZSBXZWIgQXBwIChQV0EpIFN1cHBvcnRcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6IFwiYXV0b1VwZGF0ZVwiLFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDUgKiAxMDI0ICogMTAyNCwgLy8gNU1CIGxpbWl0IGluc3RlYWQgb2YgZGVmYXVsdCAyTUJcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsanBnLGpwZWcsZ2lmLHdlYnB9J10sXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdvb2dsZWFwaXNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IC8vIDEgeWVhclxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiBcIkRpYWJvbGljYWxYbWVcIixcclxuICAgICAgICBzaG9ydF9uYW1lOiBcIkRpYWJvbGljYWxYbWVcIixcclxuICAgICAgICBkZXNjcmlwdGlvbjogXCJEaXNjb3ZlciBib2xkIGNvbnRlbXBvcmFyeSBmYXNoaW9uIGF0IERpYWJvbGljYWxYbWUuXCIsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6IFwiIzA5MzYyNFwiLFxyXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6IFwiI2ZmZmZmZlwiLFxyXG4gICAgICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxyXG4gICAgICAgIHN0YXJ0X3VybDogXCIvXCIsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiBcIi9mYXZpY29uLmljb1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCI2NHg2NCAzMngzMiAyNHgyNCAxNngxNlwiLFxyXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3gtaWNvblwiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiBcIi92aXRlLnN2Z1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCJhbnlcIixcclxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9zdmcreG1sXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGRlZmluZToge1xyXG4gICAgLy8gRW5zdXJlIFJlYWN0IGlzIGF2YWlsYWJsZSBnbG9iYWxseVxyXG4gICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcycsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgLy8gXHUyNzA1IEVuYWJsZSBDb2RlIFNwbGl0dGluZyB0byBSZWR1Y2UgSW5pdGlhbCBMb2FkIFRpbWVcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAvLyBLZWVwIGFsbCBSZWFjdC1yZWxhdGVkIGNvZGUgaW4gb25lIGNodW5rIHRvIHByZXZlbnQgaG9vayBpc3N1ZXNcclxuICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbXHJcbiAgICAgICAgICAgICdyZWFjdCcsXHJcbiAgICAgICAgICAgICdyZWFjdC1kb20nLFxyXG4gICAgICAgICAgICAncmVhY3Qtcm91dGVyLWRvbScsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtYXZhdGFyJyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1jaGVja2JveCcsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtZGlhbG9nJyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1kcm9wZG93bi1tZW51JyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1sYWJlbCcsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0JyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zZXBhcmF0b3InLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNsb3QnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRhYnMnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRvYXN0J1xyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIC8vIFJlZHV4IGFuZCBzdGF0ZSBtYW5hZ2VtZW50XHJcbiAgICAgICAgICAncmVkdXgtdmVuZG9yJzogWydAcmVkdXhqcy90b29sa2l0JywgJ3JlYWN0LXJlZHV4J10sXHJcbiAgICAgICAgICAvLyBVSSBhbmQgYW5pbWF0aW9uIGxpYnJhcmllc1xyXG4gICAgICAgICAgJ3VpLXZlbmRvcic6IFsnZnJhbWVyLW1vdGlvbicsICdsdWNpZGUtcmVhY3QnXSxcclxuICAgICAgICAgIC8vIFV0aWxpdHkgbGlicmFyaWVzXHJcbiAgICAgICAgICAndXRpbHMtdmVuZG9yJzogWydheGlvcycsICdjbHN4JywgJ2NsYXNzLXZhcmlhbmNlLWF1dGhvcml0eSddXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICAvLyBJbmNyZWFzZSBjaHVuayBzaXplIHdhcm5pbmcgbGltaXRcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTE3MywgLy8gb3IgYW55IG90aGVyIGF2YWlsYWJsZSBwb3J0XHJcbiAgICBvcGVuOiB0cnVlLCAvLyBPcGVucyB0aGUgYnJvd3NlciBhdXRvbWF0aWNhbGx5XHJcbiAgICBzdHJpY3RQb3J0OiB0cnVlLCAvLyBQcmV2ZW50cyBwb3J0IGNvbmZsaWN0c1xyXG4gICAgY29yczogdHJ1ZSwgLy8gRW5zdXJlcyBDT1JTIHdvcmtzIHByb3Blcmx5XHJcbiAgfSxcclxuXHJcbn0pO1xyXG4gICJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPLFVBQVU7QUFDakIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8scUJBQXFCO0FBQzVCLFNBQVMsZUFBZTtBQUx4QixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUE7QUFBQSxNQUVKLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQTtBQUFBLElBR0QsZ0JBQWdCO0FBQUE7QUFBQSxJQUdoQixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxTQUFTO0FBQUEsUUFDUCwrQkFBK0IsSUFBSSxPQUFPO0FBQUE7QUFBQSxRQUMxQyxjQUFjLENBQUMsa0RBQWtEO0FBQUEsUUFDakUsZ0JBQWdCO0FBQUEsVUFDZDtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWTtBQUFBLGdCQUNWLFlBQVk7QUFBQSxnQkFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUE7QUFBQSxjQUNoQztBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVOLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQSxJQUVMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFVBRVosZ0JBQWdCO0FBQUEsWUFDZDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQTtBQUFBLFVBRUEsZ0JBQWdCLENBQUMsb0JBQW9CLGFBQWE7QUFBQTtBQUFBLFVBRWxELGFBQWEsQ0FBQyxpQkFBaUIsY0FBYztBQUFBO0FBQUEsVUFFN0MsZ0JBQWdCLENBQUMsU0FBUyxRQUFRLDBCQUEwQjtBQUFBLFFBQzlEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsdUJBQXVCO0FBQUEsRUFDekI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixZQUFZO0FBQUE7QUFBQSxJQUNaLE1BQU07QUFBQTtBQUFBLEVBQ1I7QUFFRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
