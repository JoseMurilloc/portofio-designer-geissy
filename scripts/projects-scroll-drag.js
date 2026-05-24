(function initProjectsScrollDrag() {
  if (window.matchMedia('(max-width: 48rem)').matches) return;

  const strips = document.querySelectorAll('.projects-pools .projects-scroll');
  if (!strips.length) return;

  strips.forEach((el) => {
    const DRAG_THRESHOLD_PX = 5;

    let activePointerId = null;
    let originClientX = 0;
    let originScrollLeft = 0;
    let frozen = false;
    let moved = false;
    let suppressClick = false;
    let rafId = 0;
    let pendingClientX = 0;

    el.style.touchAction = 'none';

    function maxScrollLeft() {
      return Math.max(0, el.scrollWidth - el.clientWidth);
    }

    function applyScrollFromPointer(clientX) {
      const dx = clientX - originClientX;
      let next = originScrollLeft - dx;
      next = Math.max(0, Math.min(maxScrollLeft(), next));
      el.scrollLeft = next;
    }

    function scheduleMove(clientX) {
      pendingClientX = clientX;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        applyScrollFromPointer(pendingClientX);
      });
    }

    function flushMove(clientX) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (typeof clientX === 'number') {
        applyScrollFromPointer(clientX);
      }
    }

    function endDrag(clientX) {
      if (activePointerId == null) return;

      const wasFrozen = frozen;
      const didDrag = wasFrozen && moved;

      if (wasFrozen) {
        flushMove(typeof clientX === 'number' ? clientX : pendingClientX);
        try {
          el.releasePointerCapture(activePointerId);
        } catch (_) {
          /* ignore */
        }
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }

      activePointerId = null;
      frozen = false;
      moved = false;
      document.body.style.userSelect = '';
      el.classList.remove('projects-scroll--grabbing');

      if (didDrag) {
        suppressClick = true;
      }
    }

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;

      activePointerId = e.pointerId;
      originClientX = e.clientX;
      originScrollLeft = el.scrollLeft;
      frozen = false;
      moved = false;

      /*
       * Não chamar setPointerCapture no down: isso rouba o gesto dos <a> dentro da faixa
       * e o clique deixa de abrir o link. Só capturamos após movimento > threshold (arraste).
       */
      document.body.style.userSelect = 'none';
    }

    function onPointerMove(e) {
      if (e.pointerId !== activePointerId) return;

      const dx = e.clientX - originClientX;

      if (!frozen && Math.abs(dx) > DRAG_THRESHOLD_PX) {
        frozen = true;
        moved = true;
        originClientX = e.clientX;
        originScrollLeft = el.scrollLeft;
        el.classList.add('projects-scroll--grabbing');
        try {
          el.setPointerCapture(e.pointerId);
        } catch (_) {
          /* ignore */
        }
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

    el.addEventListener('pointerdown', onPointerDown, { passive: true });
    el.addEventListener('pointermove', onPointerMove, { passive: false });
    el.addEventListener('pointerup', onPointerUp, { passive: true });
    el.addEventListener('pointercancel', onPointerCancel, { passive: true });
    el.addEventListener('lostpointercapture', onPointerCancel, { passive: true });

    el.addEventListener(
      'click',
      (e) => {
        if (!suppressClick) return;
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      },
      true
    );

    el.addEventListener('dragstart', (e) => e.preventDefault());
  });
})();
