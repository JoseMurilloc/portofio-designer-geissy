(function initExperienceHorizontalScroll() {
  const el = document.getElementById('experience-scroll');
  if (!el) return;

  const DRAG_THRESHOLD_PX = 5;
  const AXIS_LOCK_THRESHOLD_PX = 8;

  let activePointerId = null;
  let activePointerType = '';
  let originClientX = 0;
  let originClientY = 0;
  let originScrollLeft = 0;
  let frozen = false;
  let verticalIntent = false;
  let moved = false;
  let suppressClick = false;
  let rafId = 0;
  let pendingClientX = 0;

  if (!window.matchMedia('(max-width: 56.25rem)').matches) {
    el.style.touchAction = 'none';
  }

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

  function isInteractiveScrollTarget(target) {
    if (!target || typeof target.closest !== 'function') return false;
    return Boolean(
      target.closest(
        'a[href], button, input, textarea, select, [role="button"], [role="link"]'
      )
    );
  }

  function removeDocumentListeners() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerCancel);
  }

  function clearActivePointer() {
    activePointerId = null;
    activePointerType = '';
    frozen = false;
    verticalIntent = false;
    moved = false;
    document.body.style.userSelect = '';
    el.classList.remove('experience-scroll--grabbing');
    removeDocumentListeners();
  }

  function endDrag(clientX) {
    if (activePointerId == null) return;

    const pid = activePointerId;
    const pointerType = activePointerType;
    const wasFrozen = frozen;
    const didDrag = wasFrozen && moved;

    if (wasFrozen) {
      flushMove(typeof clientX === 'number' ? clientX : pendingClientX);
      if (pointerType === 'touch') {
        try {
          el.releasePointerCapture(pid);
        } catch (_) {
          /* ignore */
        }
      }
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    clearActivePointer();

    if (didDrag) {
      suppressClick = true;
    }
  }

  function lockHorizontalDrag(pointerId, clientX) {
    frozen = true;
    moved = true;
    originClientX = clientX;
    originScrollLeft = el.scrollLeft;
    el.classList.add('experience-scroll--grabbing');
    document.body.style.userSelect = 'none';

    if (activePointerType === 'touch') {
      try {
        el.setPointerCapture(pointerId);
      } catch (_) {
        /* ignore */
      }
    }
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (isInteractiveScrollTarget(e.target)) return;
    if (activePointerId != null) return;

    activePointerId = e.pointerId;
    activePointerType = e.pointerType || '';
    originClientX = e.clientX;
    originClientY = e.clientY;
    originScrollLeft = el.scrollLeft;
    frozen = false;
    verticalIntent = false;
    moved = false;

    if (activePointerType !== 'touch') {
      document.body.style.userSelect = 'none';
    }

    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('pointercancel', onPointerCancel, { passive: true });
  }

  function onPointerMove(e) {
    if (e.pointerId !== activePointerId || verticalIntent) return;

    const dx = e.clientX - originClientX;
    const dy = e.clientY - originClientY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (!frozen) {
      if (activePointerType === 'touch') {
        if (absDy > AXIS_LOCK_THRESHOLD_PX && absDy >= absDx) {
          verticalIntent = true;
          clearActivePointer();
          return;
        }

        if (absDx <= AXIS_LOCK_THRESHOLD_PX || absDx <= absDy) return;

        lockHorizontalDrag(e.pointerId, e.clientX);
      } else if (absDx > DRAG_THRESHOLD_PX) {
        lockHorizontalDrag(e.pointerId, e.clientX);
      } else {
        return;
      }
    }

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
})();
