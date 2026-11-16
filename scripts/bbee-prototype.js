/*
 * BBEE field app — interactive prototype (case study).
 * A beekeeper opens a task, scans the hive's QR code, records the analysis
 * and confirms who was present. Visitors tap the highlighted control, jump to
 * any step, or let the guided tour play. Screens are HTML (UI copy in English,
 * as in the product); step names and hints come from langs/strings.js.
 * Shares the phone / tour styles with the Orla prototype (orla-prototype.css).
 */
(function initBbeePrototype() {
  const root = document.querySelector('[data-bbee-proto]');
  if (!root) return;

  const device = root.querySelector('[data-proto-device]');
  const stepButtons = [...root.querySelectorAll('[data-step]')];
  const hintEl = root.querySelector('[data-proto-hint]');
  const replayBtn = root.querySelector('[data-proto-replay]');
  const tourBtn = root.querySelector('[data-proto-autoplay]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const I = {
    back: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="m14.5 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    sync: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M12 7v5l3 2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z" fill="currentColor"/><circle cx="12" cy="10" r="2.3" fill="#fff"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    hive: '<svg viewBox="0 0 24 24"><path d="M4 9h16v11H4zM3 9l9-5 9 5M8 13h8M8 16.5h8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M8 4h8l3 3v13H8zM5 7v13h11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6.5 18.5a6.5 6.5 0 0 1 11 0" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    qr: '<svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2zM6.5 6.5h1v1h-1zM16.5 6.5h1v1h-1zM6.5 16.5h1v1h-1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><path d="M12 3.5 22 20H2Z" fill="#e5484d"/><path d="M12 9.5v5M12 17.2v.3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    lens: '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6" fill="#fff6dc" stroke="#d68a00" stroke-width="2"/><path d="m14.5 14.5 6 6" stroke="#d68a00" stroke-width="2.6" stroke-linecap="round"/></svg>',
    crown: '<svg viewBox="0 0 24 24"><path d="M4 17 3 7l5 4 4-6 4 6 5-4-1 10Z" fill="#FFC100" stroke="#d68a00" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    temp: '<svg viewBox="0 0 24 24"><path d="M10 4a2 2 0 0 1 4 0v9.3a4 4 0 1 1-4 0Z" fill="#fff" stroke="#e5484d" stroke-width="1.6"/><path d="M12 9v7" stroke="#e5484d" stroke-width="2.4" stroke-linecap="round"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z" fill="#cfe5ff" stroke="#3b82c4" stroke-width="1.6"/></svg>',
    minus: '<svg viewBox="0 0 24 24"><path d="M6 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M6 12h12M12 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  const avatar = (txt, bg) => `<span class="bp-av" style="background:${bg}">${txt}</span>`;
  const team = `<span class="bp-team">${avatar('AL', '#f6c9a8')}${avatar('MR', '#c8d9f2')}${avatar('TS', '#cfe8d2')}${avatar('+2', '#ece7dc')}</span>`;
  const header = (title, back = true) =>
    `<div class="bp-head">${back ? `<button type="button" class="bp-icon" data-proto-back aria-label="Back">${I.back}</button>` : '<span class="bp-icon"></span>'}<span>${title}</span><span class="bp-icon"></span></div>`;
  const nav = (fab = true) => `
    <nav class="bp-nav" aria-hidden="true">
      <span class="is-on">${I.cal}</span><span>${I.hive}</span>
      ${fab ? `<span class="bp-fab">${I.qr}</span>` : '<span></span>'}
      <span>${I.doc}</span><span>${I.user}</span>
    </nav>`;
  const taskCard = (title, cta) => `
    <div class="bp-card bp-task">
      <div class="bp-tags"><span class="bp-tag bp-tag--blue">Analysis</span><span class="bp-tag bp-tag--orange">Pending</span></div>
      <p class="bp-task-title">${title}</p>
      <p class="bp-meta"><i class="bp-ico">${I.clock}</i>Day 12 | Time: 8am to 12pm</p>
      <div class="bp-people"><span class="bp-resp">${avatar('JM', '#f3d3a2')}<span><small>Responsible</small>José Matos</span></span><span class="bp-sep"></span>${team}<small class="bp-team-l">Team</small></div>
      <p class="bp-meta"><i class="bp-ico bp-muted">${I.pin}</i>Apiary: Fortestelar | hive: Flordesol</p>
      ${cta}
    </div>`;

  const SCREENS = [
    { id: 'tasks', html: `
      <div class="bp-pad bp-pad--top">
        <div class="bp-row"><div><p class="bp-h">My tasks</p><p class="bp-sub">View all tasks you're involved in</p></div><span class="bp-sync">${I.sync}<b>3</b></span></div>
        <div class="bp-search"><i class="bp-ico">${I.search}</i>Search by task name</div>
        <div class="bp-chips"><span class="bp-chip">View all</span><span class="bp-chip is-on">The ones I'm responsible for ${I.check}</span><span class="bp-chip is-on">Tasks for today ${I.check}</span></div>
        ${taskCard('Collect honey – eastern zone', '<button type="button" class="bp-btn bp-btn--soft" data-act="next">View details</button>')}
        ${taskCard('Intervention – Transhumance', '')}
      </div>
      ${nav()}` },
    { id: 'task', html: `
      <div class="bp-top">${header('Task details')}</div>
      <div class="bp-pad bp-scroll">
        <div class="bp-tags"><span class="bp-tag bp-tag--blue">Analysis</span><span class="bp-tag bp-tag--orange">Pending</span></div>
        <p class="bp-title">Collect honey in the eastern zone of the apiaries</p>
        <p class="bp-sub">Check the posture on the left; if it changes, observe and take notes about it. Check the posture on the left.</p>
        <div class="bp-acc" data-proto-acc>
          <button type="button" class="bp-acc-head" data-act="toggle" aria-expanded="false">View required materials<span class="bp-acc-chev">${I.chev}</span></button>
          <div class="bp-acc-body"><div><ul class="bp-materials"><li>Smoker<b>1</b></li><li>Hive tool<b>1</b></li><li>Protective gloves<b>2 pairs</b></li><li>Empty honey frames<b>4</b></li></ul></div></div>
        </div>
        <div class="bp-card bp-task bp-task--flat">
          <p class="bp-task-title">Intervention – Transhumance</p>
          <p class="bp-meta"><i class="bp-ico">${I.clock}</i>Day 12 | Time: 8am to 12pm</p>
          <div class="bp-people"><span class="bp-resp">${avatar('JM', '#f3d3a2')}<span><small>Responsible</small>José Matos</span></span><span class="bp-sep"></span>${team}</div>
          <p class="bp-meta"><i class="bp-ico bp-muted">${I.pin}</i>Apiary: Fortestelar | hive: Flordesol</p>
          <button type="button" class="bp-btn bp-btn--soft" data-act="next">Start task</button>
        </div>
      </div>
      ${nav()}` },
    { id: 'scan', auto: 2600, html: `
      <div class="bp-scan">
        <div class="bp-scan-top">${header('Scan hive', false)}</div>
        <div class="bp-scan-view">
          <div class="bp-scan-hive"><span></span><span></span><span></span><i class="bp-scan-code">${I.qr}</i></div>
          <span class="bp-scan-frame"><i></i><i></i><i></i><i></i></span>
          <span class="bp-scan-line"></span>
        </div>
        <p class="bp-scan-text">Point the camera at the hive's QR code</p>
        <p class="bp-scan-found"><i class="bp-ico">${I.check}</i>Colmeia12# found</p>
      </div>` },
    { id: 'hive', html: `
      <div class="bp-top">${header('Colmeia12#')}</div>
      <div class="bp-pad bp-scroll">
        <div class="bp-select">Hive information<i class="bp-ico">${I.chev}</i></div>
        <div class="bp-card bp-info"><i class="bp-badge bp-badge--red">${I.alert}</i><span><b>Alerts</b><small>Required actions</small><em>21</em></span><span class="bp-link">View alerts ↗</span></div>
        <div class="bp-card bp-info"><i class="bp-badge">${I.lens}</i><span><b>Last inspection</b><small>Last inspection date</small><em>12/07/24</em></span></div>
        <div class="bp-card bp-info"><i class="bp-badge">${I.crown}</i><span><b>Queen bee</b><small>Queen bee code</small><em>Nº: 1222</em></span></div>
        <div class="bp-card bp-info"><i class="bp-badge">${I.temp}</i><span><b>Temperature</b><small>Internal hive temperature</small><em>34 °C</em></span></div>
        <div class="bp-card bp-info"><i class="bp-badge">${I.drop}</i><span><b>Humidity</b><small>Hive moisture</small><em>62%</em></span></div>
      </div>
      <div class="bp-footer"><button type="button" class="bp-btn" data-act="next">Perform task</button></div>` },
    { id: 'attach', html: `
      <div class="bp-top">${header('Perform task')}<div class="bp-steps"><span class="is-on"><b>1</b>Attach activities</span><span><b>2</b>Indicate presence</span></div></div>
      <div class="bp-pad">
        <label class="bp-field"><small>Analysis operation</small><span>Pollen<i class="bp-ico">${I.chev}</i></span></label>
        <div class="bp-field bp-field--plain"><small>Frames analysed</small>
          <div class="bp-stepper"><button type="button" data-act="dec" aria-label="Fewer frames">${I.minus}</button><output data-proto-frames>0</output><button type="button" data-act="inc" aria-label="More frames">${I.plus}</button></div>
        </div>
        <div class="bp-note">Notes are saved on the device and synced when you're back online.</div>
      </div>
      <div class="bp-footer"><button type="button" class="bp-btn" data-act="next" disabled>Next</button></div>` },
    { id: 'presence', html: `
      <div class="bp-top">${header('Perform task')}<div class="bp-steps"><span class="is-done"><b>${I.check}</b>Attach activities</span><span class="is-on"><b>2</b>Indicate presence</span></div></div>
      <div class="bp-pad">
        <p class="bp-label">Who took part in this task?</p>
        ${[['JM', '#f3d3a2', 'José Matos', 'Responsible', true], ['AL', '#f6c9a8', 'Ana Lima', 'Beekeeper'], ['MR', '#c8d9f2', 'Marcos Reis', 'Beekeeper'], ['TS', '#cfe8d2', 'Tânia Souza', 'Assistant']]
          .map(([a, c, n, r, tour]) => `<button type="button" class="bp-card bp-person" data-act="check"${tour ? ' data-tour' : ''}>${avatar(a, c)}<span><b>${n}</b><small>${r}</small></span><span class="bp-check">${I.check}</span></button>`).join('')}
      </div>
      <div class="bp-footer"><button type="button" class="bp-btn" data-act="next" disabled>Finish task</button></div>` },
    { id: 'done', html: `
      <div class="bp-done">
        <span class="bp-done-check">${I.check}</span>
        <p class="bp-done-title">Task completed!</p>
        <p class="bp-done-sub">Collect honey in the eastern zone of the apiaries</p>
        <div class="bp-card bp-receipt">
          <div class="bp-row"><small>Hive</small><b>Colmeia12#</b></div>
          <div class="bp-row"><small>Operation</small><b>Pollen analysis</b></div>
          <div class="bp-row"><small>Frames</small><b data-proto-sum-frames>0</b></div>
          <div class="bp-row"><small>Present</small><b data-proto-sum-people>0 people</b></div>
          <div class="bp-row"><small>Status</small><span class="bp-tag bp-tag--green">Done</span></div>
        </div>
        <button type="button" class="bp-btn bp-btn--dark" data-act="restart">Back to my tasks</button>
      </div>` },
  ];
  const INDEX = Object.fromEntries(SCREENS.map((s, i) => [s.id, i]));

  device.innerHTML = `
    <div class="op-scaler"><div class="op-phone"><div class="op-screen-wrap">
      <span class="op-island" aria-hidden="true"></span>
      <div class="op-status" aria-hidden="true"><span>9:41</span><svg viewBox="0 0 72 13" width="64" height="12"><rect x="0" y="8" width="3.2" height="5" rx="1"/><rect x="5" y="5.5" width="3.2" height="7.5" rx="1"/><rect x="10" y="3" width="3.2" height="10" rx="1"/><rect x="15" y="0" width="3.2" height="13" rx="1"/><path d="M26 4.6a9 9 0 0 1 12 0M28.3 7.3a5.6 5.6 0 0 1 7.4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="32" cy="10.6" r="1.5"/><rect x="45" y=".8" width="23" height="11.4" rx="3.4" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="47" y="2.8" width="19" height="7.4" rx="1.8"/></svg></div>
      ${SCREENS.map((s) => `<div class="op-screen" data-screen="${s.id}" aria-hidden="true">${s.html}</div>`).join('')}
      <span class="op-home" aria-hidden="true"></span>
    </div></div></div>
    <span class="op-finger" aria-hidden="true"><span class="op-finger-dot"></span></span>`;

  const wrap = device.querySelector('.op-screen-wrap');
  const screens = [...device.querySelectorAll('.op-screen')];
  const finger = device.querySelector('.op-finger');

  /* ---------- state ---------- */
  let step = 0;
  let frames = 0;
  let materialsSeen = false;
  let tour = true;
  let inView = false;
  let timers = [];
  let tourTimers = [];
  let fingerPos = null;
  const later = (fn, ms) => { timers.push(setTimeout(fn, reduceMotion.matches ? Math.min(ms, 600) : ms)); };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const tourLater = (fn, ms) => { tourTimers.push(setTimeout(fn, reduceMotion.matches ? Math.min(ms, 300) : ms)); };
  function clearTour() { tourTimers.forEach(clearTimeout); tourTimers = []; finger.classList.remove('is-tapping'); }

  const id = () => SCREENS[step].id;
  const current = () => screens[step];
  const lang = () => localStorage.getItem('SELECT_LANG') || 'en';
  const t = (key) => {
    const dict = typeof translations !== 'undefined' ? translations[lang()] || translations.en : null;
    return (dict && dict[key]) || key;
  };
  const checked = () => screens[INDEX.presence].querySelectorAll('.bp-person.is-checked').length;

  function targetFor() {
    const s = current();
    if (id() === 'task' && !materialsSeen) return s.querySelector('[data-act="toggle"]');
    if (id() === 'attach' && frames < 1) return s.querySelector('[data-act="inc"]');
    if (id() === 'presence' && checked() < 1) return s.querySelector('[data-act="check"][data-tour]');
    return s.querySelector('[data-act="next"]:not([disabled]), [data-act="restart"]');
  }

  function hintKey() {
    if (id() === 'task' && !materialsSeen) return 'bbee_proto_hint_task_materials';
    if (id() === 'attach' && frames < 1) return 'bbee_proto_hint_attach_frames';
    if (id() === 'presence' && checked() < 1) return 'bbee_proto_hint_presence_people';
    return `bbee_proto_hint_${id()}`;
  }

  function render() {
    wrap.dataset.active = id();
    screens.forEach((el, i) => {
      el.classList.toggle('is-active', i === step);
      el.classList.toggle('is-past', i < step);
      el.setAttribute('aria-hidden', String(i !== step));
      el.inert = i !== step;
    });
    const attachNext = screens[INDEX.attach].querySelector('[data-act="next"]');
    attachNext.disabled = frames < 1;
    screens[INDEX.presence].querySelector('[data-act="next"]').disabled = checked() < 1;
    screens[INDEX.attach].querySelector('[data-act="dec"]').disabled = frames < 1;
    screens[INDEX.attach].querySelector('[data-proto-frames]').textContent = frames;

    device.querySelectorAll('.is-target').forEach((el) => el.classList.remove('is-target'));
    targetFor()?.classList.add('is-target');

    stepButtons.forEach((b, i) => {
      b.classList.toggle('is-current', i === step);
      b.classList.toggle('is-done', i < step);
      if (i === step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    const key = hintKey();
    hintEl.dataset.i18n = key;
    hintEl.textContent = t(key);
  }

  function enter() {
    const s = current();
    s.querySelectorAll('.bp-scroll').forEach((sc) => { sc.scrollTop = 0; });
    if (id() === 'task') {
      materialsSeen = false;
      const acc = s.querySelector('[data-proto-acc]');
      acc.classList.remove('is-open');
      acc.querySelector('[data-act="toggle"]').setAttribute('aria-expanded', 'false');
    }
    if (id() === 'scan') {
      s.classList.remove('is-found');
      later(() => s.classList.add('is-found'), 1800);
    }
    if (id() === 'attach') frames = 0;
    if (id() === 'presence') s.querySelectorAll('.bp-person').forEach((p) => p.classList.remove('is-checked'));
    if (id() === 'done') {
      screens[INDEX.done].querySelector('[data-proto-sum-frames]').textContent = frames;
      const n = checked();
      screens[INDEX.done].querySelector('[data-proto-sum-people]').textContent = `${n} ${n === 1 ? 'person' : 'people'}`;
    }
    if (SCREENS[step].auto) later(() => go(step + 1), SCREENS[step].auto);
    render();
    if (tour) scheduleTap();
  }

  function go(next) {
    clearTimers();
    clearTour();
    step = (next + SCREENS.length) % SCREENS.length;
    enter();
  }

  function act(el) {
    const kind = el.dataset.act;
    if (kind === 'toggle') {
      const acc = el.closest('[data-proto-acc]');
      const open = !acc.classList.contains('is-open');
      acc.classList.toggle('is-open', open);
      el.setAttribute('aria-expanded', String(open));
      if (open) materialsSeen = true;
      render();
      if (tour) scheduleTap(1600);
      return;
    }
    if (kind === 'inc') { frames = Math.min(20, frames + 1); render(); if (tour) scheduleTap(); return; }
    if (kind === 'dec') { frames = Math.max(0, frames - 1); render(); return; }
    if (kind === 'check') { el.classList.toggle('is-checked'); render(); if (tour) scheduleTap(); return; }
    if (kind === 'restart') { go(0); return; }
    if (kind === 'next') go(step + 1);
  }

  device.addEventListener('click', (e) => {
    const trusted = e.isTrusted;
    const back = e.target.closest('[data-proto-back]');
    if (back) { if (trusted) stopTour(); if (step > 0) go(step - 1); return; }
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    if (trusted) stopTour();
    act(el);
  });
  stepButtons.forEach((b) => b.addEventListener('click', () => { stopTour(); go(Number(b.dataset.step)); }));

  /* ---------- guided tour (pointer glides between controls) ---------- */
  const scroller = root.closest('.bbee-case__scroll');
  function visible() {
    const r = device.getBoundingClientRect();
    const v = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    const shown = Math.min(r.bottom, v.bottom) - Math.max(r.top, v.top);
    return r.height > 0 && shown / r.height >= 0.45;
  }
  function hideFinger() { clearTour(); finger.classList.remove('is-visible'); fingerPos = null; }
  function moveFinger(x, y) {
    if (!fingerPos || !finger.classList.contains('is-visible')) {
      finger.style.transition = 'none';
      finger.style.transform = `translate(${x}px, ${y}px)`;
      void finger.offsetWidth;
      finger.style.transition = '';
      finger.classList.add('is-visible');
      fingerPos = { x, y };
      return 320;
    }
    const ms = reduceMotion.matches ? 0 : Math.round(Math.min(900, Math.max(420, Math.hypot(x - fingerPos.x, y - fingerPos.y) * 1.6)));
    finger.style.setProperty('--op-move', `${ms}ms`);
    finger.style.transform = `translate(${x}px, ${y}px)`;
    fingerPos = { x, y };
    return ms;
  }
  function scheduleTap(delay) {
    clearTour();
    if (!tour || SCREENS[step].auto) return;
    if (!visible()) { inView = false; tourLater(() => scheduleTap(delay), 800); return; }
    inView = true;
    const target = targetFor();
    if (!target) return;
    tourLater(() => {
      if (!tour || targetFor() !== target) return;
      // bring the target above the tab bar inside the screen's own scroll area first
      const pause = revealInScreen(target);
      tourLater(() => {
      if (!tour || targetFor() !== target) return;
      const tr = target.getBoundingClientRect();
      const dr = device.getBoundingClientRect();
      const travel = moveFinger(tr.left - dr.left + tr.width / 2, tr.top - dr.top + tr.height / 2);
      tourLater(() => {
        finger.classList.remove('is-tapping');
        void finger.offsetWidth;
        finger.classList.add('is-tapping');
        tourLater(() => { if (tour && targetFor() === target) target.click(); }, 180);
        tourLater(() => finger.classList.remove('is-tapping'), 420);
      }, travel + 220);
      }, pause);
    }, delay || (id() === 'done' ? 3200 : 900));
  }

  // scrolls .bp-scroll so the target clears the bottom tab bar; returns the wait in ms
  function revealInScreen(target) {
    const sc = target.closest('.bp-scroll');
    if (!sc) return 0;
    const k = device.getBoundingClientRect().width / 418 || 1; // phone is scaled
    const tr = target.getBoundingClientRect();
    const sr = sc.getBoundingClientRect();
    const reserve = 120 * k; // tab bar + breathing room
    let delta = 0;
    if (tr.bottom > sr.bottom - reserve) delta = (tr.bottom - (sr.bottom - reserve)) / k;
    else if (tr.top < sr.top + 12 * k) delta = (tr.top - sr.top - 12 * k) / k;
    if (Math.abs(delta) < 2) return 0;
    sc.scrollBy({ top: delta, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    return 520;
  }
  function setTour(on) {
    tour = on;
    tourBtn.setAttribute('aria-pressed', String(on));
    root.classList.toggle('is-touring', on);
    if (!on) hideFinger();
    else scheduleTap();
  }
  function stopTour() { if (tour) setTour(false); }
  tourBtn.addEventListener('click', () => setTour(!tour));
  replayBtn.addEventListener('click', () => { tour = true; root.classList.add('is-touring'); tourBtn.setAttribute('aria-pressed', 'true'); go(0); });

  new IntersectionObserver(() => {
    const was = inView;
    inView = visible();
    if (inView && !was && tour) scheduleTap();
    if (!inView && was) hideFinger();
  }, { root: scroller || null, threshold: [0, 0.45, 1] }).observe(device);

  // start over (tour on) every time the case study opens
  const panel = root.closest('.bbee-case');
  if (panel) {
    new MutationObserver(() => {
      if (panel.classList.contains('is-open') && !root.dataset.started) {
        root.dataset.started = '1';
        tour = !reduceMotion.matches;
        root.classList.toggle('is-touring', tour);
        tourBtn.setAttribute('aria-pressed', String(tour));
        go(0);
      }
      if (!panel.classList.contains('is-open')) { delete root.dataset.started; hideFinger(); }
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  }

  tour = !reduceMotion.matches;
  root.classList.toggle('is-touring', tour);
  tourBtn.setAttribute('aria-pressed', String(tour));
  go(0);
})();
