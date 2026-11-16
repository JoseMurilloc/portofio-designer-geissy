(function initItforumCase() {
  const openTriggers = document.querySelectorAll('[data-itforum-case-open]');
  const panel = document.getElementById('itforum-case');
  if (!openTriggers.length || !panel) return;

  const scrollEl = panel.querySelector('.itforum-case__scroll');
  const homeLink = document.querySelector('[data-home-link]');
  const siteHeader = document.querySelector('.header');
  const ANIMATION_MS = 820;
  let lastFocused = null;
  let isClosing = false;
  let pendingHomeScroll = false;

  function keepHeaderVisible() {
    if (!siteHeader) return;
    siteHeader.classList.remove('header--hide', 'header--show', 'header--is-hidden');
    siteHeader.style.visibility = '';
  }

  function openCase(event) {
    if (event) event.preventDefault();
    if (panel.classList.contains('is-open')) return;

    lastFocused = document.activeElement;
    isClosing = false;
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-preparing');
    keepHeaderVisible();

    if (scrollEl) scrollEl.scrollTop = 0;
    prepareScrollReveal();

    void panel.offsetWidth;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.classList.remove('is-preparing');
        panel.classList.add('is-open');
        startScrollReveal();
      });
    });

    document.body.classList.add('itforum-case-open');
    window.setTimeout(() => {
      panel.querySelector('#itforum-case-title')?.focus();
    }, ANIMATION_MS);
  }

  function scrollPageHome(behavior = 'smooth') {
    document.querySelector('.scroll-slides > section')?.classList.add('is-visible');
    window.scrollTo({ top: 0, left: 0, behavior });
  }

  function finishClose() {
    isClosing = false;
    panel.classList.remove('is-preparing');
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('itforum-case-open');
    resetScrollReveal();
    if (pendingHomeScroll) {
      pendingHomeScroll = false;
      lastFocused = null;
      scrollPageHome('auto');
      homeLink?.focus();
      return;
    }
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function closeCase() {
    if (!panel.classList.contains('is-open') || isClosing) return;

    isClosing = true;
    panel.classList.remove('is-open');
    document.dispatchEvent(new CustomEvent('itforum-case-close'));

    let closed = false;

    function onTransitionEnd(e) {
      if (e.target !== panel) return;
      if (closed) return;
      closed = true;
      panel.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    }

    panel.addEventListener('transitionend', onTransitionEnd);
    window.setTimeout(() => {
      if (!closed) {
        closed = true;
        panel.removeEventListener('transitionend', onTransitionEnd);
        finishClose();
      }
    }, ANIMATION_MS + 50);
  }

  openTriggers.forEach((el) => {
    el.addEventListener('click', openCase);
  });

  homeLink?.addEventListener('click', (event) => {
    if (!panel.classList.contains('is-open')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    pendingHomeScroll = true;
    closeCase();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      closeCase();
    }
  });

  const reduceMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let revealObserver = null;
  let revealTargets = [];
  let revealStartTimer = 0;

  function collectRevealTargets() {
    if (revealTargets.length) return;

    const add = (nodes, { stagger = 0, delay = 0, x, y, scale } = {}) => {
      [...nodes].forEach((el, index) => {
        el.classList.add('itforum-case__reveal');
        if (x) el.style.setProperty('--itforum-reveal-x', x);
        if (y) el.style.setProperty('--itforum-reveal-y', y);
        if (scale) el.style.setProperty('--itforum-reveal-scale', scale);
        el.style.setProperty('--itforum-reveal-delay', `${delay + index * stagger}ms`);
        revealTargets.push(el);
      });
    };

    add(panel.querySelectorAll('.itf-sec__head'));
    add(panel.querySelectorAll('.itf-problem'), { stagger: 90 });
    add(panel.querySelectorAll('.itf-before .itf-shot'), { stagger: 90, y: '1.25rem' });
    add(panel.querySelectorAll('.itf-decision__text'), { y: '1.25rem' });
    add(panel.querySelectorAll('.itf-decision__media'), { delay: 90, y: '1.5rem' });
    add(panel.querySelectorAll('.itf-ba'), { y: '1.5rem' });
    add(panel.querySelectorAll('.itf-phone'), { stagger: 70, y: '1.5rem' });
    add(panel.querySelectorAll('.itf-big > div'), { stagger: 90, y: '1.25rem' });
    add(panel.querySelectorAll('.itf-bm__head'), { y: '1.25rem' });
    add(panel.querySelectorAll('.itf-bm__card'), { stagger: 80, y: '1.25rem' });
    add(panel.querySelectorAll('.itf-bm__subtitle, .itf-bm__table-wrap'), { stagger: 80, y: '1.25rem' });
    add(panel.querySelectorAll('.itf-learn'), { y: '1.25rem' });
    add(panel.querySelectorAll('.itforum-case__tasks-intro'));
    add(panel.querySelectorAll('.itforum-case__task-item'), { stagger: 55 });
    add(panel.querySelectorAll('.itforum-case__process-row'), { stagger: 90 });
    add(panel.querySelectorAll('.itforum-case__redesign-eyebrow'));
    add(panel.querySelectorAll('.itforum-case__redesign-copy'), { delay: 60 });
    add(panel.querySelectorAll('.itforum-case__redesign-stage'), { delay: 120, y: '1.5rem' });
    add(panel.querySelectorAll('.itforum-case__legacy-eyebrow'));
    add(panel.querySelectorAll('.itforum-case__legacy-title'), { delay: 40 });
    add(panel.querySelectorAll('.itforum-case__legacy-frame'), { stagger: 80, y: '1.25rem' });
    add(panel.querySelectorAll('.itforum-case__new-portal-eyebrow'));
    add(panel.querySelectorAll('.itforum-case__new-portal-title'), { delay: 40 });
    add(panel.querySelectorAll('.itforum-case__new-portal-frame'), { stagger: 70, y: '1.25rem' });
    add(panel.querySelectorAll('.itforum-case__impact-title'));
    add(panel.querySelectorAll('.itforum-case__impact-metric'), { stagger: 80 });
    add(panel.querySelectorAll('.itforum-case__impact-board'), { delay: 90, y: '1.4rem' });
    add(panel.querySelectorAll('.itforum-case__footer'), { y: '0px' });
  }

  function resetScrollReveal() {
    window.clearTimeout(revealStartTimer);
    revealStartTimer = 0;
    revealObserver?.disconnect();
    revealObserver = null;
    if (scrollEl) scrollEl.removeEventListener('scroll', onRevealScroll);
    revealTargets.forEach((el) => el.classList.remove('is-revealed'));
  }

  function prepareScrollReveal() {
    collectRevealTargets();
    resetScrollReveal();
  }

  function revealElement(el) {
    if (!el || el.classList.contains('is-revealed')) return;
    el.classList.add('is-revealed');
    revealObserver?.unobserve(el);
  }

  function revealVisibleOrPassed() {
    if (!scrollEl) return;
    const rootRect = scrollEl.getBoundingClientRect();
    const trigger = rootRect.bottom - Math.min(120, rootRect.height * 0.12);
    revealTargets.forEach((el) => {
      if (el.classList.contains('is-revealed')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < trigger) revealElement(el);
    });
  }

  function onRevealScroll() {
    revealVisibleOrPassed();
  }

  function startScrollReveal() {
    collectRevealTargets();

    if (reduceMotionMq.matches || !scrollEl) {
      revealTargets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    window.clearTimeout(revealStartTimer);
    revealStartTimer = window.setTimeout(() => {
      revealObserver?.disconnect();
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            revealElement(entry.target);
          });
        },
        {
          root: scrollEl,
          threshold: 0.12,
          rootMargin: '0px 0px -12% 0px'
        }
      );
      revealTargets.forEach((el) => revealObserver.observe(el));
      scrollEl.addEventListener('scroll', onRevealScroll, { passive: true });
      revealVisibleOrPassed();
    }, 180);
  }

  panel.querySelectorAll('[data-itf-goto]').forEach((el) => {
    el.addEventListener('click', (event) => {
      const target = document.getElementById(el.dataset.itfGoto);
      if (!scrollEl || !target) return;
      event.preventDefault();
      const section = target.closest('section') || target;
      const top = section.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
      scrollEl.scrollTo({ top, behavior: reduceMotionMq.matches ? 'auto' : 'smooth' });
    });
  });

  panel.querySelectorAll('[data-itforum-case-top]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      if (!scrollEl) return;
      scrollEl.scrollTo({
        top: 0,
        behavior: reduceMotionMq.matches ? 'auto' : 'smooth',
      });
    });
  });

})();
