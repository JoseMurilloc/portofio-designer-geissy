(function initItforumMagnify() {
  const panel = document.getElementById('itforum-case');
  if (!panel) return;

  const frames = panel.querySelectorAll('.itforum-case__legacy-frame, .itforum-case__new-portal-frame');
  if (!frames.length) return;

  const reduceMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineHoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const DURATION = 560;

  const overlay = document.createElement('div');
  overlay.className = 'itforum-magnify';
  overlay.hidden = true;
  overlay.innerHTML = '<div class="itforum-magnify__backdrop"></div><img class="itforum-magnify__img" alt="" />';
  panel.appendChild(overlay);

  const img = overlay.querySelector('.itforum-magnify__img');
  let activeFrame = null;
  let closeTimer = 0;
  let animating = false;

  function duration() {
    return reduceMotionMq.matches ? 0 : DURATION;
  }

  function frameRect(frame) {
    return frame.getBoundingClientRect();
  }

  function targetRect(naturalW, naturalH) {
    const topBar = 80;
    const maxW = window.innerWidth * 0.92;
    const maxH = (window.innerHeight - topBar) * 0.92;
    const ratio = naturalW / naturalH;
    let width = maxW;
    let height = width / ratio;
    if (height > maxH) {
      height = maxH;
      width = height * ratio;
    }
    return {
      left: (window.innerWidth - width) / 2,
      top: topBar + (window.innerHeight - topBar - height) / 2,
      width,
      height,
    };
  }

  function applyTransform(rect, scaleX, scaleY, withTransition) {
    img.style.transition = withTransition
      ? `transform ${duration()}ms ${EASE}, border-radius ${duration()}ms ${EASE}`
      : 'none';
    img.style.width = `${rect.width}px`;
    img.style.height = `${rect.height}px`;
    img.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${scaleX}, ${scaleY})`;
  }

  function openFrom(frame) {
    const thumb = frame.querySelector('img');
    if (!thumb) return;
    if (activeFrame === frame && overlay.classList.contains('is-open')) return;

    window.clearTimeout(closeTimer);
    const first = frameRect(frame);
    const naturalW = thumb.naturalWidth || first.width;
    const naturalH = thumb.naturalHeight || first.height;
    const last = targetRect(naturalW, naturalH);
    const scaleX = first.width / last.width;
    const scaleY = first.height / last.height;

    if (activeFrame && activeFrame !== frame) {
      activeFrame.classList.remove('is-magnified');
    }

    activeFrame = frame;
    frame.classList.add('is-magnified');
    img.src = thumb.currentSrc || thumb.src;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');

    img.style.transformOrigin = 'top left';
    applyTransform(
      { left: first.left, top: first.top, width: last.width, height: last.height },
      scaleX,
      scaleY,
      false
    );
    img.style.borderRadius = getComputedStyle(frame).borderRadius;
    overlay.classList.add('is-open');
    void img.offsetWidth;
    applyTransform(last, 1, 1, true);
    img.style.borderRadius = '1.15rem';

    animating = true;
    window.setTimeout(() => {
      animating = false;
    }, duration());
  }

  function close() {
    if (!activeFrame) return;
    window.clearTimeout(closeTimer);

    const frame = activeFrame;
    const first = frameRect(frame);
    const lastW = parseFloat(img.style.width) || img.getBoundingClientRect().width;
    const lastH = parseFloat(img.style.height) || img.getBoundingClientRect().height;
    const scaleX = first.width / lastW;
    const scaleY = first.height / lastH;

    overlay.classList.remove('is-open');
    applyTransform(
      { left: first.left, top: first.top, width: lastW, height: lastH },
      scaleX,
      scaleY,
      true
    );
    img.style.borderRadius = getComputedStyle(frame).borderRadius;

    const wait = duration();
    window.setTimeout(() => {
      if (activeFrame !== frame) return;
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      img.removeAttribute('src');
      frame.classList.remove('is-magnified');
      activeFrame = null;
    }, wait);
  }

  function scheduleClose() {
    if (!activeFrame || animating) return;
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(close, 160);
  }

  function pointerOverKeepAlive(x, y) {
    if (activeFrame) {
      const r = frameRect(activeFrame);
      const pad = 12;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) {
        return true;
      }
    }
    const imgBox = img.getBoundingClientRect();
    const pad = 28;
    return (
      x >= imgBox.left - pad &&
      x <= imgBox.right + pad &&
      y >= imgBox.top - pad &&
      y <= imgBox.bottom + pad
    );
  }

  frames.forEach((frame) => {
    frame.addEventListener('mouseenter', () => {
      if (!fineHoverMq.matches) return;
      openFrom(frame);
    });

    frame.addEventListener('click', (event) => {
      if (fineHoverMq.matches) return;
      event.preventDefault();
      if (activeFrame === frame) close();
      else openFrom(frame);
    });
  });

  overlay.addEventListener('mousemove', (event) => {
    if (!activeFrame) return;
    overlay.style.pointerEvents = 'none';
    const under = document.elementFromPoint(event.clientX, event.clientY);
    overlay.style.pointerEvents = '';
    const frame = under?.closest?.('.itforum-case__legacy-frame, .itforum-case__new-portal-frame');
    if (frame && frame !== activeFrame) {
      openFrom(frame);
      return;
    }
    if (pointerOverKeepAlive(event.clientX, event.clientY)) {
      window.clearTimeout(closeTimer);
      return;
    }
    scheduleClose();
  });

  overlay.addEventListener('mouseleave', scheduleClose);
  overlay.addEventListener('click', close);

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape' || !activeFrame) return;
      event.stopPropagation();
      close();
    },
    true
  );

  document.addEventListener('itforum-case-close', close);
})();
