// import path from "path";
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });

import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    // ✅ Enable Gzip Compression for Faster Load Times
    viteCompression(),

    // ✅ Add Progressive Web App (PWA) Support
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Rachana Boutique",
        short_name: "Boutique",
        description: "Discover trendy ethnic and western wear at Rachana Boutique.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
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
  build: {
    // ✅ Enable Code Splitting to Reduce Initial Load Time
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // Splits vendor libraries into a separate file
          }
        },
      },
    },
  },
  server: {
    port: 5173, // or any other available port
    open: true, // Opens the browser automatically
    strictPort: true, // Prevents port conflicts
    cors: true, // Ensures CORS works properly
  },
  
});
