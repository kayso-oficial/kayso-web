// src/main.js
import { loadPartials } from "./include-partials";
import { setActiveNav } from "./nav-active";

// ============================
// 1) TEMA (oscuro / claro)
// ============================
function setTheme(theme) {
  const root = document.documentElement;
  if (theme !== "light" && theme !== "dark") theme = "dark";
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

// Tema inicial
const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

// ============================
// 2) HEADER INTERACTIONS (DESPUÉS DE INYECTAR)
// ============================
function initHeaderInteractions() {
  // 1) Tema
  const themeButtons = document.querySelectorAll(
    "[data-theme-toggle], #theme-toggle, #mobile-theme-toggle"
  );

  themeButtons.forEach((btn) => {
    if (btn.dataset.bound === "1") return; // evita doble binding
    btn.dataset.bound = "1";

    btn.addEventListener("click", () => {
      const root = document.documentElement;
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      setTheme(next);
    });
  });

  // 2) Menú mobile
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const closeMobileMenuBtn = document.getElementById("close-mobile-menu");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  function toggleMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle("translate-x-full");
  }

  // Guardas por si no existe en alguna página
  mobileMenuBtn?.addEventListener("click", toggleMenu);
  closeMobileMenuBtn?.addEventListener("click", toggleMenu);
  mobileLinks.forEach((link) => link.addEventListener("click", toggleMenu));
}

// ============================
// 3) REVEAL-UP
// ============================
function initRevealUp() {
  const els = document.querySelectorAll(".reveal-up");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  els.forEach((el) => observer.observe(el));
}

// ============================
// 4) CONTADORES
// ============================
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  if (!counters.length) return;

  let started = false;

  function startCounters() {
    if (started) return;
    started = true;

    counters.forEach((counter) => {
      const target = Number(counter.getAttribute("data-target") || "0");
      const suffix = counter.getAttribute("data-suffix") || "";
      const duration = 1500;
      const increment = target / (duration / 16);

      let current = 0;
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.innerText = Math.ceil(current) + suffix;
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target + suffix;
        }
      };
      updateCounter();
    });
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCounters();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.1 }
  );

  counters.forEach((el) => obs.observe(el));
}

// ============================
// 5) PROCESO (mobile accordion index)
// ============================
function initProcessMobile() {
  const steps = document.querySelectorAll(".process-step");
  if (!steps.length) return;

  function handleMobileClick(clickedStep) {
    if (window.innerWidth >= 768) return;
    steps.forEach((step) => {
      if (step !== clickedStep) step.classList.remove("active-mobile");
    });
    clickedStep.classList.toggle("active-mobile");
  }

  steps.forEach((step) => {
    step.addEventListener("click", () => handleMobileClick(step));
  });
}

// ============================
// 6) GLOW INTERACTIVO
// ============================
function initGlow() {
  const glowContainer = document.getElementById("glow-container");
  if (!glowContainer) return;

  glowContainer.addEventListener("mousemove", (e) => {
    const rect = glowContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowContainer.style.setProperty("--x", x + "px");
    glowContainer.style.setProperty("--y", y + "px");
  });
}

