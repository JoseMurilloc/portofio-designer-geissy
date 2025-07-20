const slides = document.querySelectorAll('.slide');
const header = document.querySelectorAll('.header')[0];


function isMobileUserAgent() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Scroll handler: Slides
 */
window.addEventListener('scroll', function () {
  const PAGE_HEIGHT = window.innerHeight;
  const scrollY = window.scrollY;

  if (isMobileUserAgent()) {
    if (scrollY > 0) {
      header.style.top = 0;
    } else {
      header.style.top = `10px`;
    }
    
    return;
  }

  if (scrollY < PAGE_HEIGHT) {
    currentSectionIndex = 0; 
  } else if (scrollY < 2 * PAGE_HEIGHT) {
    currentSectionIndex = 1; 
  } else {
    currentSectionIndex = 2; 
  }

  slides.forEach((slide) => {
    slide.style.scale = '1';
  });

  const section = slides[currentSectionIndex];
  const sectionTop = currentSectionIndex * PAGE_HEIGHT;
  const sectionScroll = Math.max(0, scrollY - sectionTop);

  let scale = 1 - ((sectionScroll / PAGE_HEIGHT) * 0.1);

  scale = Math.max(scale, 0.9);

  section.style.scale = scale;

  if (scrollY > 0) {
    header.style.top = 0;
  } else {
    header.style.top = `10px`;
  }
})

/**
 * Scroll handler: Icons menu
 */
window.addEventListener('scroll', function () {
  const PAGE_HEIGHT = window.innerHeight;
  const scrollY = window.scrollY;

  const icons = ['menu-home-icon', 'menu-projects-icon', 'menu-about-icon']

  const selectIconID = (() => {
    if (scrollY < PAGE_HEIGHT) {
      return 'menu-home-icon'
    }

    if (scrollY < PAGE_HEIGHT * 2) {
      return 'menu-projects-icon'
    } 

    return 'menu-about-icon'
  })()
  
  
  icons.forEach(icon => {
    const current = document.getElementById(icon);
    
    current.style.fill = current.id === selectIconID ? '#7157CF' : '#9C9C9C';
  })
});

function removeSlides() {
  const slides = document.getElementsByClassName('slide');

  if (window.innerWidth >= 800 ) {
    return;
  }
  
  const parseArray = [...slides];

  parseArray.forEach(slideSection => {
    slideSection.classList.remove('slide');
  });
}


removeSlides();