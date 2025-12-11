// src/main.js

// ============================
// 1. TEMA (oscuro / claro)
// ============================
function setTheme(theme) {
  const root = document.documentElement;

  if (theme !== 'light' && theme !== 'dark') theme = 'dark';
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Tema inicial
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

// Botones que cambian el tema (index + desarrollo web)
const themeButtons = document.querySelectorAll(
  '[data-theme-toggle], #theme-toggle, #mobile-theme-toggle'
);

themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  });
});

// ============================
// 2. MENÚ MOBILE (compartido)
// ============================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

function toggleMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.toggle('translate-x-full');
}

mobileMenuBtn?.addEventListener('click', toggleMenu);
closeMobileMenuBtn?.addEventListener('click', toggleMenu);
mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));
closeMobileMenuBtn?.addEventListener('click', toggleMenu);

// ============================
// 3. REVEAL-UP (scroll animado)
// ============================
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

// ============================
// 4. CONTADORES (si existen)
// ============================
let countersStarted = false;

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;

  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const suffix = counter.getAttribute('data-suffix') || '';
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

// si alguna sección con .counter entra en pantalla, los dispara
const countersObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounters();
        countersObserver.disconnect();
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.counter').forEach(el => countersObserver.observe(el));

// ============================
// 5. PROCESO (mobile accordion index)
// ============================
const processSteps = document.querySelectorAll('.process-step');

function handleMobileClick(clickedStep) {
  if (window.innerWidth >= 768) return; // solo mobile
  processSteps.forEach(step => {
    if (step !== clickedStep) step.classList.remove('active-mobile');
  });
  clickedStep.classList.toggle('active-mobile');
}

processSteps.forEach(step => {
  step.addEventListener('click', () => handleMobileClick(step));
});

// ============================
// 6. GLOW INTERACTIVO (si existe)
// ============================
const glowContainer = document.getElementById('glow-container');
if (glowContainer) {
  glowContainer.addEventListener('mousemove', e => {
    const rect = glowContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowContainer.style.setProperty('--x', x + 'px');
    glowContainer.style.setProperty('--y', y + 'px');
  });
}

// ============================
// 7. EFECTO TILT 3D (Desarrollo Web)
// ============================
const heroCard = document.getElementById('hero-card');
const tiltContainer = document.querySelector('.tilt-container');

