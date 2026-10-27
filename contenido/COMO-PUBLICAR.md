# Cómo publicar un artículo en el blog

Ya no hace falta tocar código. Cada artículo es un archivo de texto (`.md`) en `contenido/blog/`.

## Pasos

1. **Subí la portada** a `public/IMG/` (ideal: `.webp`, 1200×630 aprox.).
2. **Copiá** `contenido/blog/_ejemplo.md` y renombralo con la dirección que querés.
   Ejemplo: `como-crecer-en-instagram.md` → queda en `kayso.com.ar/blog/como-crecer-en-instagram`
   (minúsculas, sin tildes ni espacios, palabras separadas con guiones).
3. **Completá** lo de arriba (título, descripción, fecha, categoría, `portada: nombre-de-la-imagen.webp`)
   y escribí el artículo abajo, como texto normal.
4. Mirá cómo queda con `npm run dev` → `http://localhost:5173/blog/`
   (cada vez que guardás el .md, la página se actualiza sola).
5. Hacé commit y push como siempre. GitHub arma y publica todo.

Eso es todo: la tarjeta en el listado, la página del artículo, el orden por fecha
y el `sitemap.xml` se generan solos.

## Trucos de escritura

| Querés…                       | Escribís                                   |
|-------------------------------|--------------------------------------------|
| Subtítulo grande              | `## Mi subtítulo`                          |
| Subtítulo chico               | `### Mi subtítulo`                         |
| Negrita / cursiva             | `**negrita**` / `*cursiva*`                |
| Link                          | `[texto](https://...)` o `[contacto](/contacto)` |
| Lista                         | líneas que empiezan con `- `               |
| Caja destacada (borde rojo)   | línea que empieza con `> `                 |
| Imagen en el medio del texto  | `![descripción](foto.webp "epígrafe")`     |
| Línea separadora              | `---`                                      |

## Para tener en cuenta

- `borrador: true` esconde el artículo hasta que lo cambies a `false`.
- Si borrás un `.md`, su página se borra sola en el próximo `npm run dev` / build.
- Los artículos viejos (hechos a mano en `blog/*.html`) tienen un `.md` con
  `pagina_propia: true`: ese archivo solo controla su tarjeta en el listado.
  Su contenido se sigue editando en el `.html` como siempre.
- El diseño de los artículos nuevos está en `contenido/plantillas/post.html`
  y el de las tarjetas en `contenido/plantillas/tarjeta.html`.
