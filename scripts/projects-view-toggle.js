(function initProjectsViewToggle() {
  const showcase = document.querySelector('.projects-showcase');
  const unified = showcase?.getAttribute('data-projects-unified') === 'true';

  /* Modo unificado: uma única faixa horizontal (mercado + estudo). Código do toggle permanece abaixo para reativar com data-projects-unified="false". */
  if (unified && showcase) {
    const marketPool = showcase.querySelector('[data-projects-pool="market"]');
    const studyPool = showcase.querySelector('[data-projects-pool="study"]');
    const marketScroll = marketPool?.querySelector('.projects-scroll');
    const studyScroll = studyPool?.querySelector('.projects-scroll');
    if (marketScroll && studyScroll) {
      while (studyScroll.firstChild) {
        marketScroll.appendChild(studyScroll.firstChild);
      }
    }
    if (studyPool) {
      studyPool.removeAttribute('inert');
      studyPool.setAttribute('aria-hidden', 'true');
      studyPool.classList.remove('projects-pool--active');
    }
    if (marketPool) {
      marketPool.setAttribute('aria-hidden', 'false');
      marketPool.classList.add('projects-pool--active');
    }
    showcase.classList.add('projects-showcase--unified');
    return;
  }

  const poolsRoot = document.querySelector('.projects-pools');
  const pools = document.querySelectorAll('.projects-pool');
  const toggleRoot = document.querySelector('.projects-view-toggle');
  const buttons = document.querySelectorAll('.projects-view-toggle-btn');
  if (!poolsRoot || !pools.length || !buttons.length || !toggleRoot) return;

  function setView(pool) {
    pools.forEach((poolEl) => {
      const active = poolEl.getAttribute('data-projects-pool') === pool;
      poolEl.classList.toggle('projects-pool--active', active);
      poolEl.setAttribute('aria-hidden', String(!active));
      if (active) {
        poolEl.removeAttribute('inert');
      } else {
        poolEl.setAttribute('inert', '');
      }
      const strip = poolEl.querySelector('.projects-scroll');
      if (strip) strip.scrollLeft = 0;
    });

    toggleRoot.setAttribute('data-active', pool);

    buttons.forEach((btn) => {
      const active = btn.getAttribute('data-projects-view') === pool;
      btn.classList.toggle('projects-view-toggle-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setView(btn.getAttribute('data-projects-view'));
    });
  });

  setView('market');
})();
