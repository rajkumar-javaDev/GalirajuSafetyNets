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

/* ===== HERO PARTICLES ===== */
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 12 + 8}s;
      animation-delay:${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
}
createParticles();

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
      lightboxLoc.textContent = `📍 Location: ${loc}`;
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

/* ===== TESTIMONIALS CAROUSEL ===== */
const track = document.getElementById('testimonialsTrack');
const tPrev = document.getElementById('tPrev');
const tNext = document.getElementById('tNext');
const tDotsEl = document.getElementById('tDots');

if (track) {
  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;

  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 't-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    tDotsEl.appendChild(dot);
  });

  function getVisible() {
    return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  }

  function goTo(idx) {
    const vis = getVisible();
    const max = Math.max(0, total - vis);
    current = Math.min(Math.max(idx, 0), max);
    const cardW = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * cardW}px)`;
    track.style.transition = 'transform .4s ease';
    tDotsEl.querySelectorAll('.t-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (tPrev) tPrev.addEventListener('click', () => goTo(current - 1));
  if (tNext) tNext.addEventListener('click', () => goTo(current + 1));
  window.addEventListener('resize', () => goTo(0));

  setInterval(() => {
    const vis = getVisible();
    const max = Math.max(0, total - vis);
    goTo(current < max ? current + 1 : 0);
  }, 4500);
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
