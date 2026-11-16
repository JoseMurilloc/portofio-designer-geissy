/*
 * Subtle pointer parallax for project-card mockups.
 * Writes the pointer position over the card (-1…1) into --mx / --my on the
 * [data-mockup-parallax] element; the CSS turns that into small offsets for
 * each phone layer. Skipped on touch screens and with reduced motion.
 */
(function initMockupParallax() {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-mockup-parallax]').forEach((media) => {
    const card = media.closest('a, article, section') || media;
    let frame = 0;
    let next = null;

    const apply = () => {
      frame = 0;
      if (!next) return;
      media.style.setProperty('--mx', next.x.toFixed(3));
      media.style.setProperty('--my', next.y.toFixed(3));
    };

    card.addEventListener('pointermove', (e) => {
      if (!canHover.matches || reduceMotion.matches) return;
      const r = card.getBoundingClientRect();
      next = {
        x: Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)),
        y: Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)),
      };
      if (!frame) frame = requestAnimationFrame(apply);
    });

    card.addEventListener('pointerleave', () => {
      next = { x: 0, y: 0 };
      if (!frame) frame = requestAnimationFrame(apply);
    });
  });
})();
