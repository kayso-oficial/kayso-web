import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        blog: resolve(__dirname, "blog.html"),
        navidad: resolve(__dirname, "blog/navidad.html"),
        tendencias: resolve(__dirname, "blog/tendencias-2025.html"),
        meli: resolve(__dirname, "blog/caso-meli-navidad.html"),
        google: resolve(__dirname, "blog/google-jarvis-seo.html"),
        instagram: resolve(__dirname, "blog/instagram-reels-20min.html"),
        contacto: resolve(__dirname, "contacto.html"),
        branding: resolve(__dirname, "branding-digital.html"),
        desarrollo: resolve(__dirname, "desarrollo-web.html"),
        publicidad: resolve(__dirname, "publicidad.html"),
        redes: resolve(__dirname, "redes-sociales.html"),
      },
    },
  },
});
