(function initItforumPortalCarousel() {
  const marquee = document.querySelector('.itforum-case__new-portal-marquee');
  const track = document.querySelector('.itforum-case__new-portal-track');
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

  function getTranslateX(element) {
    const transform = getComputedStyle(element).transform;
    if (!transform || transform === 'none') return 0;
    return new DOMMatrix(transform).m41;
  }

  function syncPointerToTransform(clientX) {
    track.style.transform = `translate3d(${baseTranslateX + clientX - originClientX}px, 0, 0)`;
  }

  function scheduleMove(clientX) {
    pendingClientX = clientX;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      syncPointerToTransform(pendingClientX);
    });
  }

  function endDrag(clientX) {
    if (activePointerId == null) return;

    const pointerId = activePointerId;
    if (frozen) syncPointerToTransform(clientX);
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    try {
      marquee.releasePointerCapture(pointerId);
    } catch (_) {
      /* Ignore browsers without pointer capture support. */
    }

    activePointerId = null;
    document.body.style.userSelect = '';

    if (!frozen || !moved) {
      frozen = false;
      moved = false;
      return;
    }

    const travel = track.scrollWidth / 2;
    const finalTranslateX = getTranslateX(track);
    frozen = false;
    moved = false;
    suppressClick = true;

    if (reduceMotion.matches || travel <= 0) {
      track.style.animation = 'none';
      track.style.transform = `translate3d(${finalTranslateX}px, 0, 0)`;
      return;
    }

    const progress = ((-finalTranslateX / travel) % 1 + 1) % 1;
    track.style.animation = 'none';
    track.style.transform = '';
    void track.offsetHeight;
    track.style.removeProperty('animation');
    track.style.animationDelay = `-${progress * DURATION_MS}ms`;
  }

  marquee.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    activePointerId = event.pointerId;
    originClientX = event.clientX;
    baseTranslateX = getTranslateX(track);
    frozen = false;
    moved = false;
    marquee.setPointerCapture?.(event.pointerId);
    document.body.style.userSelect = 'none';
  });

  marquee.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerId !== activePointerId) return;
      const distance = event.clientX - originClientX;

      if (!frozen && Math.abs(distance) > DRAG_THRESHOLD_PX) {
        frozen = true;
        moved = true;
        const currentTranslateX = getTranslateX(track);
        baseTranslateX = currentTranslateX;
        originClientX = event.clientX;
        track.style.animation = 'none';
        track.style.transform = `translate3d(${currentTranslateX}px, 0, 0)`;
      }

      if (!frozen) return;
      event.preventDefault();
      scheduleMove(event.clientX);
    },
    { passive: false }
  );

  marquee.addEventListener('pointerup', (event) => endDrag(event.clientX));
  marquee.addEventListener('pointercancel', (event) => endDrag(event.clientX || pendingClientX));
  marquee.addEventListener('lostpointercapture', (event) => endDrag(event.clientX || pendingClientX));
  marquee.addEventListener('dragstart', (event) => event.preventDefault());
  marquee.addEventListener(
    'click',
    (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    },
    true
  );
})();
