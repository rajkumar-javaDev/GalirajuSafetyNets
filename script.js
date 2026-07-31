/* ===== THEME TOGGLE ===== */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? 'light' : 'dark';
    themeToggle.textContent = isDark ? '🌙' : '☀️';
  });
}

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

/* ==========================================================================
   IMAGE-FIRST HERO SLIDER CONTROLLER (5 SECOND TIMER & FIRST-SLIDE ANIMATION)
   ========================================================================== */
const heroSection = document.getElementById('hero');
const slides = document.querySelectorAll('.hero-slide');
const heroPrev = document.getElementById('heroPrev');
const heroNext = document.getElementById('heroNext');
const heroDotsContainer = document.getElementById('heroDots');
const progressFill = document.getElementById('heroProgressFill');

let currentSlideIndex = 0;
let isSlideTransitioning = false;
let autoPlayTimer = null;
let progressStartTime = null;
let progressReqAnim = null;
const SLIDE_DURATION = 5000; // Exactly 5 seconds per slide

// Generate Navigation Dots
if (heroDotsContainer && slides.length > 0) {
  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `hero-dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      if (idx !== currentSlideIndex) {
        goToSlide(idx);
      }
    });
    heroDotsContainer.appendChild(dot);
  });
}

const heroDots = document.querySelectorAll('.hero-dot');

// Progress Bar Timer Animation
function startProgressBar() {
  if (!progressFill) return;
  cancelAnimationFrame(progressReqAnim);
  progressFill.style.width = '0%';
  progressStartTime = performance.now();

  function step(now) {
    const elapsed = now - progressStartTime;
    const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
    progressFill.style.width = pct + '%';

    if (pct < 100) {
      progressReqAnim = requestAnimationFrame(step);
    }
  }

  progressReqAnim = requestAnimationFrame(step);
}

// Go To Slide Function (Reverse Exit -> Smooth Image-First Entry)
function goToSlide(nextIndex) {
  if (isSlideTransitioning || slides.length === 0) return;
  isSlideTransitioning = true;

  const currentSlide = slides[currentSlideIndex];
  const nextSlide = slides[nextIndex];

  // Step 1: Reverse exit sequence
  if (currentSlide) {
    currentSlide.classList.add('exiting');
  }

  // Step 2: Swap slide after 300ms
  setTimeout(() => {
    if (currentSlide) {
      currentSlide.classList.remove('active', 'exiting');
    }
    nextSlide.classList.add('active');

    // Update Dots
    heroDots.forEach((dot, i) => dot.classList.toggle('active', i === nextIndex));
    currentSlideIndex = nextIndex;

    // Reset Progress Bar
    startProgressBar();

    // Reset Lock
    setTimeout(() => {
      isSlideTransitioning = false;
    }, 600);
  }, 300);

  resetAutoPlay();
}

// Auto-Play Control
function startAutoPlay() {
  stopAutoPlay();
  startProgressBar();
  autoPlayTimer = setInterval(() => {
    const nextIdx = (currentSlideIndex + 1) % slides.length;
    goToSlide(nextIdx);
  }, SLIDE_DURATION);
}

function stopAutoPlay() {
  if (autoPlayTimer) clearInterval(autoPlayTimer);
  cancelAnimationFrame(progressReqAnim);
}

function resetAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

// Controls
if (heroNext) {
  heroNext.addEventListener('click', () => {
    const nextIdx = (currentSlideIndex + 1) % slides.length;
    goToSlide(nextIdx);
  });
}

if (heroPrev) {
  heroPrev.addEventListener('click', () => {
    const prevIdx = (currentSlideIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIdx);
  });
}

// Mouse & Touch Gestures
if (heroSection) {
  heroSection.addEventListener('mouseenter', stopAutoPlay);
  heroSection.addEventListener('mouseleave', startAutoPlay);

  let touchStartX = 0;
  heroSection.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  heroSection.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      const nextIdx = (currentSlideIndex + 1) % slides.length;
      goToSlide(nextIdx);
    } else if (touchEndX - touchStartX > 50) {
      const prevIdx = (currentSlideIndex - 1 + slides.length) % slides.length;
      goToSlide(prevIdx);
    }
  }, { passive: true });
}

// Initialize Slider with full entrance animation on website load
if (slides.length > 0) {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      slides[0].classList.add('active');
      startAutoPlay();
    }, 120);
  });

  // Fallback if DOMContentLoaded fired
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
      slides[0].classList.add('active');
      startAutoPlay();
    }, 120);
  }
}

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), +delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===== RIPPLE EFFECT ===== */
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r = document.createElement('span');
    r.className = 'ripple-effect';
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px; height:${size}px; left:${e.clientX - rect.left - size/2}px; top:${e.clientY - rect.top - size/2}px`;
    this.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
});

/* ===== GALLERY CATEGORY FILTERS ===== */
const gFilters = document.querySelectorAll('.g-filter');
const galleryCards = document.querySelectorAll('.gallery-card');

gFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    gFilters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    galleryCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hide');
      } else {
        card.classList.add('hide');
      }
    });
  });
});

/* ===== LIGHTBOX MODAL ===== */
const lightboxModal = document.getElementById('lightboxModal');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxTag = document.getElementById('lightboxTag');
const lightboxLoc = document.getElementById('lightboxLoc');

if (lightboxModal) {
  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.dataset.img;
      const title = card.dataset.title;
      const loc = card.dataset.loc;
      const cat = card.dataset.category;

      lightboxImg.src = img;
      lightboxTitle.textContent = title;
      lightboxLoc.textContent = `📍 Details: ${loc}`;
      lightboxTag.textContent = cat;

      lightboxModal.classList.add('open');
      lightboxModal.setAttribute('aria-hidden', 'false');
    });
  });

  lightboxClose.addEventListener('click', () => {
    lightboxModal.classList.remove('open');
    lightboxModal.setAttribute('aria-hidden', 'true');
  });

  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      lightboxModal.classList.remove('open');
      lightboxModal.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal.classList.contains('open')) {
      lightboxModal.classList.remove('open');
      lightboxModal.setAttribute('aria-hidden', 'true');
    }
  });
}

/* ===== BEFORE / AFTER SLIDER ===== */
const baSlider = document.getElementById('baSlider');
const baDivider = document.getElementById('baDivider');

if (baSlider && baDivider) {
  let dragging = false;
  const baBefore = baSlider.querySelector('.ba-before');

  function setSlider(x) {
    const rect = baSlider.getBoundingClientRect();
    let pct = Math.min(Math.max((x - rect.left) / rect.width * 100, 5), 95);
    baDivider.style.left = pct + '%';
    baBefore.style.width = pct + '%';
  }

  baSlider.addEventListener('mousedown', e => { dragging = true; setSlider(e.clientX); });
  window.addEventListener('mousemove', e => { if (dragging) setSlider(e.clientX); });
  window.addEventListener('mouseup', () => { dragging = false; });
  baSlider.addEventListener('touchstart', e => { dragging = true; setSlider(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove', e => { if (dragging) setSlider(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });
}

/* ===== FAQ ACCORDION ===== */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

/* ===== FORM SUBMIT ===== */
const ctaForm = document.getElementById('ctaForm');
if (ctaForm) {
  ctaForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.textContent = '⏳ Processing Booking...';
    btn.disabled = true;
    setTimeout(() => {
      this.style.display = 'none';
      document.getElementById('formSuccess').classList.remove('hidden');
    }, 1200);
  });
}

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
