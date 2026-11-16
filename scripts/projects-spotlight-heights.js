(function initProjectSpotlightHeights() {
  const showcase = document.querySelector('.projects-showcase');
  if (!showcase) return;

  const desktopMq = window.matchMedia('(min-width: 48.0625rem)');

  function getCards() {
    const scroll = showcase.querySelector('.projects-pool--active .projects-scroll');
    if (!scroll) return null;

    return {
      scroll,
      orla: scroll.querySelector('.project-spotlight--orla')?.closest('.project-card--spotlight'),
      itforum: scroll.querySelector('.project-spotlight--itforum')?.closest('.project-card--spotlight'),
      fluency: scroll.querySelector('.project-spotlight--fluency')?.closest('.project-card--spotlight'),
      bbee: scroll.querySelector('.project-spotlight--bbee')?.closest('.project-card--spotlight'),
    };
  }

  function resetSyncedCards(fluency, bbee) {
    [fluency, bbee].forEach((card) => {
      if (!card) return;
      card.style.height = '';
      card.style.minHeight = '';
      card.style.maxHeight = '';
      card.removeAttribute('data-row-height-sync');

      const bottom = card.querySelector('.project-spotlight-bottom');
      if (bottom) {
        bottom.style.height = '';
        bottom.style.flex = '';
      }
    });
  }

  function sync() {
    const cards = getCards();
    if (!cards?.fluency || !cards?.bbee) return;

    resetSyncedCards(cards.fluency, cards.bbee);

    if (!desktopMq.matches || cards.fluency.hidden || cards.bbee.hidden || !cards.orla || !cards.itforum) {
      cards.scroll.style.removeProperty('--spotlight-ref-visual-height');
      return;
    }

    const orlaVisual = cards.orla.querySelector('.project-spotlight-visual');
    if (!orlaVisual) return;

    const height = `${cards.orla.offsetHeight}px`;
    const visualHeight = `${orlaVisual.offsetHeight}px`;

    cards.scroll.style.setProperty('--spotlight-ref-visual-height', visualHeight);

    [cards.fluency, cards.bbee].forEach((card) => {
      card.style.height = height;
      card.style.minHeight = height;
      card.style.maxHeight = height;
      card.dataset.rowHeightSync = 'true';

      const bottom = card.querySelector('.project-spotlight-bottom');
      if (bottom) {
        bottom.style.height = '';
        bottom.style.flex = '';
      }
    });
  }

  function scheduleSync() {
    const cards = getCards();
    if (cards?.scroll) {
      cards.scroll.style.removeProperty('--spotlight-ref-visual-height');
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(sync);
    });
  }

  window.addEventListener('load', scheduleSync);
  window.addEventListener('resize', scheduleSync);
  desktopMq.addEventListener('change', scheduleSync);
  showcase.addEventListener('projects-filter-change', scheduleSync);

  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(scheduleSync);
    const cards = getCards();

    if (cards?.orla) observer.observe(cards.orla);
    if (cards?.itforum) observer.observe(cards.itforum);
  }

  scheduleSync();
})();
