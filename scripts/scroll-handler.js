const slides = document.querySelectorAll('.slide');
const header = document.querySelectorAll('.header')[0];

window.addEventListener('scroll', function () {
  const PAGE_HEIGHT = window.innerHeight;
  const scrollY = window.scrollY;

  let currentSectionIndex = 0;

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