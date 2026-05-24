(function initAboutVideoModal() {
  const openBtn = document.getElementById('about-video-open');
  const modal = document.getElementById('about-video-modal');
  const video = document.getElementById('about-intro-video');
  const dialog = modal?.querySelector('.about-video-modal__dialog');
  if (!openBtn || !modal || !video || !dialog) return;

  const closeTriggers = modal.querySelectorAll('[data-about-video-close]');
  const ANIMATION_MS = 300;
  let lastFocused = null;
  let isClosing = false;

  function openModal() {
    if (modal.classList.contains('is-open')) return;

    lastFocused = document.activeElement;
    isClosing = false;
    modal.hidden = false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        modal.classList.add('is-open');
      });
    });

    document.body.classList.add('about-video-modal-open');
    window.setTimeout(() => {
      modal.querySelector('.about-video-modal__close')?.focus();
    }, ANIMATION_MS);
  }

  function finishClose() {
    isClosing = false;
    modal.hidden = true;
    document.body.classList.remove('about-video-modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function closeModal() {
    if (!modal.classList.contains('is-open') || isClosing) return;

    isClosing = true;
    video.pause();
    modal.classList.remove('is-open');

    let closed = false;

    function onTransitionEnd(e) {
      if (e.target !== dialog) return;
      if (closed) return;
      closed = true;
      dialog.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    }

    dialog.addEventListener('transitionend', onTransitionEnd);
    window.setTimeout(() => {
      if (!closed) {
        closed = true;
        dialog.removeEventListener('transitionend', onTransitionEnd);
        finishClose();
      }
    }, ANIMATION_MS + 50);
  }

  openBtn.addEventListener('click', openModal);

  closeTriggers.forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
