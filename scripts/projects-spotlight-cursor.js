(function initProjectSpotlightCursor() {
  const mq = window.matchMedia('(hover: hover) and (pointer: fine)');

  const spotlights = [
    { el: document.querySelector('.project-spotlight--vivo'), activeClass: 'project-spotlight--lock-cursor' },
    { el: document.querySelector('.project-spotlight--bbee'), activeClass: 'project-spotlight--external-cursor' },
    { el: document.querySelector('.project-spotlight--fluency'), activeClass: 'project-spotlight--external-cursor' },
  ].filter((item) => item.el);

  if (!spotlights.length) return;

  spotlights.forEach(({ el, activeClass }) => {
    function onEnter() {
      el.classList.add(activeClass);
    }

    function onLeave() {
      el.classList.remove(activeClass);
    }

    function bind() {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.classList.remove('project-spotlight--lock-cursor', 'project-spotlight--external-cursor');
      if (!mq.matches) return;
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    }

    bind();
    mq.addEventListener('change', bind);
  });
})();
