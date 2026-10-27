// scripts/blog.mjs
// ---------------------------------------------------------------------------
// Arma el blog a partir de los archivos Markdown de contenido/blog/*.md
//
//   • Crea la página de cada artículo (blog/<nombre>.html) usando contenido/plantillas/post.html
//   • Arma las tarjetas del listado en blog/index.html (ordenadas por fecha, la más nueva primero)
//   • Regenera public/sitemap.xml con todas las páginas y artículos
//
// Se ejecuta solo con `npm run dev` y `npm run build` (ver vite.config.js).
// También se puede correr a mano con:  npm run blog
// ---------------------------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR_POSTS = path.join(ROOT, "contenido", "blog");
const DIR_PLANTILLAS = path.join(ROOT, "contenido", "plantillas");
const DIR_BLOG = path.join(ROOT, "blog");
const DIR_IMG = path.join(ROOT, "public", "IMG");
const SITIO = "https://kayso.com.ar";
const MARCA_GENERADO = "GENERADO AUTOMÁTICAMENTE desde contenido/blog/";

// Páginas fijas que van al sitemap (además de los artículos)
const PAGINAS_FIJAS = ["/", "/desarrollo-web", "/branding-digital", "/redes-sociales", "/publicidad", "/contacto", "/blog/"];

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// ----------------------------- utilidades ---------------------------------
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const rellenar = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ""));

function escribirSiCambia(archivo, contenido) {
  const actual = fs.existsSync(archivo) ? fs.readFileSync(archivo, "utf8") : null;
  if (actual !== contenido) fs.writeFileSync(archivo, contenido, "utf8");
}

