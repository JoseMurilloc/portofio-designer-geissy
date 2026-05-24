(function initAboutToolsDragScroll() {
  const marquee = document.querySelector('.about-tools-marquee');
  const track = document.querySelector('.about-tools-track');
  if (!marquee || !track) return;

  const DURATION_MS = 48000;
  const DRAG_THRESHOLD_PX = 5;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let activePointerId = null;
  let originClientX = 0;
  let baseTranslateX = 0;
  let frozen = false;
  let moved = false;
  let suppressClick = false;
  let rafId = 0;
  let pendingClientX = 0;

  marquee.style.touchAction = 'none';

  function getTranslateX(el) {
    const t = getComputedStyle(el).transform;
    if (!t || t === 'none') return 0;
    const m = new DOMMatrix(t);
    return m.m41;
  }

  function travelPixels() {
    return track.scrollWidth / 2;
  }

  function syncPointerToTransform(clientX) {
    const next = baseTranslateX + (clientX - originClientX);
    track.style.transform = `translate3d(${next}px, 0, 0)`;
  }

  function scheduleMove(clientX) {
    pendingClientX = clientX;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      syncPointerToTransform(pendingClientX);
    });
  }

  function flushTransform(clientX) {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (typeof clientX === 'number') {
      syncPointerToTransform(clientX);
    }
  }

  function endDrag(clientX) {
    if (activePointerId == null) return;

    const pid = activePointerId;
    const wasFrozen = frozen;

    if (wasFrozen) {
      flushTransform(typeof clientX === 'number' ? clientX : pendingClientX);
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    try {
      marquee.releasePointerCapture(pid);
    } catch (_) {
      /* ignore */
    }

    activePointerId = null;
    frozen = false;
    document.body.style.userSelect = '';

    if (!wasFrozen || !moved) {
      moved = false;
      return;
    }

    const finalTx = getTranslateX(track);

    if (reduceMotion.matches) {
      track.style.animation = 'none';
      track.style.transform = `translate3d(${finalTx}px, 0, 0)`;
      moved = false;
      suppressClick = true;
      return;
    }

    const travel = travelPixels();
    if (travel <= 0) {
      track.style.animation = '';
      track.style.transform = '';
      moved = false;
      return;
    }

    let p = -finalTx / travel;
    p = ((p % 1) + 1) % 1;

    track.style.animation = 'none';
    track.style.transform = '';
    void track.offsetHeight;

    track.style.removeProperty('animation');
    track.style.animationDelay = `-${p * DURATION_MS}ms`;

    moved = false;
    suppressClick = true;
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;

    activePointerId = e.pointerId;
    originClientX = e.clientX;
    baseTranslateX = getTranslateX(track);
    frozen = false;
    moved = false;

    try {
      marquee.setPointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }

    document.body.style.userSelect = 'none';
  }

  function onPointerMove(e) {
    if (e.pointerId !== activePointerId) return;

    const dx = e.clientX - originClientX;

    if (!frozen && Math.abs(dx) > DRAG_THRESHOLD_PX) {
      frozen = true;
      moved = true;
      const currentTx = getTranslateX(track);
      track.style.animation = 'none';
      track.style.transform = `translate3d(${currentTx}px, 0, 0)`;
      originClientX = e.clientX;
      baseTranslateX = currentTx;
    }

    if (!frozen) return;

    e.preventDefault();
    scheduleMove(e.clientX);
  }

  function onPointerUp(e) {
    if (e.pointerId !== activePointerId) return;
    endDrag(e.clientX);
  }

  function onPointerCancel(e) {
    if (e.pointerId !== activePointerId) return;
    const x = typeof e.clientX === 'number' ? e.clientX : pendingClientX;
    endDrag(x);
  }

  marquee.addEventListener('pointerdown', onPointerDown, { passive: true });
  marquee.addEventListener('pointermove', onPointerMove, { passive: false });
  marquee.addEventListener('pointerup', onPointerUp, { passive: true });
  marquee.addEventListener('pointercancel', onPointerCancel, { passive: true });
  marquee.addEventListener('lostpointercapture', onPointerCancel, { passive: true });

  marquee.addEventListener(
    'click',
    (e) => {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    },
    true
  );

  marquee.addEventListener('dragstart', (e) => e.preventDefault());
})();
