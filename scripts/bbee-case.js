/*
 * BBEE – Smart Apiculture case study panel.
 * Same behaviour as the Orla case: slides up over the page, Escape / Home
 * close it, sections fade in as they scroll into view. Also drives the web
 * platform tour (tabs + screen thumbnails).
 */
(function initBbeeCase() {
  const openTriggers = document.querySelectorAll('[data-bbee-case-open]');
  const panel = document.getElementById('bbee-case');
  if (!openTriggers.length || !panel) return;

  const scrollEl = panel.querySelector('.bbee-case__scroll');
  const homeLink = document.querySelector('[data-home-link]');
  const siteHeader = document.querySelector('.header');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ANIMATION_MS = 820;
  let lastFocused = null;
  let isClosing = false;
  let pendingHomeScroll = false;

  /* ---------- open / close ---------- */
  function openCase(event) {
    if (event) event.preventDefault();
    if (panel.classList.contains('is-open')) return;
    lastFocused = document.activeElement;
    isClosing = false;
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-preparing');
    if (siteHeader) {
      siteHeader.classList.remove('header--hide', 'header--show', 'header--is-hidden');
      siteHeader.style.visibility = '';
    }
    if (scrollEl) scrollEl.scrollTop = 0;
    showTab(tabs[0]?.dataset.tourTab, { focus: false });
    resetReveal();
    void panel.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      panel.classList.remove('is-preparing');
      panel.classList.add('is-open');
      startReveal();
    }));
    document.body.classList.add('bbee-case-open');
    window.setTimeout(() => panel.querySelector('#bbee-case-title')?.focus(), ANIMATION_MS);
  }

  function finishClose() {
    isClosing = false;
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('bbee-case-open');
    resetReveal();
    if (pendingHomeScroll) {
      pendingHomeScroll = false;
      lastFocused = null;
      document.querySelector('.scroll-slides > section')?.classList.add('is-visible');
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      homeLink?.focus();
      return;
    }
    lastFocused?.focus?.();
  }

  function closeCase() {
    if (!panel.classList.contains('is-open') || isClosing) return;
    isClosing = true;
    panel.classList.remove('is-open');
    let done = false;
    const end = (e) => {
      if (e && e.target !== panel) return;
      if (done) return;
      done = true;
      panel.removeEventListener('transitionend', end);
      finishClose();
    };
    panel.addEventListener('transitionend', end);
    window.setTimeout(() => end(), ANIMATION_MS + 50);
  }

  openTriggers.forEach((el) => el.addEventListener('click', openCase));
  homeLink?.addEventListener('click', (event) => {
    if (!panel.classList.contains('is-open')) return;
    event.preventDefault();
    pendingHomeScroll = true;
    closeCase();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) closeCase();
  });
  panel.querySelectorAll('[data-bbee-case-top]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      scrollEl?.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  });

  /* ---------- scroll reveal ---------- */
  const revealTargets = [...panel.querySelectorAll(
    '.bbee-case__eyebrow, .bbee-case__title, .bbee-case__meta, .bbee-case__site, .bbee-case__cover, ' +
    '.bbee-case__h2, .bbee-case__about-col, .bbee-case__statement, .bbee-case__lead, .bbee-case__highlights, ' +
    '.bbee-case__field-img, .bbee-proto .orla-proto__head, .bbee-proto .orla-proto__stage, .bbee-tour__tabs, ' +
    '.bbee-tour__panel, .bbee-ds__grid, .bbee-ds__illus, .bbee-case__closing'
  )];
  revealTargets.forEach((el, i) => {
    el.classList.add('bbee-reveal');
    // small stagger for siblings that appear together
    if (el.matches('.bbee-case__about-col')) el.style.setProperty('--bbee-reveal-delay', `${(i % 3) * 90}ms`);
  });
  let revealObserver = null;

  function resetReveal() {
    revealObserver?.disconnect();
    revealObserver = null;
    revealTargets.forEach((el) => el.classList.remove('is-revealed'));
  }

  function startReveal() {
    if (reduceMotion.matches || !scrollEl || !('IntersectionObserver' in window)) {
      revealTargets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { root: scrollEl, threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el) => revealObserver.observe(el));
    // anything already passed (e.g. fast scroll) shows immediately
    scrollEl.addEventListener('scroll', () => {
      const bottom = scrollEl.getBoundingClientRect().bottom;
      revealTargets.forEach((el) => {
        if (!el.classList.contains('is-revealed') && el.getBoundingClientRect().top < bottom - 40) el.classList.add('is-revealed');
      });
    }, { passive: true });
  }

  /* ---------- web platform tour ---------- */
  const tour = panel.querySelector('[data-bbee-tour]');
  const tabs = tour ? [...tour.querySelectorAll('[data-tour-tab]')] : [];

  function showTab(key, { focus = true } = {}) {
    if (!tour || !key) return;
    tabs.forEach((tab) => {
      const on = tab.dataset.tourTab === key;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus({ preventScroll: true });
      // keep the active tab visible when the tab row scrolls sideways (phones)
      if (on) {
        const row = tab.parentElement;
        const left = tab.offsetLeft - row.offsetLeft;
        if (left < row.scrollLeft || left + tab.offsetWidth > row.scrollLeft + row.clientWidth) {
          row.scrollTo({ left: Math.max(0, left - 16), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
      }
    });
    tour.querySelectorAll('[data-tour-panel]').forEach((p) => {
      const on = p.dataset.tourPanel === key;
      p.hidden = !on;
      p.classList.toggle('is-active', on);
      if (on) showShot(p, 0);
    });
  }

  function showShot(panelEl, index) {
    panelEl.querySelectorAll('.bbee-tour__shot').forEach((img) => {
      img.classList.toggle('is-active', Number(img.dataset.shot) === index);
    });
    panelEl.querySelectorAll('.bbee-tour__thumb').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.shot) === index));
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showTab(tab.dataset.tourTab, { focus: false }));
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      showTab(tabs[(i + dir + tabs.length) % tabs.length].dataset.tourTab);
    });
  });

  tour?.querySelectorAll('.bbee-tour__thumb').forEach((b) => {
    b.addEventListener('click', () => showShot(b.closest('[data-tour-panel]'), Number(b.dataset.shot)));
  });
})();
