/* ============================================================
   Grace Leisure Tours — reviews.js
   Fetches reviews.json → renders review cards
   Fetches gallery.json → renders media gallery
   ============================================================ */

(function () {
  'use strict';

  const REVIEWS_GRID_ID  = 'reviewsGrid';
  const GALLERY_ID       = 'mediaGallery';
  const REVIEWS_PATH     = 'assets/data/reviews.json';
  const GALLERY_PATH     = 'assets/data/gallery.json';

  /* ── Build a single review card ───────────────────────────── */
  function buildReviewCard(rev) {
    const stars = '★'.repeat(rev.stars || 5);

    const card = document.createElement('div');
    card.className = 'rev-card';

    card.innerHTML = `
      <div class="rev-quote-icon">❝</div>
      <div class="rev-card-top">
        <div class="rev-avatar ${rev.avatarClass}">${rev.initial}</div>
        <div class="rev-stars">${stars}</div>
      </div>
      <p class="rev-text">"${rev.text}"</p>
      <div class="rev-footer">
        <div class="rev-name">${rev.name}</div>
        <div class="rev-loc"><i class="fa-solid fa-location-dot"></i> ${rev.location}</div>
        <span class="rev-tour">${rev.tour}</span>
      </div>
    `;
    return card;
  }

  /* ── Build a single gallery media item ────────────────────── */
  function buildMediaItem(item) {
    const wrapper = document.createElement('div');

    if (item.type === 'video-youtube') {
      wrapper.className = 'media-item media-video';
      wrapper.innerHTML = `<iframe src="${item.src}" allowfullscreen loading="lazy"></iframe>`;
    } else if (item.type === 'video-local') {
      wrapper.className = 'media-item media-video';
      wrapper.innerHTML = `<video controls><source src="${item.src}" type="video/mp4"></video>`;
    } else {
      wrapper.className = 'media-item';
      wrapper.innerHTML = `<img src="${item.src}" alt="${item.alt || ''}" loading="lazy">`;
    }

    return wrapper;
  }

  /* ── Make elements visible (with scroll-reveal if available) ── */
  function makeVisible(elements) {
    elements.forEach((el, i) => {
      if (window._revealObs) {
        // Use scroll-reveal animation
        el.classList.add('reveal');
        const delaySteps = ['', 'd1', 'd2'];
        const cls = delaySteps[i % 3];
        if (cls) el.classList.add(cls);
        window._revealObs.observe(el);
      } else {
        // No observer available — just show them immediately
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }

  /* ── Load reviews ──────────────────────────────────────────── */
  async function loadReviews() {
    const grid = document.getElementById(REVIEWS_GRID_ID);
    if (!grid) return;

    try {
      const res     = await fetch(REVIEWS_PATH);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reviews = await res.json();

      const frag = document.createDocumentFragment();
      reviews.forEach(rev => frag.appendChild(buildReviewCard(rev)));
      grid.appendChild(frag);

      makeVisible(Array.from(grid.querySelectorAll('.rev-card')));
    } catch (err) {
      console.error('[reviews.js] Failed to load reviews:', err);
      grid.innerHTML = '<p style="color:#9CA3AF;text-align:center;padding:40px 0;">Unable to load reviews. Please make sure you are running this site via a local server (e.g. Live Server in VS Code), not by opening it directly as a file.</p>';
    }
  }

  /* ── Load gallery ──────────────────────────────────────────── */
  async function loadGallery() {
    const gallery = document.getElementById(GALLERY_ID);
    if (!gallery) return;

    try {
      const res   = await fetch(GALLERY_PATH);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items = await res.json();

      const frag = document.createDocumentFragment();
      items.forEach(item => frag.appendChild(buildMediaItem(item)));
      gallery.appendChild(frag);

      makeVisible(Array.from(gallery.querySelectorAll('.media-item')));
    } catch (err) {
      console.error('[reviews.js] Failed to load gallery:', err);
      gallery.innerHTML = '<p style="color:#9CA3AF;text-align:center;padding:40px 0;">Unable to load gallery. Please use a local server.</p>';
    }
  }

  /* ── LIGHTBOX ──────────────────────────────────────────────── */
  let lightboxOverlay = null;
  let lightboxImg     = null;
  let lightboxCounter = null;
  let lightboxCaption = null;
  let lightboxPhotos  = [];   // array of { src, alt }
  let lightboxIndex   = 0;

  function createLightbox() {
    if (lightboxOverlay) return; // already created

    lightboxOverlay = document.createElement('div');
    lightboxOverlay.className = 'lightbox-overlay';
    lightboxOverlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      <button class="lightbox-nav lightbox-prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="lightbox-img-wrap"><img src="" alt=""></div>
      <button class="lightbox-nav lightbox-next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>
      <div class="lightbox-caption"></div>
      <div class="lightbox-counter"></div>
    `;
    document.body.appendChild(lightboxOverlay);

    lightboxImg     = lightboxOverlay.querySelector('.lightbox-img-wrap img');
    lightboxCounter = lightboxOverlay.querySelector('.lightbox-counter');
    lightboxCaption = lightboxOverlay.querySelector('.lightbox-caption');

    // Close on overlay click (but not on image/buttons)
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) closeLightbox();
    });

    // Close button
    lightboxOverlay.querySelector('.lightbox-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });

    // Nav buttons
    lightboxOverlay.querySelector('.lightbox-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(-1);
    });
    lightboxOverlay.querySelector('.lightbox-next').addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(1);
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!lightboxOverlay.classList.contains('active')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   navigateLightbox(-1);
      if (e.key === 'ArrowRight')  navigateLightbox(1);
    });
  }

  function openLightbox(index) {
    createLightbox();
    lightboxIndex = index;
    updateLightboxImage();
    lightboxOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxOverlay) return;
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + lightboxPhotos.length) % lightboxPhotos.length;
    updateLightboxImage();
  }

  function updateLightboxImage() {
    const photo = lightboxPhotos[lightboxIndex];
    if (!photo) return;
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt || '';
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
    lightboxCaption.textContent = photo.alt || '';
  }

  function initLightbox() {
    const gallery = document.getElementById(GALLERY_ID);
    if (!gallery) return;

    // Collect only photo items (not videos)
    const photoItems = gallery.querySelectorAll('.media-item:not(.media-video)');
    lightboxPhotos = [];

    photoItems.forEach((item, i) => {
      const img = item.querySelector('img');
      if (!img) return;

      lightboxPhotos.push({ src: img.src, alt: img.alt || '' });
      const photoIndex = lightboxPhotos.length - 1;

      item.style.cursor = 'zoom-in';
      item.addEventListener('click', () => openLightbox(photoIndex));
    });
  }

  /* ── Main ──────────────────────────────────────────────────── */
  async function init() {
    await loadReviews();
    await loadGallery();
    initLightbox();   // attach click handlers after gallery is populated
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
