(function initProjectsFilter() {
  const showcase = document.querySelector('.projects-showcase');
  const filterRoot = document.querySelector('.projects-filter');
  const buttons = document.querySelectorAll('.projects-filter-btn');
  const heading = document.getElementById('projects-section-heading');
  if (!showcase || !filterRoot || !buttons.length) return;

  const headingKeys = {
    all: 'projects_heading_all',
    web: 'projects_heading_web',
    mobile: 'projects_heading_mobile',
  };

  function getCards() {
    return showcase.querySelectorAll('.project-card');
  }

  function getScroll() {
    return showcase.querySelector('.projects-pool--active .projects-scroll');
  }

  function getLang() {
    return localStorage.getItem('SELECT_LANG') || 'en';
  }

  function updateHeading(filter) {
    if (!heading) return;

    const key = headingKeys[filter] || headingKeys.all;
    heading.setAttribute('data-i18n', key);
    heading.textContent = translations[getLang()]?.[key] || translations.en[key] || key;
  }

  function setFilter(filter) {
    buttons.forEach((btn) => {
      const active = btn.getAttribute('data-projects-filter') === filter;
      btn.classList.toggle('projects-filter-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    showcase.setAttribute('data-projects-filter-active', filter);
    updateHeading(filter);

    getCards().forEach((card) => {
      const platforms = (card.getAttribute('data-project-platform') || '').split(/\s+/);

      if (filter === 'all') {
        card.hidden = false;
        return;
      }

      card.hidden = !platforms.includes(filter);
    });

    const scroll = getScroll();
    if (scroll) {
      scroll.classList.add('projects-scroll--spotlight');
      scroll.scrollLeft = 0;
      scroll.scrollTop = 0;
    }

    showcase.dispatchEvent(
      new CustomEvent('projects-filter-change', { detail: { filter } })
    );
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setFilter(btn.getAttribute('data-projects-filter'));
    });
  });

  setFilter('all');
})();
