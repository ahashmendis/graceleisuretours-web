/* ============================================================
   Grace Leisure Tours — destinations.js
   Fetches assets/data/destinations.json and renders the grid.
   Also handles filter tab logic.
   ============================================================ */

(function () {
  'use strict';

  const GRID_ID   = 'destGrid';
  const DATA_PATH = 'assets/data/destinations.json';

  /* ── Build a single destination card ──────────────────────── */
  function buildCard(dest) {
    const facts = dest.facts
      .map(f => `<div class="dest-fact"><i class="${f.icon}"></i> ${f.text}</div>`)
      .join('');

    const card = document.createElement('div');
    card.className = 'dest-card-full';
    card.setAttribute('data-cat', dest.category);

    card.innerHTML = `
      <div class="dest-card-img-wrap">
        <img src="${dest.image}" alt="${dest.alt}" loading="lazy">
        <span class="dest-card-img-cat">${dest.categoryLabel}</span>
      </div>
      <div class="dest-card-body-full">
        <h3 class="dest-card-title">${dest.title}</h3>
        <p class="dest-card-text">${dest.description}</p>
        <div class="dest-card-facts">${facts}</div>
        <a href="contact.html" class="dest-card-link">
          ${dest.linkText} <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    `;
    return card;
  }

  /* ── Filter tab logic ──────────────────────────────────────── */
  function initFilters(cards) {
    const tabs = document.querySelectorAll('.dest-tab');
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
              card.style.opacity   = '1';
              card.style.transform = '';
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
        card.style.transitionDelay = `${i * 0.05}s`;
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
      const res = await fetch(DATA_PATH);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const destinations = await res.json();

      const fragment = document.createDocumentFragment();
      destinations.forEach(dest => fragment.appendChild(buildCard(dest)));
      grid.appendChild(fragment);

      const cards = Array.from(grid.querySelectorAll('.dest-card-full'));
      initFilters(cards);
      makeVisible(cards);

    } catch (err) {
      console.error('[destinations.js] Failed to load destinations data:', err);
      grid.innerHTML = '<p style="color:#9CA3AF;text-align:center;padding:40px 0;">Unable to load destinations. Please use a local server (e.g. Live Server).</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
