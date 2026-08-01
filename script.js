/* ==========================================================================
   LAKSHMI ENTERPRISES — PRODUCTION JS CONTROLLER
   - 60 FPS GPU-Accelerated Animations
   - Premium Initial Page Load Sequence (Section 8)
   - Throttled Scroll & Debounced Resize Handlers
   - Quiet Hero Background Image Preloader
   - Passive Event Listeners & Zero-Jank Touch Gestures
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavbarScroll();
  initMobileMenu();
  initHeroSlider();
  initReviewsCarousel();
  initScrollReveal();
  initRippleEffect();
  initGalleryFilters();
  initLightboxModal();
  initBeforeAfterSlider();
  initFaqAccordion();
  initCtaForm();
  initSmoothScroll();
});

/* ===== THEME TOGGLE ===== */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = html.dataset.theme === 'dark';
      html.dataset.theme = isDark ? 'light' : 'dark';
      themeToggle.textContent = isDark ? '🌙' : '☀️';
    }, { passive: true });
  }
}

/* ===== NAVBAR SCROLL (THROTTLED WITH RAF) ===== */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ===== HAMBURGER MENU ===== */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================================
   IMAGE-FIRST HERO SLIDER CONTROLLER & INITIAL LOADING EXPERIENCE (SECTION 8)
   ========================================================================== */
function initHeroSlider() {
  const heroSection = document.getElementById('hero');
  const slides = document.querySelectorAll('.hero-slide');
  const progressFill = document.getElementById('heroProgressFill');

  if (!slides || slides.length === 0) return;

  let currentSlideIndex = 0;
  let isSlideTransitioning = false;
  let autoPlayTimer = null;
  let progressStartTime = null;
  let progressReqAnim = null;
  const SLIDE_DURATION = 5000; // 5 Seconds

  // SECTION 8: INITIAL PAGE LOAD SEQUENCE
  // Step 1: Slide 0 image displays static immediately. Content initially hidden.
  // Step 2: Wait 350ms for user to register clean hero background photo.
  // Step 3: Trigger staggered upward fade (Label -> Title -> Subtitle -> Buttons).
  // Step 4: Keep visible for 5s, then seamlessly transition to Slide 2.
  if (heroSection) {
    setTimeout(() => {
      heroSection.classList.add('content-revealed');
    }, 350);

    setTimeout(() => {
      heroSection.classList.remove('hero-initial-load', 'content-revealed');
    }, SLIDE_DURATION);
  }

  // QUIET HERO IMAGE BACKGROUND PRELOADER
  function preloadRemainingHeroImages() {
    const preloadTask = () => {
      slides.forEach((slide, idx) => {
        if (idx === 0) return;
        const img = slide.querySelector('.hero-slide-img');
        if (img && img.src) {
          const tempImg = new Image();
          tempImg.src = img.src;
        }
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadTask, { timeout: 2000 });
    } else {
      setTimeout(preloadTask, 1200);
    }
  }

  // Progress Bar Timer Animation
  function startProgressBar() {
    if (!progressFill) return;
    if (progressReqAnim) cancelAnimationFrame(progressReqAnim);
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

  function goToSlide(nextIndex) {
    if (isSlideTransitioning) return;
    isSlideTransitioning = true;

    const currentSlide = slides[currentSlideIndex];
    const nextSlide = slides[nextIndex];

    if (currentSlide) {
      currentSlide.classList.add('exiting');
    }

    setTimeout(() => {
      if (currentSlide) {
        currentSlide.classList.remove('active', 'exiting');
      }
      if (nextSlide) {
        nextSlide.classList.add('active');
      }

      currentSlideIndex = nextIndex;
      startProgressBar();

      setTimeout(() => {
        isSlideTransitioning = false;
      }, 500);
    }, 280);

    resetAutoPlay();
  }

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
    if (progressReqAnim) cancelAnimationFrame(progressReqAnim);
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Mouse & Touch Gestures
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoPlay, { passive: true });
    heroSection.addEventListener('mouseleave', startAutoPlay, { passive: true });

    let touchStartX = 0;
    heroSection.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSection.addEventListener('touchend', e => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 45) {
        const nextIdx = (currentSlideIndex + 1) % slides.length;
        goToSlide(nextIdx);
      } else if (touchEndX - touchStartX > 45) {
        const prevIdx = (currentSlideIndex - 1 + slides.length) % slides.length;
        goToSlide(prevIdx);
      }
    }, { passive: true });
  }

  // Start slider
  slides[0].classList.add('active');
  startAutoPlay();
  preloadRemainingHeroImages();
}

/* ==========================================================================
   CUSTOMER REVIEWS AUTOMATIC CAROUSEL SLIDER
   ========================================================================== */
