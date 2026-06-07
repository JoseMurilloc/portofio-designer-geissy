(function initProjectsCardReveal() {
  const showcase = document.querySelector('.projects-showcase');
  if (!showcase) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STAGGER_MS = 120;
  const FILTER_RISE_DURATION_MS = 1200;
  const observers = new Map();
  let filterRevealTimeouts = [];

  function getVisibleCards() {
    return [...showcase.querySelectorAll('.project-card')].filter((card) => !card.hidden);
  }

  function disconnectObservers() {
    observers.forEach((observer, card) => {
      observer.disconnect();
      observers.delete(card);
    });
  }

  function clearFilterRevealTimeouts() {
    filterRevealTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    filterRevealTimeouts = [];
  }

  function forceReflow(card) {
    void card.offsetHeight;
  }

  function revealCard(card) {
    card.classList.remove('project-card--reveal-pending');
    card.classList.add('project-card--reveal-visible');
  }

  function cleanupFilterClasses() {
    showcase.classList.remove('projects-showcase--filter-reveal');

    showcase.querySelectorAll('.project-card').forEach((card) => {
      card.classList.remove('project-card--filter-rise', 'project-card--filter-rise-visible');
    });
  }

  function prepareCard(card, index, staggerMs = STAGGER_MS) {
    card.classList.remove('project-card--reveal-visible');
    card.style.setProperty('--reveal-delay', `${index * staggerMs}ms`);

    if (reduceMotion) {
      card.classList.remove('project-card--reveal-pending');
      revealCard(card);
      return;
    }

    card.classList.add('project-card--reveal-pending');
  }

  function playFilterRise(cards) {
    if (!cards.length) return;

    showcase.classList.add('projects-showcase--filter-reveal');

    cards.forEach((card) => {
      card.classList.remove('project-card--reveal-pending', 'project-card--filter-rise-visible');
      card.classList.add('project-card--reveal-visible', 'project-card--filter-rise');
      forceReflow(card);
    });

    if (reduceMotion) {
      cleanupFilterClasses();
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cards.forEach((card) => {
          card.classList.add('project-card--filter-rise-visible');
        });

        filterRevealTimeouts.push(
          window.setTimeout(() => {
            cleanupFilterClasses();
          }, FILTER_RISE_DURATION_MS)
        );
      });
    });
  }

  function animateFilterCards() {
    clearFilterRevealTimeouts();
    disconnectObservers();
    cleanupFilterClasses();

    requestAnimationFrame(() => {
      playFilterRise(getVisibleCards());
    });
  }

  function observeCards() {
    disconnectObservers();
    clearFilterRevealTimeouts();

    const cards = getVisibleCards();
    cards.forEach((card, index) => {
      prepareCard(card, index);

      if (reduceMotion) return;

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            revealCard(entry.target);
            obs.unobserve(entry.target);
            observers.delete(entry.target);
          });
        },
        {
          threshold: 0.18,
          rootMargin: '0px 0px -6% 0px',
        }
      );

      observer.observe(card);
      observers.set(card, observer);
    });
  }

  observeCards();

  showcase.addEventListener('projects-filter-change', animateFilterCards);
})();
