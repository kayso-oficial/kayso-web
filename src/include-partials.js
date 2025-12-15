// src/include-partials.js
export async function loadPartials() {
  // BASE_URL funciona bien en Vite en dev y build
  const base = import.meta.env.BASE_URL || "/";

  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");

  try {
    if (headerEl) {
      const r = await fetch(`${base}partials/header.html`);
      headerEl.innerHTML = await r.text();
    }
    if (footerEl) {
      const r = await fetch(`${base}partials/footer.html`);
      footerEl.innerHTML = await r.text();
    }
  } catch (err) {
    console.error("loadPartials failed:", err);
  }
}
