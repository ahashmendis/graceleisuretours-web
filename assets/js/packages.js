/* ============================================================
   Grace Leisure Tours — packages.js
   Fetches assets/data/packages.json and renders the grid.
   Also handles filter tab logic.
   ============================================================ */

(function () {
  'use strict';

  const GRID_ID    = 'packagesGrid';
  const DATA_PATH  = 'assets/data/packages.json';

  /* ── Build a single package card ──────────────────────────── */
  function buildCard(pkg) {
    const highlights = pkg.highlights
      .map(h => `<div class="pkg-check"><i class="fa-solid fa-circle-check"></i> ${h}</div>`)
      .join('');

    const card = document.createElement('div');
    card.className = 'pkg-card';
    card.setAttribute('data-cat', pkg.category);

    card.innerHTML = `
      <div class="pkg-img">
        <img src="${pkg.image}" alt="${pkg.alt}" loading="lazy">
        <span class="pkg-img-badge">${pkg.duration}</span>
      </div>
      <div class="pkg-body">
        <div class="pkg-category"><i class="${pkg.icon}"></i> ${pkg.categoryLabel}</div>
        <h3 class="pkg-title">${pkg.title}</h3>
        <p class="pkg-desc">${pkg.description}</p>
        <div class="pkg-checklist">${highlights}</div>
        <div class="pkg-footer">
          <a href="contact.html" class="pkg-enquire-btn">Enquire Now</a>
        </div>
      </div>
    `;
    return card;
  }

  /* ── Filter tab logic ──────────────────────────────────────── */
  function initFilters(cards) {
    const tabs = document.querySelectorAll('.pkg-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.getAttribute('data-filter');

        cards.forEach(card => {
          const cat  = card.getAttribute('data-cat');
          const show = (filter === 'all' || cat === filter);
          card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

          if (show) {
            card.style.display = '';
            requestAnimationFrame(() => {
              card.style.opacity    = '1';
              card.style.transform  = '';
            });
          } else {
            card.style.opacity   = '0';
            card.style.transform = 'scale(0.94)';
            setTimeout(() => {
              if (card.style.opacity === '0') card.style.display = 'none';
            }, 360);
          }
        });
      });
    });
  }

  /* ── Make elements visible (with scroll-reveal if available) ── */
  function makeVisible(cards) {
    cards.forEach((card, i) => {
      if (window._revealObs) {
        card.classList.add('reveal');
        card.style.transitionDelay = `${i * 0.06}s`;
        window._revealObs.observe(card);
      } else {
        card.style.opacity = '1';
        card.style.transform = 'none';
      }
    });
  }

  /* ── Main: fetch JSON → render ─────────────────────────────── */
  async function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    try {
      const res  = await fetch(DATA_PATH);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const packages = await res.json();

      const fragment = document.createDocumentFragment();
      packages.forEach(pkg => fragment.appendChild(buildCard(pkg)));
      grid.appendChild(fragment);

      const cards = Array.from(grid.querySelectorAll('.pkg-card'));
      initFilters(cards);
      makeVisible(cards);

    } catch (err) {
      console.error('[packages.js] Failed to load packages data:', err);
      grid.innerHTML = '<p style="color:#9CA3AF;text-align:center;padding:40px 0;">Unable to load packages. Please use a local server (e.g. Live Server).</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
