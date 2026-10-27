import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import { generarBlog } from "./scripts/blog.mjs";

// 1) Antes de arrancar, armamos el blog desde contenido/blog/*.md
generarBlog();

// 2) Todas las páginas .html de la raíz y de blog/ entran solas al build.
//    (Ya no hace falta agregar cada artículo nuevo a mano en esta lista.)
const paginas = {};
for (const carpeta of ["", "blog"]) {
  for (const f of fs.readdirSync(resolve(__dirname, carpeta || "."))) {
    if (!f.endsWith(".html")) continue;
    const nombre = (carpeta ? carpeta + "/" : "") + f.replace(/\.html$/, "");
    paginas[nombre] = resolve(__dirname, carpeta, f);
  }
}

// 3) Mientras trabajás con `npm run dev`, si cambiás un .md o una plantilla,
//    el blog se vuelve a armar y el navegador se recarga solo.
function blogEnVivo() {
  return {
    name: "kayso-blog",
    configureServer(server) {
      const dir = resolve(__dirname, "contenido");
      const normal = (p) => p.replace(/\\/g, "/").toLowerCase();
      server.watcher.add(dir);
      // En local, /blog -> /blog/ (igual que en GitHub Pages)
      server.middlewares.use((req, res, next) => {
        if (req.url === "/blog" || req.url?.startsWith("/blog?")) {
          res.writeHead(301, { Location: req.url.replace("/blog", "/blog/") });
          return res.end();
        }
        next();
      });
      const rearmar = (archivo) => {
        if (!normal(archivo).startsWith(normal(dir))) return;
        try {
          generarBlog();
          server.ws.send({ type: "full-reload" });
        } catch (e) {
          console.error("❌ [blog]", e.message);
        }
      };
      server.watcher.on("change", rearmar);
      server.watcher.on("add", rearmar);
      server.watcher.on("unlink", rearmar);
    },
  };
}

export default defineConfig({
  plugins: [blogEnVivo()],
  build: {
    rollupOptions: {
      input: paginas,
    },
  },
});
