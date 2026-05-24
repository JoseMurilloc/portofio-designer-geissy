const hamburger = document.getElementById('menu-hamburger-button');

hamburger.onclick = () => {
  const headerElement = document.querySelector('.header');
  const drawer = document.getElementById("drawer-mobile");

  drawer.classList.toggle("change");
  headerElement.classList.toggle('no-blur-header');
  document.body.classList.toggle('no-scroll');
  
};

(function initAboutPhotoFlip() {
  const cards = document.querySelectorAll('.about-photo-card');
  if (!cards.length) return;

  const coarsePointer = window.matchMedia('(hover: none)');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (coarsePointer.matches) {
        card.classList.toggle('is-flipped');
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      card.classList.toggle('is-flipped');
    });
  });
})();

(function initAboutLearnMore() {
  const btn = document.getElementById('about-learn-more');
  const panel = document.getElementById('about-copy-expanded');
  if (!btn || !panel) return;

  function syncAboutLearnMoreButton(lang) {
    const span = btn.querySelector('.about-button-label');
    if (!span || typeof translations === 'undefined') return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const key = expanded ? 'about_me_button_less' : 'about_me_button';
    const l = lang || localStorage.getItem('SELECT_LANG') || 'en';
    span.textContent = translations[l][key] || '';
  }

  window.syncAboutLearnMoreButton = syncAboutLearnMoreButton;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    const next = !open;
    btn.setAttribute('aria-expanded', String(next));
    panel.classList.toggle('is-expanded', next);
    panel.setAttribute('aria-hidden', String(!next));
    syncAboutLearnMoreButton(localStorage.getItem('SELECT_LANG') || 'en');
  });
})();