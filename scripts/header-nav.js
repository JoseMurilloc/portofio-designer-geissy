/*
 * Navegação do header: rola até a seção e destaca a pílula da seção visível.
 * Se um case (IT Forum / Orla Campo) estiver aberto, fecha antes de rolar.
 */
(function initHeaderNav() {
  const nav = document.querySelector('[data-header-nav]');
  if (!nav) return;

  const links = [...nav.querySelectorAll('[data-nav-target]')];
  const CASE_CLOSE_MS = 850;

  function targetFor(link) {
    const id = link.dataset.navTarget;
    /* "Inicial" aponta para o topo da página. */
    return id === 'home' ? null : document.getElementById(id);
  }

  function setActive(activeLink) {
    links.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function isCaseOpen() {
    return (
      document.body.classList.contains('itforum-case-open') ||
      document.body.classList.contains('orla-case-open') ||
      document.body.classList.contains('bbee-case-open')
    );
  }

  function scrollToLink(link) {
    const target = targetFor(link);
    const top = target ? target.getBoundingClientRect().top + window.scrollY : 0;
    window.scrollTo({ top, left: 0, behavior: 'smooth' });
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setActive(link);

      if (isCaseOpen()) {
        /* Os cases fecham com Escape; espera a animação de saída. */
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        window.setTimeout(() => scrollToLink(link), CASE_CLOSE_MS);
        return;
      }

      scrollToLink(link);
    });
  });

  /* A seção ativa é a última cujo topo já passou de 40% da viewport. */
  let ticking = false;

  function updateActiveFromScroll() {
    ticking = false;
    if (isCaseOpen()) return;

    const line = window.innerHeight * 0.4;
    let current = links[0];

    links.forEach((link) => {
      const target = targetFor(link);
      if (target && target.getBoundingClientRect().top <= line) {
        current = link;
      }
    });

    setActive(current);
  }

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActiveFromScroll);
    },
    { passive: true }
  );

  window.addEventListener('resize', updateActiveFromScroll);
  updateActiveFromScroll();
})();
