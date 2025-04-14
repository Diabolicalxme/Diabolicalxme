// vite.config.js
import path from "path";
import { defineConfig } from "file:///D:/DiabolicalXme/client/node_modules/vite/dist/node/index.js";
import react from "file:///D:/DiabolicalXme/client/node_modules/@vitejs/plugin-react/dist/index.mjs";
import viteCompression from "file:///D:/DiabolicalXme/client/node_modules/vite-plugin-compression/dist/index.mjs";
import { VitePWA } from "file:///D:/DiabolicalXme/client/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "D:\\DiabolicalXme\\client";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // ✅ Enable Gzip Compression for Faster Load Times
    viteCompression(),
    // ✅ Add Progressive Web App (PWA) Support
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "DiabolicalXme",
        short_name: "DiabolicalXme",
        description: "Discover bold contemporary fashion at DiabolicalXme.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
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
  build: {
    // ✅ Enable Code Splitting to Reduce Initial Load Time
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEaWFib2xpY2FsWG1lXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRGlhYm9saWNhbFhtZVxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0RpYWJvbGljYWxYbWUvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7Ly8gaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuLy8gaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuLy8gaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5cclxuLy8gLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuLy8gZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuLy8gICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbi8vICAgcmVzb2x2ZToge1xyXG4vLyAgICAgYWxpYXM6IHtcclxuLy8gICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbi8vICAgICB9LFxyXG4vLyAgIH0sXHJcbi8vIH0pO1xyXG5cclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gXCJ2aXRlLXBsdWdpbi1jb21wcmVzc2lvblwiO1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG5cclxuICAgIC8vIFx1MjcwNSBFbmFibGUgR3ppcCBDb21wcmVzc2lvbiBmb3IgRmFzdGVyIExvYWQgVGltZXNcclxuICAgIHZpdGVDb21wcmVzc2lvbigpLFxyXG5cclxuICAgIC8vIFx1MjcwNSBBZGQgUHJvZ3Jlc3NpdmUgV2ViIEFwcCAoUFdBKSBTdXBwb3J0XHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiBcIlJhY2hhbmEgQm91dGlxdWVcIixcclxuICAgICAgICBzaG9ydF9uYW1lOiBcIkJvdXRpcXVlXCIsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiRGlzY292ZXIgdHJlbmR5IGV0aG5pYyBhbmQgd2VzdGVybiB3ZWFyIGF0IFJhY2hhbmEgQm91dGlxdWUuXCIsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6IFwiI2ZmZmZmZlwiLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogXCIvaWNvbi0xOTJ4MTkyLnBuZ1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6IFwiL2ljb24tNTEyeDUxMi5wbmdcIixcclxuICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxyXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgLy8gXHUyNzA1IEVuYWJsZSBDb2RlIFNwbGl0dGluZyB0byBSZWR1Y2UgSW5pdGlhbCBMb2FkIFRpbWVcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yXCI7IC8vIFNwbGl0cyB2ZW5kb3IgbGlicmFyaWVzIGludG8gYSBzZXBhcmF0ZSBmaWxlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDUxNzMsIC8vIG9yIGFueSBvdGhlciBhdmFpbGFibGUgcG9ydFxyXG4gICAgb3BlbjogdHJ1ZSwgLy8gT3BlbnMgdGhlIGJyb3dzZXIgYXV0b21hdGljYWxseVxyXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSwgLy8gUHJldmVudHMgcG9ydCBjb25mbGljdHNcclxuICAgIGNvcnM6IHRydWUsIC8vIEVuc3VyZXMgQ09SUyB3b3JrcyBwcm9wZXJseVxyXG4gIH0sXHJcbiAgXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBY0EsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLHFCQUFxQjtBQUM1QixTQUFTLGVBQWU7QUFsQnhCLElBQU0sbUNBQW1DO0FBb0J6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUE7QUFBQSxJQUdOLGdCQUFnQjtBQUFBO0FBQUEsSUFHaEIsUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFJO0FBQ2YsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixZQUFZO0FBQUE7QUFBQSxJQUNaLE1BQU07QUFBQTtBQUFBLEVBQ1I7QUFFRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
