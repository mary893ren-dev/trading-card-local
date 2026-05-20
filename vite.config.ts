import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/trading-card-local-any/",

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "ONE PIECE CARD LOCAL",
        short_name: "OPCG",

        start_url: "/trading-card-local-any/",
        scope: "/trading-card-local-any/",

        display: "standalone",

        background_color: "#0f172a",
        theme_color: "#0f172a",

        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});