import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        blog: resolve(__dirname, "blog.html"),
        navidad: resolve(__dirname, "blog/navidad.html"),
        contacto: resolve(__dirname, "contacto.html"),
        branding: resolve(__dirname, "branding-digital.html"),
        desarrollo: resolve(__dirname, "desarrollo-web.html"),
        publicidad: resolve(__dirname, "publicidad.html"),
        redes: resolve(__dirname, "redes-sociales.html"),
      },
    },
  },
});
