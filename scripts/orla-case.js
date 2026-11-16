(function initOrlaCase() {
  const openTriggers = document.querySelectorAll('[data-orla-case-open]');
  const panel = document.getElementById('orla-case');
  if (!openTriggers.length || !panel) return;

  const scrollEl = panel.querySelector('.orla-case__scroll');
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
    showFlowStep(0, { instant: true });
    showProcessStep(0, { instant: true });
    prepareScrollReveal();

    void panel.offsetWidth;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.classList.remove('is-preparing');
        panel.classList.add('is-open');
        startScrollReveal();
      });
    });

    document.body.classList.add('orla-case-open');
    window.setTimeout(() => {
      panel.querySelector('#orla-case-title')?.focus();
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
    document.body.classList.remove('orla-case-open');
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
    event.preventDefault();

    if (panel.classList.contains('is-open')) {
      pendingHomeScroll = true;
      closeCase();
      return;
    }

    scrollPageHome();
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
        el.classList.add('orla-case__reveal');
        if (x) el.style.setProperty('--orla-reveal-x', x);
        if (y) el.style.setProperty('--orla-reveal-y', y);
        if (scale) el.style.setProperty('--orla-reveal-scale', scale);
        el.style.setProperty('--orla-reveal-delay', `${delay + index * stagger}ms`);
        revealTargets.push(el);
      });
    };

    add(panel.querySelectorAll('.orla-case__challenges-title'));
    add(panel.querySelectorAll('.orla-case__challenges-item'), { stagger: 90 });
    add(panel.querySelectorAll('.orla-case__challenges-note'), { delay: 80 });
    add(panel.querySelectorAll('.orla-case__challenges-art'), { x: '1.75rem', y: '0.4rem' });
    add(panel.querySelectorAll('.orla-case__tasks-title'));
    add(panel.querySelectorAll('.orla-case__tasks-intro'), { delay: 60 });
    add(panel.querySelectorAll('.orla-lanes'), { delay: 90, y: '1.5rem' });
    add(panel.querySelectorAll('.orla-case__process-head'));
    add(panel.querySelectorAll('.orla-case__process-stage'), {
      delay: 120,
      y: '1.6rem',
      scale: '0.985'
    });
    add(panel.querySelectorAll('.orla-case__flow-title'));
    add(panel.querySelectorAll('.orla-case__flow-layout'), { delay: 90, y: '1.5rem' });
    add(panel.querySelectorAll('.orla-case__impact-title'));
    add(panel.querySelectorAll('.orla-impact__lead'));
    add(panel.querySelectorAll('.orla-impact__card'), { stagger: 80 });
    add(panel.querySelectorAll('.orla-case__impact-board'), { delay: 90, y: '1.4rem' });
    add(panel.querySelectorAll('.orla-case__footer'), { y: '0px' });
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

  panel.querySelectorAll('[data-orla-case-top]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      if (!scrollEl) return;
      scrollEl.scrollTo({
        top: 0,
        behavior: reduceMotionMq.matches ? 'auto' : 'smooth',
      });
    });
  });

  const flowTrack = panel.querySelector('.orla-case__flow-track');
  const flowSticky = panel.querySelector('.orla-case__flow-sticky');
  const flowSteps = [...panel.querySelectorAll('[data-flow-step]')];
  const flowPanels = [...panel.querySelectorAll('[data-flow-panel]')];
  const flowPanelsRoot = panel.querySelector('.orla-case__flow-panels');
  const flowCount = flowSteps.length;
  let shownFlowIndex = 0;
  let flowScrollLock = false;
  let flowFrame = 0;

  function showFlowStep(index, { instant = false } = {}) {
    const next = Math.max(0, Math.min(flowCount - 1, Number(index)));
    if (next === shownFlowIndex && !instant) return;

    const skipMotion = instant || reduceMotionMq.matches;
    if (flowPanelsRoot) {
      flowPanelsRoot.classList.toggle('is-instant', skipMotion);
    }

    flowSteps.forEach((tab) => {
      const active = Number(tab.dataset.flowStep) === next;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });

    flowPanels.forEach((el) => {
      const active = Number(el.dataset.flowPanel) === next;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    shownFlowIndex = next;

    if (skipMotion && flowPanelsRoot) {
      void flowPanelsRoot.offsetWidth;
      flowPanelsRoot.classList.remove('is-instant');
    }
  }

  function flowIndexFromScroll() {
    if (!flowTrack || !flowSticky || !scrollEl) return 0;
    const start = flowTrack.offsetTop;
    const range = Math.max(1, flowTrack.offsetHeight - flowSticky.offsetHeight);
    const progress = (scrollEl.scrollTop - start) / range;
    const clamped = Math.min(0.999, Math.max(0, progress));
    return Math.min(flowCount - 1, Math.floor(clamped * flowCount));
  }

  function syncFlowFromScroll() {
    if (flowScrollLock) return;
    showFlowStep(flowIndexFromScroll());
  }

  function onFlowScroll() {
    if (flowFrame) return;
    flowFrame = window.requestAnimationFrame(() => {
      flowFrame = 0;
      syncFlowFromScroll();
    });
  }

  function scrollToFlowStep(index) {
    if (!flowTrack || !flowSticky || !scrollEl) return;
    const next = Math.max(0, Math.min(flowCount - 1, Number(index)));
    const start = flowTrack.offsetTop;
    const range = Math.max(1, flowTrack.offsetHeight - flowSticky.offsetHeight);
    const target = start + ((next + 0.35) / flowCount) * range;
    showFlowStep(next);
    flowScrollLock = true;
    scrollEl.scrollTo({
      top: target,
      behavior: reduceMotionMq.matches ? 'auto' : 'smooth',
    });
    window.setTimeout(() => {
      flowScrollLock = false;
      syncFlowFromScroll();
    }, reduceMotionMq.matches ? 50 : 700);
  }

  flowSteps.forEach((tab) => {
    tab.addEventListener('click', () => scrollToFlowStep(tab.dataset.flowStep));
  });

  if (scrollEl) {
    scrollEl.addEventListener('scroll', onFlowScroll, { passive: true });
  }

  showFlowStep(0, { instant: true });

  const processSection = panel.querySelector('.orla-case__process');
  const processViewport = panel.querySelector('.orla-case__process-viewport');
  const processTrack = panel.querySelector('.orla-case__process-track');
  const processItems = [...panel.querySelectorAll('[data-process-step]')];
  const processTabs = [...panel.querySelectorAll('[data-process-tab]')];
  const processPanels = [...panel.querySelectorAll('[data-process-panel]')];
  const processCount = processItems.length;
  let shownProcessIndex = 0;
  let processWheelLock = 0;
  let processPointerId = null;
  let processDragStartX = 0;
  let processDragDelta = 0;
  let processDragging = false;

  function showProcessStep(index, { instant = false } = {}) {
    const next = Math.max(0, Math.min(processCount - 1, Number(index)));
    const skipMotion = instant || reduceMotionMq.matches;

    if (processTrack) {
      processTrack.classList.toggle('is-instant', skipMotion);
      processTrack.style.setProperty('--process-index', String(next));
      processTrack.style.setProperty('--process-drag', '0px');
    }

    processItems.forEach((el) => {
      el.classList.toggle('is-active', Number(el.dataset.processStep) === next);
    });

    processTabs.forEach((tab) => {
      const active = Number(tab.dataset.processTab) === next;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });

    processPanels.forEach((el) => {
      const active = Number(el.dataset.processPanel) === next;
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    shownProcessIndex = next;

    if (skipMotion && processTrack) {
      void processTrack.offsetWidth;
      processTrack.classList.remove('is-instant');
    }
  }

  function stepProcess(delta) {
    showProcessStep(shownProcessIndex + delta);
  }

  processTabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.stopPropagation();
      showProcessStep(tab.dataset.processTab);
    });
    tab.addEventListener('keydown', (e) => {
      const index = processTabs.indexOf(tab);
      if (index < 0) return;

      let nextIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = Math.min(processCount - 1, index + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = Math.max(0, index - 1);
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = processCount - 1;
      }
      if (nextIndex < 0 || nextIndex === index) return;

      e.preventDefault();
      processTabs[nextIndex].focus();
      showProcessStep(nextIndex);
    });
  });

  function processItemFromPoint(x, y) {
    const node = document.elementFromPoint(x, y);
    return node?.closest('[data-process-step]') || null;
  }

  processItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      if (processDragging) {
        event.preventDefault();
        return;
      }
      showProcessStep(item.dataset.processStep);
    });
  });

  if (processViewport && processTrack) {
    processViewport.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      processPointerId = e.pointerId;
      processDragStartX = e.clientX;
      processDragDelta = 0;
      processDragging = false;
    });

    processViewport.addEventListener('pointermove', (e) => {
      if (processPointerId !== e.pointerId) return;
      processDragDelta = e.clientX - processDragStartX;
      if (Math.abs(processDragDelta) < 10) return;
      if (!processDragging) {
        processDragging = true;
        processViewport.setPointerCapture(e.pointerId);
        processTrack.classList.add('is-dragging');
        processViewport.classList.add('is-dragging');
      }
      processTrack.style.setProperty('--process-drag', `${processDragDelta}px`);
    });

    function endProcessDrag(e) {
      if (processPointerId !== e.pointerId) return;
      const wasDragging = processDragging;
      const clientX = e.clientX;
      const clientY = e.clientY;
      processPointerId = null;
      processTrack.classList.remove('is-dragging');
      processViewport.classList.remove('is-dragging');

      if (wasDragging) {
        const threshold = Math.min(88, (processViewport.clientWidth || 320) * 0.16);
        if (processDragDelta <= -threshold) {
          stepProcess(1);
        } else if (processDragDelta >= threshold) {
          stepProcess(-1);
        } else {
          processTrack.style.setProperty('--process-drag', '0px');
        }
        window.setTimeout(() => {
          processDragging = false;
        }, 50);
        return;
      }

      processTrack.style.setProperty('--process-drag', '0px');
      const item = e.target.closest?.('[data-process-step]') || processItemFromPoint(clientX, clientY);
      if (item) showProcessStep(item.dataset.processStep);
    }

    processViewport.addEventListener('pointerup', endProcessDrag);
    processViewport.addEventListener('pointercancel', endProcessDrag);

    processViewport.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = Date.now();
      if (now - processWheelLock < 420) return;
      if (Math.abs(e.deltaX) < 12) return;
      processWheelLock = now;
      stepProcess(e.deltaX > 0 ? 1 : -1);
    }, { passive: false });
  }

  if (processSection) {
    processSection.addEventListener('keydown', (e) => {
      if (e.target.closest('.orla-case__process-marker')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepProcess(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepProcess(-1);
      }
    });
  }

  showProcessStep(0, { instant: true });
})();
