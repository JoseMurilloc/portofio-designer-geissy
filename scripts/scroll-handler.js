const header = document.querySelectorAll('.header')[0];

function isMobileUserAgent() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Scroll handler: header position
 */
window.addEventListener(
  'scroll',
  function () {
    const scrollY = window.scrollY;

    if (isMobileUserAgent()) {
      if (scrollY > 0) {
        header.style.top = 0;
      } else {
        header.style.top = `10px`;
      }
      return;
    }

    if (scrollY > 0) {
      header.style.top = 0;
    } else {
      header.style.top = `10px`;
    }
  },
  { passive: true }
);

/**
 * Scroll handler: Icons menu
 */
window.addEventListener(
  'scroll',
  function () {
    const PAGE_HEIGHT = window.innerHeight;
    const scrollY = window.scrollY;

    const icons = ['menu-home-icon', 'menu-projects-icon', 'menu-about-icon'];

    const selectIconID = (() => {
      if (scrollY < PAGE_HEIGHT) {
        return 'menu-home-icon';
      }

      if (scrollY < PAGE_HEIGHT * 2) {
        return 'menu-projects-icon';
      }

      return 'menu-about-icon';
    })();

    icons.forEach((icon) => {
      const current = document.getElementById(icon);

      current.style.fill = current.id === selectIconID ? '#7157CF' : '#9C9C9C';
    });
  },
  { passive: true }
);

function removeSlides() {
  const slides = document.getElementsByClassName('slide');

  if (window.innerWidth >= 800) {
    return;
  }

  const parseArray = [...slides];

  parseArray.forEach((slideSection) => {
    slideSection.classList.remove('slide');
  });
}

function initFadeInUpSections() {
  const sections = document.querySelectorAll('.scroll-slides > section');

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  sections.forEach((section) => observer.observe(section));
}

removeSlides();
initFadeInUpSections();
