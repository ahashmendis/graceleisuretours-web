// Grace Leisure Tours — Shared main.js

document.addEventListener('DOMContentLoaded', () => {

  /* ── LOADER ──────────────────────────── */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 1400);
    });
  }

  /* ── NAVBAR SCROLL ───────────────────── */
  const navbar = document.getElementById('navbar');
  const checkScroll = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();

  // Mark active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === currentPage) a.classList.add('active');
  });

  /* ── MOBILE NAV ──────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SCROLL REVEAL ───────────────────── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Expose globally so page-specific JS modules can register dynamic elements
  window._revealObs = revealObs;

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // Auto-stagger grid children
  document.querySelectorAll('[data-stagger]').forEach(grid => {
    const children = grid.children;
    Array.from(children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${i * 0.08}s`;
      revealObs.observe(child);
    });
  });

  /* ── COUNTER ANIMATION ───────────────── */
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      let startTime = null;
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(easedProgress * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

  /* ── HERO IMAGE SLIDESHOW ────────────── */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots  = document.querySelectorAll('.hero-dot');
  if (heroSlides.length > 1) {
    let current = 0;
    const advance = () => {
      heroSlides[current].style.opacity = '0';
      heroDots[current]?.classList.remove('active');
      current = (current + 1) % heroSlides.length;
      heroSlides[current].style.opacity = '1';
      heroDots[current]?.classList.add('active');
    };
    heroSlides[0].style.opacity = '1';
    heroDots[0]?.classList.add('active');
    const timer = setInterval(advance, 5000);
    heroDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(timer);
        heroSlides[current].style.opacity = '0';
        heroDots[current]?.classList.remove('active');
        current = i;
        heroSlides[current].style.opacity = '1';
        heroDots[current]?.classList.add('active');
      });
    });
  }

  /* ── DESTINATION TABS ────────────────── */
  document.querySelectorAll('.dest-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dest-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('[data-cat]').forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        if (show) {
          card.style.display = '';
          requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = ''; });
        } else {
          card.style.opacity = '0'; card.style.transform = 'scale(0.94)';
          setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 400);
        }
      });
    });
  });

  /* ── CONTACT FORM → WhatsApp ────────── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Redirecting…';
      btn.disabled = true;

      // Gather field values
      const firstName = (document.getElementById('cfFirstName')?.value || '').trim();
      const lastName  = (document.getElementById('cfLastName')?.value  || '').trim();
      const email     = (document.getElementById('cfEmail')?.value     || '').trim();
      const phone     = (document.getElementById('cfPhone')?.value     || '').trim();
      const tour      = (document.getElementById('cfTour')?.value      || '').trim();
      const guests    = (document.getElementById('cfGuests')?.value    || '').trim();
      const arrival   = (document.getElementById('cfArrival')?.value   || '').trim();
      const depart    = (document.getElementById('cfDepart')?.value    || '').trim();
      const message   = (document.getElementById('cfMessage')?.value   || '').trim();

      // Build WhatsApp message
      let waMsg = `*GRACE LEISURE TOURS — New Enquiry*\n`;
      waMsg += `----------------------------------------\n\n`;
      waMsg += `*Guest Details*\n`;
      waMsg += `Name: ${firstName} ${lastName}\n`;
      if (email)   waMsg += `Email: ${email}\n`;
      if (phone)   waMsg += `Phone: ${phone}\n`;
      waMsg += `\n`;
      waMsg += `*Trip Details*\n`;
      if (tour)    waMsg += `Tour Interest: ${tour}\n`;
      if (guests)  waMsg += `Number of Guests: ${guests}\n`;
      if (arrival) waMsg += `Arrival Date: ${arrival}\n`;
      if (depart)  waMsg += `Departure Date: ${depart}\n`;
      waMsg += `\n`;
      waMsg += `*Message*\n`;
      waMsg += `${message}\n`;
      waMsg += `\n----------------------------------------\n`;
      waMsg += `Sent via graceleisuretours.com`;

      const waNumber = '94763775547';
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`;

      setTimeout(() => {
        window.open(waUrl, '_blank');
        showToast('✓ Opening WhatsApp — send your message to complete the enquiry!');
        form.reset();
        btn.innerHTML = orig;
        btn.disabled = false;
      }, 800);
    });
  }

  /* ── TOAST ───────────────────────────── */
  window.showToast = function(msg) {
    let toast = document.querySelector('.toast-msg');
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast-msg'; document.body.appendChild(toast); }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  };

  /* ── SMOOTH SCROLL (for anchor links) ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ── VEHICLE TAB HIGHLIGHT (vehicles page) ── */
  document.querySelectorAll('.veh-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.veh-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});
