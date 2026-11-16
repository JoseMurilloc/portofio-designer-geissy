/*
 * IT Forum case · Mobile version: the prev/next buttons scroll the phone row
 * by one screen and disable themselves at either end.
 */
(function initItforumMobile() {
  const root = document.querySelector('[data-itf-mobile]');
  if (!root) return;
  const track = root.querySelector('[data-itf-mobile-track]');
  const prev = root.querySelector('[data-itf-mobile-prev]');
  const next = root.querySelector('[data-itf-mobile-next]');
  if (!track || !prev || !next) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function step() {
    const items = track.querySelectorAll('.itf-phone');
    if (items.length < 2) return track.clientWidth;
    return items[1].offsetLeft - items[0].offsetLeft;
  }

  function sync() {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }

  function go(dir) {
    track.scrollBy({ left: dir * step(), behavior: reduce.matches ? 'auto' : 'smooth' });
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  new MutationObserver(sync).observe(document.getElementById('itforum-case') || document.body, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
