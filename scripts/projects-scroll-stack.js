(function initProjectsScrollStack() {
  const pin = document.querySelector('[data-scroll-stack-pin]');
  const sticky = pin?.querySelector('.projects-stack-sticky');
  const stack = document.querySelector('.projects-scroll[data-scroll-stack]');
  if (!pin || !sticky || !stack) return;

  const desktopMq = window.matchMedia('(min-width: 48.0625rem)');
  const reduceMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Distância de scroll por card adicional (fração da viewport). */
  const SCROLL_PER_CARD = 1.05;
  /* Espaço extra após o último card antes de liberar a próxima seção. */
  const HOLD_AFTER_STACK = 0.55;
  /* Escala mínima do primeiro card quando empurrado para trás. */
  const BASE_SCALE = 0.9;
  /* Incremento de escala por índice na pilha. */
  const ITEM_SCALE = 0.03;
  /* Offset vertical entre cards empilhados (px). */
  const ITEM_STACK_DISTANCE = 28;

  let cards = [];
  let frameId = 0;
  let metrics = null;
  let measuring = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function getCards() {
    return [...stack.querySelectorAll(':scope > .project-card--spotlight-full')].filter(
      (card) => !card.hidden
    );
  }

  function pageY(element) {
    return element.getBoundingClientRect().top + window.scrollY;
  }

  function clearCardStyles(card) {
    card.style.removeProperty('transform');
    card.style.removeProperty('z-index');
    card.style.removeProperty('pointer-events');
    card.classList.remove('scroll-stack-card--active');
  }

  function releaseToCssInitial() {
    /*
     * Progresso 0: CSS já define a posição inicial.
     * Não escrever inline transform — evita qualquer jump no load.
     */
    cards.forEach((card, index) => {
      card.style.removeProperty('transform');
      card.style.zIndex = String(index + 1);
      card.style.pointerEvents = index === 0 ? 'auto' : 'none';
      card.classList.toggle('scroll-stack-card--active', index === 0);
    });
  }

  function disable() {
    cards.forEach(clearCardStyles);
    pin.style.removeProperty('height');
    stack.style.removeProperty('--scroll-stack-stage-height');
    pin.classList.remove('projects-stack-pin--active');
    stack.classList.remove('projects-scroll--stack-active');
    metrics = null;
  }

  function measure() {
    if (measuring) return metrics;
    measuring = true;

    cards = getCards();

    if (!desktopMq.matches || reduceMotionMq.matches || cards.length < 2) {
      disable();
      measuring = false;
      return null;
    }

    pin.classList.add('projects-stack-pin--active');
    stack.classList.add('projects-scroll--stack-active');

    /*
     * Não limpa transforms aqui. offsetHeight não depende de transform,
     * e limpar causava o 2º card “nascer” no topo antes do JS reposicionar.
     */
    const viewportHeight = window.innerHeight;
    const cardHeights = cards.map((card) => card.offsetHeight);
    const maxCardHeight = Math.max(...cardHeights, 0);
    const stageHeight = Math.ceil(maxCardHeight + ITEM_STACK_DISTANCE * (cards.length - 1));

    stack.style.setProperty('--scroll-stack-stage-height', `${stageHeight}px`);

    const stickyHeight = Math.max(sticky.offsetHeight, viewportHeight);
    const steps = cards.length - 1;
    const scrollPerCard = Math.round(viewportHeight * SCROLL_PER_CARD);
    const holdSpace = Math.round(viewportHeight * HOLD_AFTER_STACK);
    const trackHeight = stickyHeight + steps * scrollPerCard + holdSpace;

    pin.style.height = `${trackHeight}px`;

    measuring = false;

    return {
      pinTop: pageY(pin),
      trackHeight,
      stickyHeight,
      viewportHeight,
      scrollPerCard,
      steps,
      stageHeight,
    };
  }

  function updateTransforms() {
    if (!metrics || !cards.length) return;

    const { pinTop, scrollPerCard, steps, viewportHeight } = metrics;
    const scrolled = Math.max(0, window.scrollY - pinTop);
    const stackProgress = clamp(scrolled / scrollPerCard, 0, steps);

    /* Antes do primeiro scroll efetivo no stack: só CSS. */
    if (stackProgress <= 0.001) {
      releaseToCssInitial();
      return;
    }

    cards.forEach((card, index) => {
      let translateY;
      /*
       * O card da frente descansa em Y=0, igual ao primeiro.
       * O offset da pilha só empurra os de trás — se o da frente descer,
       * o overflow do sticky corta a base (Orla Campo).
       */
      const stackedY = 0;

      if (index === 0) {
        translateY = 0;
      } else if (stackProgress < index - 1) {
        translateY = viewportHeight;
      } else if (stackProgress < index) {
        const local = easeOutCubic(stackProgress - (index - 1));
        translateY = viewportHeight + (stackedY - viewportHeight) * local;
      } else {
        translateY = stackedY;
      }

      const cardsAbove = Math.max(0, stackProgress - index);
      const scaleProgress = clamp(cardsAbove, 0, 1);
      const targetScale = BASE_SCALE + index * ITEM_SCALE;
      const scale = 1 - scaleProgress * (1 - targetScale);

      const activeIndex = Math.min(Math.floor(stackProgress + 0.0001), cards.length - 1);
      const isInteractive =
        index === activeIndex || (stackProgress >= steps && index === cards.length - 1);

      card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      card.style.zIndex = String(index + 1);
      card.style.pointerEvents = isInteractive ? 'auto' : 'none';
      card.classList.toggle('scroll-stack-card--active', isInteractive);
    });
  }

  function update() {
    frameId = 0;
    updateTransforms();
  }

  function scheduleUpdate() {
    if (frameId) return;
    frameId = window.requestAnimationFrame(update);
  }

  function refresh() {
    metrics = measure();
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    updateTransforms();
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('load', refresh);
  desktopMq.addEventListener('change', refresh);
  reduceMotionMq.addEventListener('change', refresh);

  document
    .querySelector('.projects-showcase')
    ?.addEventListener('projects-filter-change', refresh);

  if (typeof ResizeObserver !== 'undefined') {
    let resizeTimer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refresh, 80);
    });
    observer.observe(sticky);
  }

  refresh();
})();