function initReviewsCarousel() {
  const reviewsTrack = document.getElementById('reviewsTrack');
  const reviewsPrev = document.getElementById('reviewsPrev');
  const reviewsNext = document.getElementById('reviewsNext');
  const reviewsDotsContainer = document.getElementById('reviewsDots');
  const reviewsContainer = document.getElementById('reviewsSliderContainer');

  if (!reviewsTrack || !reviewsContainer) return;

  const reviewCards = reviewsTrack.querySelectorAll('.testimonial-card');
  let currentReviewPage = 0;
  let reviewsAutoTimer = null;

  function getCardsPerView() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  function getTotalPages() {
    return Math.ceil(reviewCards.length / getCardsPerView());
  }

  function createReviewDots() {
    if (!reviewsDotsContainer) return;
    reviewsDotsContainer.innerHTML = '';
    const totalPages = getTotalPages();
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
      dot.className = `review-dot ${i === currentReviewPage ? 'active' : ''}`;
      dot.addEventListener('click', () => updateReviewsSlider(i));
      reviewsDotsContainer.appendChild(dot);
    }
  }

  function updateReviewsSlider(pageIndex) {
    const totalPages = getTotalPages();
    if (totalPages === 0) return;
    currentReviewPage = (pageIndex + totalPages) % totalPages;

    const cardsPerView = getCardsPerView();
    const firstCardIndex = currentReviewPage * cardsPerView;
    const cardWidth = reviewCards[0].getBoundingClientRect().width;
    const gap = 24;

    const offset = firstCardIndex * (cardWidth + gap);
    reviewsTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;

    if (reviewsDotsContainer) {
      const dots = reviewsDotsContainer.querySelectorAll('.review-dot');
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentReviewPage));
    }
  }

  function startReviewsAutoPlay() {
    stopReviewsAutoPlay();
    reviewsAutoTimer = setInterval(() => {
      updateReviewsSlider(currentReviewPage + 1);
    }, 4000);
  }

  function stopReviewsAutoPlay() {
    if (reviewsAutoTimer) clearInterval(reviewsAutoTimer);
  }

  if (reviewsNext) {
    reviewsNext.addEventListener('click', () => {
      updateReviewsSlider(currentReviewPage + 1);
      startReviewsAutoPlay();
    });
  }

  if (reviewsPrev) {
    reviewsPrev.addEventListener('click', () => {
      updateReviewsSlider(currentReviewPage - 1);
      startReviewsAutoPlay();
    });
  }

  reviewsContainer.addEventListener('mouseenter', stopReviewsAutoPlay, { passive: true });
  reviewsContainer.addEventListener('mouseleave', startReviewsAutoPlay, { passive: true });

  // Touch Swipe Support
  let touchStartX = 0;
  reviewsContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  reviewsContainer.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 40) {
      updateReviewsSlider(currentReviewPage + 1);
      startReviewsAutoPlay();
    } else if (touchEndX - touchStartX > 40) {
      updateReviewsSlider(currentReviewPage - 1);
      startReviewsAutoPlay();
    }
  }, { passive: true });

  // Debounce Resize Listener
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      createReviewDots();
      updateReviewsSlider(currentReviewPage);
    }, 150);
  }, { passive: true });

  createReviewDots();
  startReviewsAutoPlay();
}

/* ===== SCROLL REVEAL (INTERSECTION OBSERVER) ===== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length === 0) return;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), +delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ===== RIPPLE EFFECT ===== */
function initRippleEffect() {
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
}

/* ===== GALLERY CATEGORY FILTERS ===== */
function initGalleryFilters() {
  const gFilters = document.querySelectorAll('.g-filter');
  const galleryCards = document.querySelectorAll('.gallery-card');

  gFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      gFilters.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

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
}

/* ===== LIGHTBOX MODAL ===== */
function initLightboxModal() {
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxLoc = document.getElementById('lightboxLoc');
  const galleryCards = document.querySelectorAll('.gallery-card');

  if (!lightboxModal) return;

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.dataset.img;
      const title = card.dataset.title;
      const loc = card.dataset.loc;
      const cat = card.dataset.category;

      if (lightboxImg) lightboxImg.src = img;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxLoc) lightboxLoc.textContent = `📍 Details: ${loc}`;
      if (lightboxTag) lightboxTag.textContent = cat;

      lightboxModal.classList.add('open');
      lightboxModal.setAttribute('aria-hidden', 'false');
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('open');
      lightboxModal.setAttribute('aria-hidden', 'true');
    });
  }

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

/* ===== BEFORE / AFTER SLIDER (RAF OPTIMIZED) ===== */
function initBeforeAfterSlider() {
  const baSlider = document.getElementById('baSlider');
  const baDivider = document.getElementById('baDivider');

  if (!baSlider || !baDivider) return;

  let dragging = false;
  let rafId = null;
  let currentX = 0;
  const baBefore = baSlider.querySelector('.ba-before');

  function setSliderPosition() {
    const rect = baSlider.getBoundingClientRect();
    let pct = Math.min(Math.max((currentX - rect.left) / rect.width * 100, 5), 95);
    baDivider.style.left = pct + '%';
    if (baBefore) baBefore.style.width = pct + '%';
    rafId = null;
  }

  function handleMove(x) {
    currentX = x;
    if (!rafId) {
      rafId = requestAnimationFrame(setSliderPosition);
    }
  }

  baSlider.addEventListener('mousedown', e => { dragging = true; handleMove(e.clientX); });
  window.addEventListener('mousemove', e => { if (dragging) handleMove(e.clientX); }, { passive: true });
  window.addEventListener('mouseup', () => { dragging = false; });

  baSlider.addEventListener('touchstart', e => { dragging = true; handleMove(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove', e => { if (dragging) handleMove(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });
}

/* ===== FAQ ACCORDION ===== */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const qBtn = i.querySelector('.faq-question');
        if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ===== FORM SUBMIT ===== */
function initCtaForm() {
  const ctaForm = document.getElementById('ctaForm');
  if (!ctaForm) return;

  ctaForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    if (btn) {
      btn.textContent = '⏳ Processing Booking...';
      btn.disabled = true;
    }
    setTimeout(() => {
      this.style.display = 'none';
      const formSuccess = document.getElementById('formSuccess');
      if (formSuccess) formSuccess.classList.remove('hidden');
    }, 1000);
  });
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