function parsearFecha(valor, archivo) {
  let d;
  if (valor instanceof Date) d = valor;
  else if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor.trim())) d = new Date(valor.trim() + "T00:00:00Z");
  if (!d || isNaN(d)) {
    console.warn(`⚠️  [blog] ${archivo}: la fecha tiene que ser AAAA-MM-DD (por ejemplo 2026-10-27). Uso la de hoy.`);
    d = new Date();
  }
  const iso = d.toISOString().slice(0, 10);
  const texto = `${String(d.getUTCDate()).padStart(2, "0")} ${MESES[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
  return { iso, texto, orden: d.getTime() };
}

// "mi-foto.webp" -> "/IMG/mi-foto.webp" ; "/IMG/x.webp" o "https://..." quedan igual
function urlImagen(src, archivo) {
  if (!src) return "";
  src = String(src).trim();
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return encodeURI(decodeURI(src));
  if (!fs.existsSync(path.join(DIR_IMG, src))) {
    console.warn(`⚠️  [blog] ${archivo}: no encuentro la imagen "${src}" en public/IMG/`);
  }
  return encodeURI("/IMG/" + src);
}

// ------------------------ Markdown -> HTML con estilos ---------------------
marked.setOptions({ gfm: true, breaks: true });

function markdownAHtml(md, archivo) {
  let html = marked.parse(md);

  // Imágenes solas en un párrafo -> figura con epígrafe (el "título" de la imagen)
  html = html.replace(/<p>\s*<img([^>]*)>\s*<\/p>/g, (_, attrs) => {
    const src = (attrs.match(/src="([^"]*)"/) || [])[1] || "";
    const alt = (attrs.match(/alt="([^"]*)"/) || [])[1] || "";
    const title = (attrs.match(/title="([^"]*)"/) || [])[1] || "";
    return `<figure class="my-8">
              <img src="${urlImagen(decodeURI(src), archivo)}" alt="${alt}" class="w-full rounded-2xl border border-gray-200 dark:border-white/10" loading="lazy" decoding="async" />
              ${title ? `<figcaption class="text-xs text-[var(--text-muted)] mt-3">${title}</figcaption>` : ""}
            </figure>`;
  });
  // Imágenes dentro de texto
  html = html.replace(/<img src="([^"]*)"/g, (m, src) =>
    src.startsWith("/") || /^https?:/.test(src) ? m : `<img src="${urlImagen(decodeURI(src), archivo)}" class="rounded-xl" loading="lazy"`
  );

  html = html
    .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-[var(--text-main)]">')
    .replace(/<h3>/g, '<h3 class="text-lg font-bold text-[var(--text-main)] mt-4">')
    .replace(/<h4>/g, '<h4 class="font-bold text-[var(--text-main)]">')
    .replace(/<ul>/g, '<ul class="list-disc pl-5 space-y-2 text-[var(--text-muted)]">')
    .replace(/<ol>/g, '<ol class="list-decimal pl-5 space-y-2 text-[var(--text-muted)]">')
    .replace(/<strong>/g, '<strong class="text-[var(--text-main)]">')
    .replace(/<hr>/g, '<hr class="my-12" />')
    .replace(/<blockquote>/g, '<blockquote class="p-6 my-8 bg-gray-50 dark:bg-white/5 rounded-xl border-l-4 border-brand-red text-[var(--text-main)]">')
    .replace(/<code>/g, '<code class="bg-gray-200 dark:bg-black/40 px-1.5 py-0.5 rounded font-mono text-[var(--text-main)]">')
    .replace(/<a href="(https?:\/\/[^"]+)"/g, '<a class="text-brand-red font-semibold hover:underline" target="_blank" rel="noopener noreferrer" href="$1"')
    .replace(/<a href="(\/[^"]*)"/g, '<a class="text-brand-red font-semibold hover:underline" href="$1"');

  return html;
}

// ------------------------------ leer posts --------------------------------
function leerPosts() {
  if (!fs.existsSync(DIR_POSTS)) return [];
  const posts = [];

  for (const archivo of fs.readdirSync(DIR_POSTS)) {
    if (!archivo.endsWith(".md") || archivo.startsWith("_")) continue; // "_ejemplo.md" = plantilla, se ignora
    const { data, content } = matter(fs.readFileSync(path.join(DIR_POSTS, archivo), "utf8"));
    if (data.borrador === true) continue;

    const slug = slugify(path.basename(archivo, ".md"));
    if (!data.titulo) {
      console.warn(`⚠️  [blog] ${archivo}: le falta "titulo", lo salteo.`);
      continue;
    }
    posts.push({ archivo, slug, data, content, fecha: parsearFecha(data.fecha, archivo) });
  }

  return posts.sort((a, b) => b.fecha.orden - a.fecha.orden || a.slug.localeCompare(b.slug));
}

// --------------------------- piezas de HTML -------------------------------
function lecturaTarjeta(lectura) {
  if (!lectura) return "";
  const l = String(lectura).trim();
  if (/^\d/.test(l)) return `<span><i class="far fa-clock mr-1"></i> ${esc(l.replace(/\s*lectura$/i, ""))} lectura</span>`;
  const icono = /pdf/i.test(l) ? "fas fa-file-pdf" : "fas fa-tag";
  return `<span><i class="${icono} mr-1"></i> ${esc(l)}</span>`;
}

function variablesComunes(p) {
  const d = p.data;
  return {
    slug: p.slug,
    titulo: esc(d.titulo),
    titulo_seo: esc(d.titulo_seo || d.titulo),
    descripcion: esc(d.descripcion || ""),
    categoria: esc(d.categoria || "Blog"),
    fecha_iso: p.fecha.iso,
    fecha_texto: p.fecha.texto,
    portada_url: urlImagen(d.portada, p.archivo),
    portada_alt: esc(d.portada_alt || d.titulo),
    boton: esc(d.boton || "Leer artículo"),
    lectura_tarjeta: lecturaTarjeta(d.lectura),
  };
}

function htmlTarjeta(p, tplTarjeta) {
  return rellenar(tplTarjeta, variablesComunes(p));
}

function htmlPost(p, todos, tplPost) {
  const d = p.data;
  const v = variablesComunes(p);

  const portada_html = d.portada
    ? `<figure class="my-8">
            <img src="${v.portada_url}" alt="${v.portada_alt}" class="w-full rounded-2xl border border-gray-200 dark:border-white/10" fetchpriority="high" decoding="async" />
            ${d.portada_epigrafe ? `<figcaption class="text-xs text-[var(--text-muted)] mt-3">${esc(d.portada_epigrafe)}</figcaption>` : ""}
          </figure>`
    : "";

  const puntos = Array.isArray(d.puntos_clave) ? d.puntos_clave.filter(Boolean) : [];
  const resumen_html = puntos.length
    ? `<div class="rounded-2xl p-8 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-[0_0_30px_rgba(0,0,0,0.25)]">
              <p class="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-3">Key Takeaways</p>
              <h3 class="text-xl font-bold text-[var(--text-main)] mb-3">Resumen</h3>
              <div class="space-y-4 my-6">
                ${puntos
                  .map(
                    (txt, i) => `<div class="flex gap-3">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10">
                    <span class="text-brand-red font-bold text-xs">${i + 1}</span>
                  </div>
                  <p class="text-sm text-[var(--text-muted)] self-center">${esc(txt)}</p>
                </div>`
                  )
                  .join("\n                ")}
              </div>
              <a href="/contacto" class="block w-full text-center py-3 rounded-full bg-brand-red text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(190,24,37,0.35)] transition-all">
                ${esc(d.cta_boton || "Quiero una consulta")}
              </a>
            </div>`
    : "";

  const descarga_html = d.descarga
    ? `<a href="${encodeURI(String(d.descarga).startsWith("/") ? d.descarga : "/downloads/" + d.descarga)}" download
               class="flex items-center gap-4 p-6 rounded-2xl border border-brand-red/30 bg-brand-red/5 hover:bg-brand-red/10 transition-colors">
              <i class="fas fa-file-download text-2xl text-brand-red"></i>
              <span class="font-bold text-[var(--text-main)]">${esc(d.descarga_texto || "Descargar recurso")}</span>
            </a>`
    : "";

  const otros = todos.filter((o) => o.slug !== p.slug).slice(0, 3);
  const relacionados_html = otros.length
    ? `<div class="p-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
              <h4 class="text-sm font-bold text-[var(--text-main)] mb-4">Seguí leyendo</h4>
              <ul class="space-y-4">
                ${otros
                  .map((o) => {
                    const ov = variablesComunes(o);
                    return `<li>
                  <a href="/blog/${o.slug}" class="flex gap-3 group">
                    <img src="${ov.portada_url}" alt="" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy">
                    <span class="text-sm font-semibold text-[var(--text-main)] group-hover:text-brand-red transition-colors leading-snug">${ov.titulo}</span>
                  </a>
                </li>`;
                  })
                  .join("\n                ")}
              </ul>
            </div>`
    : "";

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: d.titulo,
    description: d.descripcion || "",
    image: d.portada ? SITIO + v.portada_url : undefined,
    datePublished: p.fecha.iso,
    author: { "@type": "Person", name: d.autor || "KA&SO" },
    publisher: { "@type": "Organization", name: "KA&SO", url: SITIO },
    mainEntityOfPage: `${SITIO}/blog/${p.slug}`,
  }).replace(/</g, "\\u003c");

  return rellenar(tplPost, {
    ...v,
    autor_html: d.autor ? `<span>•</span><span>Por ${esc(d.autor)}</span>` : "",
    lectura_html: d.lectura ? `<span>•</span><span>${esc(String(d.lectura).replace(/\s*lectura$/i, ""))}${/^\d/.test(String(d.lectura)) ? " lectura" : ""}</span>` : "",
    portada_html,
    contenido: markdownAHtml(p.content, p.archivo),
    cta_titulo: esc(d.cta_titulo || "¿Querés aplicar esto en tu negocio?"),
    cta_texto: esc(d.cta_texto || "En KA&SO te ayudamos a bajar estas ideas a una estrategia concreta para tu marca. La primera consulta es sin costo."),
    cta_boton: esc(d.cta_boton || "Solicitar diagnóstico"),
    resumen_html,
    descarga_html,
    relacionados_html,
    schema,
  });
}

// ------------------------------ principal ---------------------------------
export function generarBlog() {
  const posts = leerPosts();
  const tplPost = fs.readFileSync(path.join(DIR_PLANTILLAS, "post.html"), "utf8");
  const tplTarjeta = fs.readFileSync(path.join(DIR_PLANTILLAS, "tarjeta.html"), "utf8");
  const generados = new Set();

  // 1) Páginas de los artículos escritos en Markdown
  for (const p of posts) {
    if (p.data.pagina_propia) continue;
    const destino = path.join(DIR_BLOG, `${p.slug}.html`);
    if (fs.existsSync(destino) && !fs.readFileSync(destino, "utf8").includes(MARCA_GENERADO)) {
      console.warn(`⚠️  [blog] Ya existe blog/${p.slug}.html hecho a mano. No lo piso: cambiale el nombre al .md o agregá "pagina_propia: true".`);
      continue;
    }
    escribirSiCambia(destino, htmlPost(p, posts, tplPost));
    generados.add(`${p.slug}.html`);
  }

  // 2) Borrar páginas generadas cuyo .md ya no existe (o pasó a borrador)
  for (const f of fs.readdirSync(DIR_BLOG)) {
    if (!f.endsWith(".html") || f === "index.html" || generados.has(f)) continue;
    const ruta = path.join(DIR_BLOG, f);
    if (fs.readFileSync(ruta, "utf8").includes(MARCA_GENERADO)) fs.unlinkSync(ruta);
  }

  // 3) Tarjetas del listado
  const listado = path.join(DIR_BLOG, "index.html");
  const html = fs.readFileSync(listado, "utf8");
  const re = /(<!-- TARJETAS:INICIO[^>]*-->)[\s\S]*?(\s*<!-- TARJETAS:FIN -->)/;
  if (re.test(html)) {
    const tarjetas = posts.map((p) => htmlTarjeta(p, tplTarjeta)).join("\n");
    escribirSiCambia(listado, html.replace(re, (_, a, b) => `${a}\n${tarjetas}${b}`));
  } else {
    console.warn("⚠️  [blog] No encontré las marcas <!-- TARJETAS:INICIO --> / <!-- TARJETAS:FIN --> en blog/index.html");
  }

  // 4) Sitemap
  const urls = [
    ...PAGINAS_FIJAS.map((u) => `  <url>\n    <loc>${SITIO}${u}</loc>\n  </url>`),
    ...posts.map((p) => `  <url>\n    <loc>${SITIO}/blog/${p.slug}</loc>\n    <lastmod>${p.fecha.iso}</lastmod>\n  </url>`),
  ];
  escribirSiCambia(
    path.join(ROOT, "public", "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
  );

  console.log(`✅ [blog] ${posts.length} artículos (${generados.size} desde Markdown)`);
  return posts;
}

// Permite correrlo a mano: node scripts/blog.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generarBlog();
}