if (heroCard && tiltContainer) {
  tiltContainer.addEventListener('mousemove', e => {
    const rect = tiltContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // máx 10°
    const rotateY = ((x - centerX) / centerX) * 10;

    heroCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  tiltContainer.addEventListener('mouseleave', () => {
    heroCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

// ============================
// 8. BIO KARÉN / AGUSTÍN (index)
// ============================
window.toggleBio = function (person) {
  const panel = document.getElementById(`bio-${person}`);
  const card = document.getElementById(`card-${person}`);
  if (!panel || !card) return;

  const btn = card.querySelector('.bio-toggle');
  const isOpen = panel.classList.contains('open');

  if (isOpen) {
    panel.classList.remove('open');
    btn?.setAttribute('aria-expanded', 'false');
  } else {
    panel.classList.add('open');
    btn?.setAttribute('aria-expanded', 'true');
  }
};


/* =========================================
   desarrollo web
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const outputEl = document.getElementById('code-container');
    const editorWrapper = document.getElementById('code-editor');

    // PROTECCIÓN: Solo ejecutamos si existen los elementos
    if (outputEl && editorWrapper) {

        // CONFIGURACIÓN DEL CÓDIGO AQUÍ
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
            { text: "\"Éxito Garantizado\"", type: "s-s" },
            { text: ";", type: "s-p" },
            { text: "\n", type: "" },
            { text: "}", type: "s-p" }
        ];

        // Función para mostrar el código completo estático
        const showStaticCode = () => {
            outputEl.innerHTML = '';
            codeContent.forEach(chunk => {
                const el = document.createElement('span');
                el.className = chunk.type;
                el.textContent = chunk.text;
                outputEl.appendChild(el);
            });
        };

        // Llamamos al inicio
        showStaticCode();

        let isTyping = false;

        // Función de animación
        const playTypingAnimation = async () => {
            if (isTyping) return;
            isTyping = true;
            
            outputEl.innerHTML = ''; 

            for (const chunk of codeContent) {
                const el = document.createElement('span');
                el.className = chunk.type; 
                outputEl.appendChild(el);

                for (let char of chunk.text) {
                    el.textContent += char;
                    await new Promise(r => setTimeout(r, 15)); 
                }
            }
            isTyping = false;
        };

        // Activador: Mouse Enter
        editorWrapper.addEventListener('mouseenter', () => {
            if (!isTyping) {
                playTypingAnimation();
            }
        });
    } // Fin del IF de protección
});
// JS PARA ROTACIÓN AUTOMÁTICA + DRAG
document.addEventListener('DOMContentLoaded', () => {
    const ring = document.getElementById('carouselRing');
    const container = document.querySelector('.carousel-container');
    
    // PROTECCIÓN: Solo ejecutamos si existen el anillo y el contenedor
    if (ring && container) {
        
        const cards = document.querySelectorAll('.carousel-card');
        
        // CONFIGURACIÓN
        const cardCount = cards.length;
        const radius = 240; 
        const autoSpeed = 0.2; 
        const dragSpeed = 0.5; 
        
        let currentAngle = 0;
        let targetAngle = 0;
        let isDragging = false;
        let startX = 0;
        let lastX = 0;
        let autoRotateActive = true;
        let resumeAutoTimeout;

        // 1. POSICIONAMIENTO INICIAL
        const anglePerCard = 360 / cardCount;

        cards.forEach((card, index) => {
            const theta = anglePerCard * index;
            card.style.transform = `rotateY(${theta}deg) translateZ(${radius}px)`;
        });

        // 2. BUCLE DE ANIMACIÓN
        function animate() {
            if (autoRotateActive && !isDragging) {
                targetAngle -= autoSpeed;
            }

            currentAngle += (targetAngle - currentAngle) * 0.1;

            // Aquí es donde fallaba antes si ring era null
            ring.style.transform = `rotateY(${currentAngle}deg)`;

            requestAnimationFrame(animate);
        }
        
        // Iniciar loop
        animate();

        // 3. EVENTOS DE ARRASTRE
        const startDrag = (e) => {
            isDragging = true;
            autoRotateActive = false; 
            clearTimeout(resumeAutoTimeout);
            
            startX = e.pageX || e.touches[0].pageX;
            lastX = startX;
            
            container.style.cursor = 'grabbing';
        };

        const onDrag = (e) => {
            if (!isDragging) return;
            
            const x = e.pageX || e.touches[0].pageX;
            const deltaX = x - lastX;
            
            targetAngle += deltaX * dragSpeed;
            lastX = x;
        };

        const endDrag = () => {
            isDragging = false;
            container.style.cursor = 'grab';

            resumeAutoTimeout = setTimeout(() => {
                autoRotateActive = true;
            }, 2000);
        };

        container.addEventListener('mousedown', startDrag);
        container.addEventListener('touchstart', startDrag, {passive: true});

        window.addEventListener('mousemove', onDrag);
        window.addEventListener('touchmove', onDrag, {passive: true});

        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
        
        window.addEventListener('mouseleave', () => {
            if(isDragging) endDrag();
        });
    } // Fin del IF de protección
});
/* =========================================    <-- Agregá la barra aquí
   contacto
   ========================================= */
   /* =========================================
   EFECTO NEÓN BORDE (Contacto)
   ========================================= */
document.addEventListener("DOMContentLoaded", function() {
  const card = document.getElementById('contactCard');

  // Solo ejecutamos si existe la card (evita errores en otras páginas)
  if (card) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Agrega la clase que dispara la animación CSS
          card.classList.add('animate-neon');
          // Deja de observar para que no se repita y ahorre memoria
          observer.unobserve(card);
        }
      });
    }, {
      threshold: 0.3 // Se activa al ver el 30% de la tarjeta
    });

    observer.observe(card);
  }
});

  document.querySelectorAll('.accordion-item button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const isActive = item.classList.contains('active');

      // Cerrar todos
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

      // Abrir solo el que tocaste (si no estaba abierto)
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

document.addEventListener("DOMContentLoaded", () => {
  const lazyVideos = document.querySelectorAll("video.lazy-video");

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            // Si aún no tiene src, se lo seteamos desde data-src
            if (!video.src && video.dataset.src) {
              video.src = video.dataset.src;
            }

            // Intentamos reproducirlo
            video.play().catch(() => {
              // En caso de que el navegador bloquee el autoplay, lo ignoramos
            });
          } else {
            // Al salir de la vista, pausamos el video
            video.pause();
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px 200px 0px", // empieza a cargar un poco antes de que aparezca
        threshold: 0.2,
      }
    );

    lazyVideos.forEach((video) => {
      videoObserver.observe(video);
    });
  } else {
    // Fallback si el navegador no soporta IntersectionObserver:
    // Cargar todos los videos directamente
    lazyVideos.forEach((video) => {
      if (video.dataset.src) {
        video.src = video.dataset.src;
      }
    });
  }
});
