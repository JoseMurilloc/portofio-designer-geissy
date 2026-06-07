const header = document.querySelector('.header');
const siteFooter = document.querySelector('.site-footer');

function isMobileUserAgent() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

let headerIsHidden = false;
let headerIsAnimating = false;

function setHeaderHidden(isHidden) {
  if (!header || isHidden === headerIsHidden || headerIsAnimating) return;

  headerIsHidden = isHidden;
  headerIsAnimating = true;

  header.classList.remove('header--hide', 'header--show');

  void header.offsetWidth;

  if (isHidden) {
    header.classList.remove('header--is-hidden');
    header.classList.add('header--hide');
  } else {
    header.style.visibility = 'visible';
    header.classList.add('header--show');
  }

  header.addEventListener(
    'animationend',
    (event) => {
      if (event.target !== header) return;

      header.classList.remove('header--hide', 'header--show');
      headerIsAnimating = false;

      if (headerIsHidden) {
        header.classList.add('header--is-hidden');
      } else {
        header.classList.remove('header--is-hidden');
        header.style.visibility = '';
      }
    },
    { once: true }
  );
}

let lastScrollY = window.scrollY;

function isFooterInViewport() {
  if (!siteFooter) return false;

  const footerTop = siteFooter.getBoundingClientRect().top;

  return footerTop <= window.innerHeight;
}

function updateHeaderVisibilityOnScroll() {
  if (!header || !siteFooter) return;

  const scrollY = window.scrollY;
  const isScrollingUp = scrollY < lastScrollY;
  const footerReached = isFooterInViewport();

  if (footerReached && !isScrollingUp) {
    setHeaderHidden(true);
  } else if (headerIsHidden || header.classList.contains('header--is-hidden')) {
    setHeaderHidden(false);
  }

  lastScrollY = scrollY;
}

/**
 * Scroll handler: header position
 */
window.addEventListener(
  'scroll',
  function () {
    const scrollY = window.scrollY;

    updateHeaderVisibilityOnScroll();

    if (!header) return;

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

updateHeaderVisibilityOnScroll();

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

const backToTopLink = document.getElementById('back-to-top');

if (backToTopLink) {
  backToTopLink.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
