import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  publicDir: "assets",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        box: resolve(__dirname, "box.html"),
        contact: resolve(__dirname, "contact.html"),
        legal: resolve(__dirname, "legal.html"),
        news: resolve(__dirname, "news.html"),
        privacy: resolve(__dirname, "privacy.html"),
        product: resolve(__dirname, "product.html"),
        recruit: resolve(__dirname, "recruit.html"),
        services: resolve(__dirname, "services.html"),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
