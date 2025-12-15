export function setActiveNav() {
  const page = document.body.getAttribute("data-page");
  if (!page) return;

  document.querySelectorAll("[data-nav]").forEach((el) => {
    const key = el.getAttribute("data-nav");
    if (key === page) {
      el.classList.add("is-active");
      el.setAttribute("aria-current", "page");
    } else {
      el.classList.remove("is-active");
      el.removeAttribute("aria-current");
    }
  });
}
