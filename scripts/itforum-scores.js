/*
 * IT Forum case · Results: when the scores scroll into view, each number counts
 * up from the market average to its score while the 0–100 bar fills, and a
 * small "trending up" badge pops in with the gain over the market. Replays
 * every time the case is opened.
 */
(function initItforumScores() {
  const panel = document.getElementById('itforum-case');
  if (!panel) return;
  panel.querySelectorAll('[data-itf-scores]').forEach(setup);
  panel.querySelectorAll('[data-itf-count]').forEach(setupCount);

  function setup(wrap) {

  const scroller = panel.querySelector('.itforum-case__scroll');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...wrap.querySelectorAll('[data-score]')].map((el) => ({
    el,
    num: el.querySelector('strong'),
    bar: el.querySelector('.itf-bar'),
    to: Number(el.dataset.score),
    delay: parseFloat(getComputedStyle(el).getPropertyValue('--d')) * 1000 || 0,
  }));
  let frames = [];
  let observer = null;

  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function setValue(item, v) {
    item.num.textContent = String(Math.round(v));
    item.bar?.style.setProperty('--p', v.toFixed(2));
  }

  function reset() {
    frames.forEach(cancelAnimationFrame);
    frames = [];
    if (reduce.matches) {
      wrap.classList.remove('is-armed', 'is-running');
      items.forEach((it) => setValue(it, it.to));
      return;
    }
    wrap.classList.remove('is-running');
    wrap.classList.add('is-armed');
    items.forEach((it) => {
      it.el.classList.remove('is-climbing', 'is-done');
      setValue(it, 0);
    });
  }

  function run() {
    if (reduce.matches) return;
    wrap.classList.add('is-running');
    const duration = 1600;
    items.forEach((it) => {
      const start = performance.now() + it.delay;
      it.el.classList.add('is-climbing');
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        setValue(it, it.to * ease(t));
        if (t < 1) frames.push(requestAnimationFrame(tick));
        else {
          it.el.classList.remove('is-climbing');
          it.el.classList.add('is-done');
        }
      };
      frames.push(requestAnimationFrame(tick));
    });
  }

  // started once the scores are ~45% inside the case's scroll area
  function inView() {
    const r = wrap.getBoundingClientRect();
    const v = scroller.getBoundingClientRect();
    const shown = Math.min(r.bottom, v.bottom) - Math.max(r.top, v.top);
    return r.height > 0 && shown / r.height >= 0.45;
  }

  let started = false;
  function check() {
    if (started || !panel.classList.contains('is-open') || !inView()) return;
    started = true;
    run();
  }

  function watch() {
    started = false;
    observer?.disconnect();
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(check, { root: scroller, threshold: [0, 0.45, 1] });
      observer.observe(wrap);
    }
    check();
  }

  scroller.addEventListener('scroll', check, { passive: true });

  // arm + watch each time the case opens; reset when it closes
  new MutationObserver(() => {
    if (panel.classList.contains('is-open')) { reset(); watch(); }
    else { observer?.disconnect(); reset(); }
  }).observe(panel, { attributes: true, attributeFilter: ['class'] });

  reset();
  }
  /*
   * Network metrics ("1,1 s", "1.5 MB"): count up from 0 to the value shown,
   * keeping the language's decimal separator and unit. If the language is
   * switched mid-count, the new text becomes the target.
   */
  function setupCount(wrap) {
    const scroller = panel.querySelector('.itforum-case__scroll');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nums = [...wrap.querySelectorAll('strong')];
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const state = new Map();
    let frames = [];
    let observer = null;
    let started = false;

    function parse(text) {
      const m = text.match(/^([\d.,]+)(.*)$/s);
      if (!m) return null;
      const sep = /,\d+$/.test(m[1]) ? ',' : '.';
      const dec = (m[1].split(sep)[1] || '').length;
      return { to: Number(m[1].replace(sep === ',' ? /\./g : /,/g, '').replace(',', '.')), sep, dec, unit: m[2], text };
    }

    function write(el, v) {
      const st = state.get(el);
      if (el.textContent !== st.written) Object.assign(st, parse(el.textContent) || {}, { target: el.textContent });
      const out = (st.dec ? v.toFixed(st.dec) : String(Math.round(v))).replace('.', st.sep) + st.unit;
      el.textContent = out;
      st.written = out;
    }

    function finish(el) {
      const st = state.get(el);
      if (el.textContent === st.written) el.textContent = st.target;
      st.written = el.textContent;
    }

    function reset() {
      frames.forEach(cancelAnimationFrame);
      frames = [];
      nums.forEach((el) => {
        const prev = state.get(el);
        if (prev && el.textContent === prev.written) el.textContent = prev.target;
        const p = parse(el.textContent);
        state.set(el, { ...p, target: el.textContent, written: el.textContent });
        if (p && !reduce.matches) write(el, 0);
      });
    }

    function run() {
      if (reduce.matches) return;
      const duration = 1400;
      nums.forEach((el, i) => {
        if (state.get(el)?.to == null) return;
        const start = performance.now() + i * 150;
        const tick = (now) => {
          const t = Math.min(1, Math.max(0, (now - start) / duration));
          if (t < 1) { write(el, state.get(el).to * ease(t)); frames.push(requestAnimationFrame(tick)); }
          else finish(el);
        };
        frames.push(requestAnimationFrame(tick));
      });
    }

    function inView() {
      const r = wrap.getBoundingClientRect();
      const v = scroller.getBoundingClientRect();
      const shown = Math.min(r.bottom, v.bottom) - Math.max(r.top, v.top);
      return r.height > 0 && shown / r.height >= 0.45;
    }

    function check() {
      if (started || !panel.classList.contains('is-open') || !inView()) return;
      started = true;
      run();
    }

    function watch() {
      started = false;
      observer?.disconnect();
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(check, { root: scroller, threshold: [0, 0.45, 1] });
        observer.observe(wrap);
      }
      check();
    }

    scroller.addEventListener('scroll', check, { passive: true });
    new MutationObserver(() => {
      if (panel.classList.contains('is-open')) { reset(); watch(); }
      else { observer?.disconnect(); reset(); }
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });

    reset();
  }
})();