// ============================
// 7) TILT 3D (Desarrollo Web)
// ============================
function initTilt() {
  const heroCard = document.getElementById("hero-card");
  const tiltContainer = document.querySelector(".tilt-container");
  if (!heroCard || !tiltContainer) return;

  tiltContainer.addEventListener("mousemove", (e) => {
    const rect = tiltContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    heroCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  tiltContainer.addEventListener("mouseleave", () => {
    heroCard.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

// ============================
// 8) BIOS (index)
// ============================
function initBioToggle() {
  // Solo definimos la función global si existe el markup
  const anyBio = document.querySelector('[id^="bio-"]');
  const anyCard = document.querySelector('[id^="card-"]');
  if (!anyBio || !anyCard) return;

  window.toggleBio = function (person) {
    const panel = document.getElementById(`bio-${person}`);
    const card = document.getElementById(`card-${person}`);
    if (!panel || !card) return;

    const btn = card.querySelector(".bio-toggle");
    const isOpen = panel.classList.contains("open");

    if (isOpen) {
      panel.classList.remove("open");
      btn?.setAttribute("aria-expanded", "false");
    } else {
      panel.classList.add("open");
      btn?.setAttribute("aria-expanded", "true");
    }
  };
}

// ============================
// 9) EDITOR TYPEWRITER (Desarrollo Web)
// ============================
function initCodeEditorTyping() {
  const outputEl = document.getElementById("code-container");
  const editorWrapper = document.getElementById("code-editor");
  if (!outputEl || !editorWrapper) return;

  const codeContent = [
    { text: "const", type: "s-k" },
    { text: " ", type: "" },
    { text: "agencia", type: "s-v" },
    { text: " ", type: "" },
    { text: "=", type: "s-p" },
    { text: " ", type: "" },
    { text: "{", type: "s-p" },
    { text: "\n  ", type: "" },

    { text: "nombre", type: "s-o" },
    { text: ":", type: "s-p" },
    { text: " ", type: "" },
    { text: "'KA&SO'", type: "s-brand" },
    { text: ",", type: "s-p" },
    { text: "\n  ", type: "" },

    { text: "expertos", type: "s-o" },
    { text: ":", type: "s-p" },
    { text: " ", type: "" },
    { text: "[", type: "s-p" },
    { text: "'Web'", type: "s-s" },
    { text: ",", type: "s-p" },
    { text: " ", type: "" },
    { text: "'SEO'", type: "s-s" },
    { text: "]", type: "s-p" },
    { text: ",", type: "s-p" },
    { text: "\n  ", type: "" },

    { text: "resultado", type: "s-o" },
    { text: ":", type: "s-p" },
    { text: " ", type: "" },
    { text: "'Crecimiento 🚀'", type: "s-s" },
    { text: "\n", type: "" },
    { text: "};", type: "s-p" },

    { text: "\n\n", type: "" },
    { text: "// Transformamos tu negocio", type: "s-c" },
    { text: "\n", type: "" },
    { text: "function", type: "s-k" },
    { text: " ", type: "" },
    { text: "boost", type: "s-f" },
    { text: "()", type: "s-p" },
    { text: " ", type: "" },
    { text: "{", type: "s-p" },
    { text: "\n  ", type: "" },
    { text: "return", type: "s-k" },
    { text: " ", type: "" },
    { text: '"Éxito Garantizado"', type: "s-s" },
    { text: ";", type: "s-p" },
    { text: "\n", type: "" },
    { text: "}", type: "s-p" },
  ];

  const AUTO_START_DELAY = 800;
  const TYPE_DELAY = 15;
  let isTyping = false;

  const playTypingAnimation = async () => {
    if (isTyping) return;
    isTyping = true;
    outputEl.innerHTML = "";

    for (const chunk of codeContent) {
      const el = document.createElement("span");
      el.className = chunk.type;
      outputEl.appendChild(el);

      for (let char of chunk.text) {
        el.textContent += char;
        await new Promise((r) => setTimeout(r, TYPE_DELAY));
      }
    }
    isTyping = false;
  };

  setTimeout(playTypingAnimation, AUTO_START_DELAY);

  editorWrapper.addEventListener("mouseenter", () => {
    if (!isTyping) playTypingAnimation();
  });
}

// ============================
// 10) NEÓN (Contacto)
// ============================
function initNeonContact() {
  const card = document.getElementById("contactCard");
  if (!card) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          card.classList.add("animate-neon");
          obs.unobserve(card);
        }
      });
    },
    { threshold: 0.3 }
  );

  obs.observe(card);
}

// ============================
// 11) ACORDEÓN (si existe)
// ============================
function initAccordion() {
  const buttons = document.querySelectorAll(".accordion-item button");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".accordion-item");
      if (!item) return;

      const isActive = item.classList.contains("active");

      document
        .querySelectorAll(".accordion-item")
        .forEach((i) => i.classList.remove("active"));

      if (!isActive) item.classList.add("active");
    });
  });
}

// ============================
// 12) LAZY VIDEOS (si existen)
// ============================
function initLazyVideos() {
  const lazyVideos = document.querySelectorAll("video.lazy-video");
  if (!lazyVideos.length) return;

  if (!("IntersectionObserver" in window)) {
    lazyVideos.forEach((video) => {
      if (video.dataset.src) video.src = video.dataset.src;
    });
    return;
  }

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) return;

        if (entry.isIntersecting) {
          if (!video.src && video.dataset.src) video.src = video.dataset.src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px 200px 0px",
      threshold: 0.2,
    }
  );

  lazyVideos.forEach((video) => videoObserver.observe(video));
}
function initHeroVideos() {
  const heroVideos = document.querySelectorAll("video.hero-video");
  if (!heroVideos.length) return;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    // Fallback: carga solo el primero
    const first = heroVideos[0];
    if (first?.dataset?.src && !first.getAttribute("src")) {
      first.setAttribute("src", first.dataset.src);
      first.load();
    }
    return;
  }

  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          // Inyecta src UNA vez
          if (video.dataset.src && !video.getAttribute("src")) {
            video.setAttribute("src", video.dataset.src);
            video.load();
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    {
      root: null,
      rootMargin: "200px 0px 200px 0px",
      threshold: 0.15,
    }
  );

  heroVideos.forEach((v) => heroObserver.observe(v));
}

// ============================
// BOOTSTRAP ÚNICO
// ============================
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();
  setActiveNav();
  initHeaderInteractions();

  initHeroVideos(); // <-- AGREGÁ ESTA LÍNEA

  initRevealUp();
  initCounters();
  initProcessMobile();
  initGlow();
  initTilt();
  initBioToggle();
  initCodeEditorTyping();
  initNeonContact();
  initAccordion();
  initLazyVideos();
  initBlogSearch();

});
// ============================
// BUSCADOR BLOG
// ============================
function initBlogSearch() {
  const input = document.getElementById("blogSearch");
  if (!input) return;

  const posts = Array.from(document.querySelectorAll("article"));
  if (!posts.length) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();

    posts.forEach((post) => {
      const text = post.innerText.toLowerCase();
      post.style.display = text.includes(q) ? "" : "none";
    });
  });
}

