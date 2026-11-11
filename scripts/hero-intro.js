(function initHeroIntro() {
  const root = document.documentElement;
  const ARMED = 'hero-intro-armed';
  const PLAYING = 'hero-intro-playing';
  const ANIMATION_NAME = 'heroIntroRise';

  /* Sem o gate armado no <head> não há nada para revelar. */
  if (!root.classList.contains(ARMED)) return;

  const hero = document.querySelector('[data-hero-intro]');
  const lastTarget = hero && hero.querySelector('.projects-pools');
  const reduceMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Teto de espera: a seção nunca fica presa esperando fonte ou imagem lenta. */
  const READY_TIMEOUT = 1200;
  const IMAGE_TIMEOUT = 900;
  const SETTLE_TIMEOUT = 1600;

  let released = false;

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function waitForDom() {
    if (document.readyState !== 'loading') return Promise.resolve();

    return new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    });
  }

  function waitForFonts() {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();

    return document.fonts.ready.catch(() => {});
  }

  function waitForHeroImages() {
    if (!hero) return Promise.resolve();

    const pending = [...hero.querySelectorAll('img')].filter(
      (image) => image.loading !== 'lazy' && !image.complete
    );

    if (!pending.length) return Promise.resolve();

    const settled = pending.map((image) =>
      Promise.race([
        new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        }),
        delay(IMAGE_TIMEOUT),
      ])
    );

    return Promise.all(settled);
  }

  function settle() {
    root.classList.remove(PLAYING);
  }

  function onIntroEnd(event) {
    if (event.target !== lastTarget || event.animationName !== ANIMATION_NAME) return;

    lastTarget.removeEventListener('animationend', onIntroEnd);
    settle();
  }

  function release() {
    if (released) return;
    released = true;

    /* Reload no meio da página ou movimento reduzido: revela sem animar. */
    if (!hero || reduceMotionMq.matches || window.scrollY > 4) {
      root.classList.remove(ARMED);
      return;
    }

    /* Mesma mutação de classes: o primeiro quadro visível já é o da animação. */
    root.classList.add(PLAYING);
    root.classList.remove(ARMED);

    if (lastTarget) {
      lastTarget.addEventListener('animationend', onIntroEnd);
    }

    window.setTimeout(settle, SETTLE_TIMEOUT);
  }

  Promise.race([
    waitForDom().then(() => Promise.all([waitForFonts(), waitForHeroImages()])),
    delay(READY_TIMEOUT),
  ]).then(() => {
    /* Dois quadros: altura do pin e do stage já aplicadas antes de revelar. */
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(release);
    });
  });

  window.setTimeout(release, READY_TIMEOUT + 600);
})();
