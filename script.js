/* =========================================
   AutoniqueAI — Interactive JS
   Pixel grid animation + navigation
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // PIXEL GRID ANIMATION
  // ============================================
  const canvas = document.getElementById('pixelCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animId;
    let pixels = [];
    const PIXEL_SIZE = 4;
    const GAP = 2;
    const CELL = PIXEL_SIZE + GAP;

    function resizeCanvas() {
      const hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      initPixels();
    }

    function initPixels() {
      pixels = [];
      const cols = Math.ceil(canvas.width / CELL);
      const rows = Math.ceil(canvas.height / CELL);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Only populate ~8% of cells for a sparse, elegant look
          if (Math.random() < 0.08) {
            pixels.push({
              x: x * CELL,
              y: y * CELL,
              brightness: Math.random() * 0.15,
              targetBrightness: Math.random() * 0.2,
              speed: 0.002 + Math.random() * 0.008,
              phase: Math.random() * Math.PI * 2,
              pulseSpeed: 0.01 + Math.random() * 0.02,
            });
          }
        }
      }
    }

    function drawPixels(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];

        // Slow organic pulsing
        p.brightness += (p.targetBrightness - p.brightness) * p.speed;

        // Periodically shift targets
        if (Math.random() < 0.003) {
          p.targetBrightness = Math.random() * 0.25;
        }

        // Additional sine wave modulation
        const wave = Math.sin(time * 0.001 + p.phase) * 0.5 + 0.5;
        const alpha = p.brightness * wave;

        if (alpha > 0.01) {
          const gray = Math.round(180 + alpha * 75);
          ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
          ctx.fillRect(p.x, p.y, PIXEL_SIZE, PIXEL_SIZE);
        }
      }

      // Occasional "spark" — a pixel briefly flashes brighter
      if (Math.random() < 0.02 && pixels.length > 0) {
        const spark = pixels[Math.floor(Math.random() * pixels.length)];
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(spark.x, spark.y, PIXEL_SIZE, PIXEL_SIZE);
        spark.targetBrightness = 0.3;
      }

      animId = requestAnimationFrame(drawPixels);
    }

    resizeCanvas();
    animId = requestAnimationFrame(drawPixels);

    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 200);
    });

    // Pause when not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(drawPixels);
      }
    });
  }


  // ============================================
  // NAVIGATION
  // ============================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const navHamburger = document.getElementById('navHamburger');
  const navOverlay = document.getElementById('navOverlay');
  const allNavLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  // Mobile Menu Toggle
  function toggleMenu() {
    navHamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    navOverlay.classList.toggle('show');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  }

  navHamburger.addEventListener('click', toggleMenu);
  navOverlay.addEventListener('click', toggleMenu);

  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  // Navbar Scroll Effect
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Active Nav Link on Scroll
  function highlightActiveLink() {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        allNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Fade-in on Scroll (Intersection Observer)
  const fadeElements = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // Throttled Scroll Listener
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleNavbarScroll();
        highlightActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Run on load
  handleNavbarScroll();
  highlightActiveLink();


  // ============================================
  // CASE STUDY MODALS
  // ============================================
  const modalButtons = document.querySelectorAll('[data-modal]');
  const modalOverlays = document.querySelectorAll('.modal-overlay');

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Open modal on button click
  modalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.getAttribute('data-modal'));
    });
  });

  // Close on overlay click (not modal body)
  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // Close on X button
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) closeModal(overlay);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalOverlays.forEach(overlay => {
        if (overlay.classList.contains('active')) {
          closeModal(overlay);
        }
      });
    }
  });
});
