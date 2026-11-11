/*
 * Vivo+ interactive prototype (case study).
 * A live phone that walks through the whole sales flow. Visitors tap the
 * highlighted control to move on, jump to any step from the list, or let the
 * guided tour tap for them. Screens are real HTML (UI copy in Portuguese, as in
 * the product); step names and hints come from langs/strings.js.
 *
 * Selections: any control with data-act="select" and data-group="<name>" behaves
 * like a radio inside its group. REQUIRED lists the groups each screen needs
 * before its main button unlocks; the tour picks the option marked data-tour.
 */
(function initOrlaPrototype() {
  const root = document.querySelector('[data-orla-proto]');
  if (!root) return;

  const device = root.querySelector('[data-proto-device]');
  const stepsList = root.querySelector('[data-proto-steps]');
  const hintEl = root.querySelector('[data-proto-hint]');
  const replayBtn = root.querySelector('[data-proto-replay]');
  const tourBtn = root.querySelector('[data-proto-autoplay]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const CPF_DEMO = '12345678910';
  const REQUIRED = { contract: ['address'], schedule: ['date1', 'slot1', 'date2', 'slot2'] };

  const ICON = {
    back: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="m14.5 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    kebab: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="19" r="1.8" fill="currentColor"/></svg>',
    mark: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.6" r="2.9" fill="currentColor"/><path d="M5 8.6c2.4 1.6 4.6 2.2 7 2.2s4.6-.6 7-2.2M12 10.8v3.4M12 14.2 8.2 21M12 14.2l3.8 6.8" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wifi: '<svg viewBox="0 0 24 24"><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="19.3" r="1.4" fill="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 18.3h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    call: '<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.5 4-2 1.4a11 11 0 0 0 6 6l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z" fill="currentColor"/><circle cx="12" cy="10" r="2.3" fill="#fff"/></svg>',
    x: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m9 9 6 6m0-6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    filter: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="7" r="2.2" fill="#fff" stroke="currentColor" stroke-width="1.8"/><circle cx="15" cy="12" r="2.2" fill="#fff" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="17" r="2.2" fill="#fff" stroke="currentColor" stroke-width="1.8"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    tag: '<svg viewBox="0 0 24 24"><path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.4 1.4 0 0 1 0 2l-6.1 6.1a1.4 1.4 0 0 1-2 0Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="8.5" cy="8.5" r="1.6" fill="currentColor"/></svg>',
    gift: '<svg viewBox="0 0 24 24"><rect x="3.5" y="8.5" width="17" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5c-1.5-4-6-4-5-1.2.5 1.4 5 1.2 5 1.2Zm0 0c1.5-4 6-4 5-1.2-.5 1.4-5 1.2-5 1.2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevUp: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="m6 15 6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="m4 20 1-4L16 5l3 3L8 19Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    wifiBig: '<svg viewBox="0 0 24 24"><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="19.3" r="1.4" fill="currentColor"/></svg>',
    tv: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 20.5h6M12 17v3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z M4 7.5 12 12l8-4.5M12 12v9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M9 5h10.5A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5H9l-6-7Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m11.5 9.5 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  };

  // Illustrated customer for the identity check
  const FACE = `<svg class="op-face-art" viewBox="0 0 250 320" aria-hidden="true">
    <defs><linearGradient id="opFaceBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4eefa"/><stop offset="1" stop-color="#e0d3ec"/></linearGradient></defs>
    <rect width="250" height="320" fill="url(#opFaceBg)"/>
    <path d="M60 150C52 72 100 40 128 42c42 2 72 36 66 108-2 60 6 100 16 150H40c12-50 22-90 20-150Z" fill="#2b1d16"/>
    <path d="M30 320c4-58 48-84 95-84s91 26 95 84Z" fill="#660099"/>
    <path d="M100 244c8 14 42 14 50 0" fill="none" stroke="#4b0070" stroke-width="3"/>
    <rect x="106" y="188" width="38" height="56" rx="16" fill="#c98d6b"/>
    <ellipse cx="77" cy="146" rx="9" ry="13" fill="#c98d6b"/><ellipse cx="173" cy="146" rx="9" ry="13" fill="#c98d6b"/>
    <ellipse cx="125" cy="140" rx="49" ry="61" fill="#d9a07c"/>
    <path d="M76 132c0-44 26-62 52-62 28 0 48 20 46 58-14-24-40-32-66-24-14 4-26 14-32 28Z" fill="#2b1d16"/>
    <circle cx="100" cy="160" r="9" fill="#eb3c7d" opacity=".14"/><circle cx="150" cy="160" r="9" fill="#eb3c7d" opacity=".14"/>
    <path d="M98 123q10-6 20 0M132 123q10-6 20 0" fill="none" stroke="#2b1d16" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="108" cy="137" rx="4.5" ry="5.2" fill="#2b1d16"/><ellipse cx="142" cy="137" rx="4.5" ry="5.2" fill="#2b1d16"/>
    <path d="M125 141q-6 14 2 16" fill="none" stroke="#b07a5a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M110 170q15 13 30 0" fill="none" stroke="#8a3f33" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`;

  const top = (title, kebab = true, back = true) =>
    `<div class="op-top">${back ? `<button type="button" class="op-icon-btn" data-proto-back aria-label="Voltar">${ICON.back}</button>` : '<span class="op-icon-btn" aria-hidden="true"></span>'}<span>${title}</span>${kebab ? `<span class="op-kebab" aria-hidden="true">${ICON.kebab}</span>` : ''}</div>`;
  const opt = (group, value, inner, cls, tour) =>
    `<button type="button" class="${cls}" data-act="select" data-group="${group}" data-value="${value}"${tour ? ' data-tour' : ''}>${inner}</button>`;
  const dates = (group, tourValue) => `<div class="op-dates">${[['Sex', '18'], ['Sáb', '19'], ['Seg', '21'], ['Ter', '22']]
    .map(([d, n]) => opt(group, `${n}/09/26`, `<small>${d}</small><b>${n}</b><small>set</small>`, 'op-date', `${n}/09/26` === tourValue)).join('')}</div>`;
  const slots = (group, tourValue) => `<div class="op-periods">${[['Manhã', '9h - 12h'], ['Tarde', '13h - 17h'], ['Noite', '18h - 20h']]
    .map(([n, h]) => opt(group, n, `<span><span class="op-period-name">${n}</span><span class="op-lbl">${h}</span></span><span class="op-radio"></span>`, 'op-period', n === tourValue)).join('')}</div>`;

  // Collapsible section of the order summary
  const acc = (key, title, icon, open, body, meta = '', tourTarget = false) => `
    <section class="op-acc-sec${open ? ' is-open' : ''}" data-acc="${key}">
      <button type="button" class="op-acc-head" data-acc-toggle aria-expanded="${open}"${tourTarget ? ' data-tour-open' : ''}>
        ${icon ? `<i class="op-circle op-circle--s">${icon}</i>` : ''}<span class="op-acc-title">${title}</span>${meta}<span class="op-acc-chev">${ICON.chevUp}</span>
      </button>
      <div class="op-acc-body"><div class="op-acc-inner">${body}</div></div>
    </section>`;
  // "Incluso" box with optional add-on services (generic icons, no partner brands)
  const included = (text, svas = false) => `
    <div class="op-included"><i class="op-ico">${ICON.box}</i><span><b>Incluso</b>${text}${svas ? `
      <small class="op-svas-label">Serviços adicionais inclusos</small>
      <span class="op-svas"><i style="--c:#eb3c7d">♪</i><i style="--c:#660099">▶</i><i style="--c:#3d5459">❖</i><i style="--c:#e0a32e">✦</i><i style="--c:#6c7a7e">☁</i><span class="op-link">Mostrar mais</span></span>` : ''}</span></div>`;

  // id, auto (ms, advances by itself), screen markup
  const SCREENS = [
    { id: 'cpf', html: `
      ${top('', false, false)}
      <div class="op-pad op-pad--top">
        <p class="op-h">Identifique o cliente</p>
        <p class="op-sub">Informe o documento abaixo para iniciar o atendimento do cliente.</p>
        <p class="op-lbl op-mt-l">CPF ou CNPJ</p>
        <p class="op-cpf"><span data-proto-cpf></span><i class="op-caret"></i><span class="op-cpf-ph" data-proto-cpf-ph>000.000.000-00</span></p>
        <p class="op-lbl op-mt-s" data-proto-cpf-count>0/11</p>
      </div>
      <button type="button" class="op-btn op-btn--keys" data-act="next" disabled>Continuar</button>
      <div class="op-keypad">${['1', '2 ABC', '3 DEF', '4 GHI', '5 JKL', '6 MNO', '7 PQRS', '8 TUV', '9 WXYZ', '', '0', 'del']
        .map((k) => {
          const [n, l] = k.split(' ');
          if (!n) return '<span class="op-key-empty"></span>';
          if (n === 'del') return `<button type="button" class="op-key op-key--del" data-key="del" aria-label="Apagar">${ICON.del}</button>`;
          return `<button type="button" class="op-key" data-key="${n}">${n}${l ? `<small>${l}</small>` : ''}</button>`;
        }).join('')}</div>` },
    { id: 'client', html: `
      ${top('Visão do cliente', false)}
      <div class="op-pad">
        <div class="op-person"><span class="op-avatar">AS</span><span><b>Alex Santana</b><span class="op-lbl">CPF: 127.•••.•••-29</span></span></div>
        <span class="op-chip">Endereços <span class="op-count">2</span></span>
        <div class="op-actions"><span><i class="op-circle">${ICON.x}</i>Encerrar atendimento</span><span><i class="op-circle">${ICON.search}</i>Buscar outro CPF</span></div>
        <p class="op-section">Produtos ativos</p>
        <div class="op-card op-product"><div class="op-row"><b>Vivo Fibra 500 Mega</b><i class="op-ico op-teal">${ICON.wifi}</i></div><p>R$ 100/mês</p><p class="op-lbl">Contratado em 30/09/2023</p><p class="op-addr"><i class="op-ico">${ICON.pin}</i>Rua das Flores, 901, Centro, São Paulo</p></div>
        <div class="op-card op-product"><div class="op-row"><b>Vivo Pós (Selfie)</b><i class="op-ico op-teal">${ICON.phone}</i></div><p>R$ 79/mês</p><p class="op-lbl">Contratado em 30/09/2023</p></div>
      </div>
      <nav class="op-nav"><span class="is-on"><i>${ICON.user}</i>Visão do cliente</span><button type="button" data-act="next"><i>${ICON.tag}</i>Ofertas</button></nav>` },
    { id: 'offers', html: `
      ${top('Ofertas', false)}
      <div class="op-grey op-pad">
        <div class="op-search"><span><i class="op-ico">${ICON.search}</i>Buscar ofertas, planos...</span><i class="op-round">${ICON.filter}</i></div>
        <div class="op-card op-offer">
          <p class="op-brand"><i class="op-mark">${ICON.mark}</i>Vivo Total Pro</p>
          <p class="op-big">500 Mega<small>Fibra</small></p><p class="op-big op-big--s">60 GB<small>Pós-pago</small></p>
          <p class="op-bullets">+ Internet com Wi-Fi 6<br>+ 6 meses grátis de Gemini</p>
          <hr><p class="op-price">R$ 160<small>/mês</small></p>
          <div class="op-row op-mt"><button type="button" class="op-btn op-btn--sm" data-act="next">Iniciar contratação</button><span class="op-link">Mostrar mais ›</span></div>
        </div>
        <div class="op-card op-offer">
          <p class="op-brand"><i class="op-mark">${ICON.mark}</i>Vivo Total Ultra</p>
          <p class="op-big">700 Mega<small>Fibra</small></p><p class="op-big op-big--s">70 GB<small>Pós-pago</small></p>
        </div>
      </div>
      <nav class="op-nav"><button type="button" data-proto-tab="client"><i>${ICON.user}</i>Visão do cliente</button><span class="is-on"><i>${ICON.tag}</i>Ofertas</span></nav>` },
    { id: 'contract', html: `
      ${top('Dados para contratar')}
      <div class="op-grey op-pad">
        <div class="op-offer-head"><div class="op-row op-row--start"><i class="op-mark op-mark--l">${ICON.mark}</i><span><span class="op-lbl op-on-dark">Oferta</span><b>Vivo Total Pro</b></span></div><hr><div class="op-row"><span>R$ 160,00 /mês</span><span class="op-row op-gap-s">Mostrar mais ${ICON.chev}</span></div></div>
        <p class="op-lbl op-section-lbl">Endereço para contratação</p>
        ${opt('address', 'principal', '<span>Av. Principal, 901, São Paulo - SP</span><span class="op-radio"></span>', 'op-card op-option')}
        ${opt('address', 'flores', '<span>Rua das Flores, 901, Centro, São Paulo</span><span class="op-radio"></span>', 'op-card op-option', true)}
        <div class="op-card op-option"><span class="op-row op-gap-s"><i class="op-ico">${ICON.user}</i>Visão do cliente</span>${ICON.chev}</div>
      </div>
      <div class="op-footer"><button type="button" class="op-btn" data-act="next" disabled>Continuar</button></div>` },
    { id: 'loading', auto: 2600, html: `
      <div class="op-loading">
        <svg class="op-spinner" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="opSpin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#660099"/><stop offset="1" stop-color="#eb3c7d"/></linearGradient></defs><circle cx="32" cy="32" r="26" fill="none" stroke="#f1e5fa" stroke-width="6"/><circle cx="32" cy="32" r="26" fill="none" stroke="url(#opSpin)" stroke-width="6" stroke-linecap="round" stroke-dasharray="52 112"/></svg>
        <p>Analisando cobertura e<br>disponibilidade...</p>
        <span class="op-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>` },
    { id: 'config', html: `
      ${top('Configurar oferta')}
      <div class="op-grey op-pad op-pad--footer">
        <div class="op-card op-acc"><div class="op-row"><span class="op-row op-gap"><i class="op-circle op-circle--s">${ICON.phone}</i>Móvel</span>${ICON.chev}</div>
          <div class="op-inner"><p class="op-inc"><i class="op-ico">${ICON.gift}</i>Inclusos</p><p class="op-sub op-indent">70 GB de internet.</p><hr>
          <div class="op-row op-line"><b>Principal</b><span class="op-row op-gap-s">(11) 98854-4543<i class="op-ico op-teal">${ICON.pencil}</i></span></div>
          <div class="op-row op-line"><b>Dependente 1</b><span class="op-row op-gap-s">(11) 98843-4589<i class="op-ico op-teal">${ICON.pencil}</i></span></div></div></div>
        <div class="op-card op-acc"><div class="op-row"><span class="op-row op-gap"><i class="op-circle op-circle--s">${ICON.call}</i>Voz</span>${ICON.chev}</div>
          <div class="op-inner"><p class="op-inc"><i class="op-ico">${ICON.gift}</i>Inclusos</p><p class="op-sub op-indent">Chamadas ilimitadas para qualquer telefone fixo ou celular do Brasil.</p><hr>
          <div class="op-row op-line"><b>Voz fixa</b><span class="op-row op-gap-s">(61) 3303-4671<i class="op-ico op-teal">${ICON.pencil}</i></span></div></div></div>
      </div>
      <div class="op-footer"><button type="button" class="op-btn" data-act="next">Continuar</button></div>` },
    { id: 'schedule', html: `
      ${top('Agendar instalação')}
      <div class="op-grey op-pad op-pad--footer">
        <div class="op-card op-block"><p class="op-inc"><i class="op-ico">${ICON.cal}</i>Data principal</p>${dates('date1', '18/09/26')}${slots('slot1', 'Tarde')}</div>
        <div class="op-card op-block"><p class="op-inc"><i class="op-ico">${ICON.cal}</i>Segunda opção</p>${dates('date2', '21/09/26')}${slots('slot2', 'Manhã')}</div>
        <div class="op-info op-card"><i class="op-i">i</i>Prazo mínimo de 48h. A equipe técnica confirma o horário da visita.</div>
      </div>
      <div class="op-footer"><button type="button" class="op-btn" data-act="next" disabled>Revisar pedido</button></div>` },
    { id: 'summary', html: `
      ${top('Resumo do pedido')}
      <div class="op-scroll" data-proto-scroll>
        <div class="op-pad op-grey">
          ${acc('plan', 'Planos &amp; serviços', '', true, `
            <div class="op-person"><span class="op-avatar op-avatar--brand"><i class="op-mark op-mark--white">${ICON.mark}</i></span><span><span>Vivo Total Pro</span><b>R$ 160,00</b></span></div>
            <div class="op-info"><i class="op-i">i</i><span><b>Migração</b>O plano atual pode ter multa e juros. Confirme se há fidelidade.</span></div>`, '<span class="op-muted op-acc-meta">R$ 160,00</span>')}
          ${acc('mobile', 'Móvel', ICON.phone, false, `
            <span class="op-tag">Migração</span>
            <p class="op-line-title">Linha principal</p><p class="op-lbl">(11) 98765-4321</p>
            <div class="op-kv"><span><small>Operação</small>Portabilidade</span><span><small>Operadora de origem</small>Atlântica Móvel</span></div>
            <hr>
            <p class="op-line-title">Linha adicional</p><p class="op-lbl">(11) 98843-4589</p>
            <div class="op-kv"><span><small>Operação</small>Nova linha</span></div>
            ${included('70 GB de internet', true)}`)}
          ${acc('broadband', 'Banda larga', ICON.wifiBig, false, `
            <span class="op-tag op-tag--new">Alta</span>
            <p class="op-line-title">Instalação</p><p class="op-lbl">Rua das Flores, 901, Centro, São Paulo</p>
            <p class="op-kv-label">Possíveis datas</p>
            <p class="op-date-line" data-proto-date-line="1">—</p><p class="op-date-line" data-proto-date-line="2">—</p>
            ${included('Vivo Fibra 500 Mega', true)}`, '', true)}
          ${acc('voice', 'Voz', ICON.call, false, `
            <span class="op-tag op-tag--new">Alta</span>
            <p class="op-line-title">Linha fixa</p><p class="op-lbl">(61) 3303-4671</p>
            <div class="op-kv"><span><small>Operação</small>Portabilidade</span><span><small>Operadora de origem</small>Atlântica Fixo</span></div>
            ${included('Chamadas ilimitadas para qualquer telefone fixo ou celular do Brasil.')}`)}
          ${acc('tv', 'TV', ICON.tv, false, included('Vivo Play Inicial'))}
          <label class="op-note"><span class="op-visually-hidden">Observação sobre o pedido</span><textarea rows="3" placeholder="Observação sobre o pedido"></textarea></label>
        </div>
      </div>
      <div class="op-total"><div class="op-row"><span>Total a pagar</span><b>R$ 160,00/mês</b></div><button type="button" class="op-btn" data-act="next">Finalizar venda</button></div>` },
    { id: 'bio', auto: 3000, html: `
      ${top('Validação de identidade', false)}
      <div class="op-pad op-center">
        <p class="op-sub">Posicione o rosto do cliente dentro da moldura e mantenha o celular parado.</p>
        <div class="op-face">${FACE}
          <span class="op-face-frame"></span>
          <span class="op-face-box"><i></i><i></i><i></i><i></i></span>
          <span class="op-face-points"><i style="left:43%;top:43%"></i><i style="left:57%;top:43%"></i><i style="left:50%;top:49%"></i><i style="left:45%;top:54%"></i><i style="left:55%;top:54%"></i></span>
          <span class="op-face-scan"></span>
          <span class="op-face-ok">${ICON.check}</span>
        </div>
        <div class="op-progress"><span></span></div>
        <p class="op-progress-label"><span class="op-bio-wait">Analisando biometria...</span><span class="op-bio-ok">Identidade confirmada</span></p>
      </div>
      <div class="op-footer"><div class="op-btn op-btn--ghost" aria-hidden="true">Cancelar</div></div>` },
    { id: 'done', html: `
      <div class="op-done">
        <div class="op-done-scroll">
          <span class="op-done-check">${ICON.check}</span>
          <p class="op-done-title">Plano Vivo Total Pro solicitado com sucesso!</p>
          <p class="op-done-sub">Pedido #48213 gerado. As próximas atualizações serão enviadas por e-mail.</p>
          <div class="op-done-card">
            <p class="op-done-card-title">Produtos &amp; serviços</p>
            <div class="op-row op-done-plan"><span class="op-row op-gap-s"><i class="op-mark op-mark--white">${ICON.mark}</i>Vivo Total Pro</span><span>R$ 160,00 /mês</span></div>
            <div class="op-row op-done-line"><span><small>Linha principal</small>(11) 98765-4321</span><span class="op-done-tag">Migração</span></div>
            <div class="op-row op-done-line"><span><small>Linha adicional</small>(11) 98843-4589</span><span class="op-done-tag">Nova linha</span></div>
            <div class="op-row op-done-line op-done-line--sep"><span><small>Voz fixa</small>(61) 3303-4671</span><span class="op-done-tag">Portabilidade</span></div>
          </div>
          <div class="op-done-card">
            <p class="op-done-card-title">Instalação</p>
            <p class="op-done-muted">Rua das Flores, 901, Centro, São Paulo</p>
            <p class="op-row op-gap-s op-done-dates"><i class="op-ico">${ICON.cal}</i>Possíveis datas</p>
            <p data-proto-date-line="1">—</p><p data-proto-date-line="2">—</p>
          </div>
        </div>
        <div class="op-done-actions">
          <button type="button" class="op-btn op-btn--light" data-act="restart">Concluir atendimento</button>
          <button type="button" class="op-done-link" data-act="goto" data-to="client">Voltar para a visão do cliente</button>
        </div>
      </div>` },
  ];
  const INDEX = Object.fromEntries(SCREENS.map((s, i) => [s.id, i]));

  /* ---------- build the phone ---------- */
  device.innerHTML = `
    <div class="op-scaler">
      <div class="op-phone">
        <div class="op-screen-wrap">
          <span class="op-island" aria-hidden="true"></span>
          <div class="op-status" aria-hidden="true"><span>9:41</span><svg viewBox="0 0 72 13" width="64" height="12"><rect x="0" y="8" width="3.2" height="5" rx="1"/><rect x="5" y="5.5" width="3.2" height="7.5" rx="1"/><rect x="10" y="3" width="3.2" height="10" rx="1"/><rect x="15" y="0" width="3.2" height="13" rx="1"/><path d="M26 4.6a9 9 0 0 1 12 0M28.3 7.3a5.6 5.6 0 0 1 7.4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="32" cy="10.6" r="1.5"/><rect x="45" y=".8" width="23" height="11.4" rx="3.4" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="47" y="2.8" width="19" height="7.4" rx="1.8"/></svg></div>
          ${SCREENS.map((s) => `<div class="op-screen" data-screen="${s.id}" aria-hidden="true">${s.html}</div>`).join('')}
          <span class="op-home" aria-hidden="true"></span>
        </div>
      </div>
    </div>
    <span class="op-finger" aria-hidden="true"><span class="op-finger-dot"></span></span>`;

  const wrap = device.querySelector('.op-screen-wrap');
  const screens = [...device.querySelectorAll('.op-screen')];
  const finger = device.querySelector('.op-finger');
  const stepButtons = [...stepsList.querySelectorAll('[data-step]')];
  const cpfScreen = screens[INDEX.cpf];

  /* ---------- state ---------- */
  let step = 0;
  let cpf = '';
  let typing = false;
  let tour = true;
  let inView = false;
  const scroller = root.closest('.orla-case__scroll');
  // at least 45% of the phone inside its scroll container (or the window)
  function visible() {
    const r = device.getBoundingClientRect();
    const v = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    const shown = Math.min(r.bottom, v.bottom) - Math.max(r.top, v.top);
    return r.height > 0 && shown / r.height >= 0.45;
  }
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, reduceMotion.matches ? Math.min(ms, 500) : ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  const lang = () => localStorage.getItem('SELECT_LANG') || 'en';
  function t(key) {
    const dict = typeof translations !== 'undefined' ? translations[lang()] || translations.en : null;
    return (dict && dict[key]) || key;
  }

  const current = () => screens[step];
  const id = () => SCREENS[step].id;
  const nextBtn = () => current().querySelector('[data-act="next"]');

  function missingGroup() {
    return (REQUIRED[id()] || []).find((g) => !current().querySelector(`[data-group="${g}"].is-selected`));
  }

  // the control the visitor (or the tour) should press now
  function targetFor() {
    if (id() === 'cpf' && cpf.length < 11) return null;
    if (id() === 'summary' && !reviewed) return current().querySelector('[data-tour-open]');
    const g = missingGroup();
    if (g) {
      return current().querySelector(`[data-group="${g}"][data-tour]:not(.is-disabled)`)
        || current().querySelector(`[data-group="${g}"]:not(.is-disabled)`);
    }
    return current().querySelector('[data-act="next"]:not([disabled]), [data-act="restart"]');
  }

  function hintKey() {
    if (id() === 'cpf') return cpf.length < 11 ? 'orla_proto_hint_cpf_type' : 'orla_proto_hint_cpf';
    if (id() === 'summary' && !reviewed) return 'orla_proto_hint_summary_open';
    const g = missingGroup();
    return g ? `orla_proto_hint_${id()}_${g}` : `orla_proto_hint_${id()}`;
  }

  function syncNext() {
    const btn = nextBtn();
    if (!btn) return;
    if (id() === 'cpf') btn.disabled = cpf.length < 11;
    else if (REQUIRED[id()]) btn.disabled = Boolean(missingGroup());
  }

  function render() {
    wrap.dataset.active = id();
    screens.forEach((el, i) => {
      el.classList.toggle('is-active', i === step);
      el.classList.toggle('is-past', i < step);
      el.setAttribute('aria-hidden', String(i !== step));
      el.inert = i !== step;
    });
    syncNext();
    device.querySelectorAll('.is-target').forEach((el) => el.classList.remove('is-target'));
    const target = targetFor();
    if (target) target.classList.add('is-target');

    stepButtons.forEach((b, i) => {
      b.classList.toggle('is-current', i === step);
      b.classList.toggle('is-done', i < step);
      if (i === step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });

    const key = hintKey();
    hintEl.dataset.i18n = key; // translations.js re-translates it on language change
    hintEl.textContent = t(key);
  }

  /* ---------- CPF ---------- */
  const maskCpf = (d) => d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2').replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2');
  function showCpf() {
    cpfScreen.querySelector('[data-proto-cpf]').textContent = maskCpf(cpf);
    cpfScreen.querySelector('[data-proto-cpf-ph]').hidden = cpf.length > 0;
    cpfScreen.querySelector('[data-proto-cpf-count]').textContent = `${cpf.length}/11`;
  }
  function flashKey(k) {
    const key = cpfScreen.querySelector(`[data-key="${k}"]`);
    if (!key) return;
    key.classList.add('is-pressed');
    setTimeout(() => key.classList.remove('is-pressed'), 140);
  }
  function pressKey(k) {
    if (k === 'del') cpf = cpf.slice(0, -1);
    else if (cpf.length < 11) cpf += k;
    flashKey(k);
    showCpf();
    render();
  }
  function autoTypeCpf() {
    typing = true;
    const tick = () => {
      if (!tour) { typing = false; render(); return; }
      pressKey(CPF_DEMO[cpf.length]);
      if (cpf.length < 11) later(tick, 110);
      else { typing = false; render(); scheduleTap(); }
    };
    later(tick, 500);
  }

  /* ---------- selections ---------- */
  function select(el) {
    if (el.classList.contains('is-disabled')) return;
    const g = el.dataset.group;
    current().querySelectorAll(`[data-group="${g}"]`).forEach((o) => o.classList.toggle('is-selected', o === el));
    // the second installation option can't repeat the first date
    if (g === 'date1') {
      current().querySelectorAll('[data-group="date2"]').forEach((o) => {
        const same = o.dataset.value === el.dataset.value;
        o.classList.toggle('is-disabled', same);
        o.disabled = same;
        if (same) o.classList.remove('is-selected');
      });
    }
    if (id() === 'schedule') writeSchedule();
    render();
    if (tour) scheduleTap();
  }

  function writeSchedule() {
    const s = screens[INDEX.schedule];
    const val = (g) => s.querySelector(`[data-group="${g}"].is-selected`)?.dataset.value;
    const line = (d, p) => (d && p ? `${d.replace(/\//g, ' / ')} no turno da ${p === 'Manhã' ? 'manhã' : p === 'Tarde' ? 'tarde' : 'noite'}` : '—');
    const lines = { 1: line(val('date1'), val('slot1')), 2: line(val('date2'), val('slot2')) };
    device.querySelectorAll('[data-proto-date-line]').forEach((el) => { el.textContent = lines[el.dataset.protoDateLine]; });
  }

  /* ---------- order summary accordions ---------- */
  let reviewed = false;
  function toggleSection(head, { scroll = true } = {}) {
    const sec = head.closest('[data-acc]');
    const open = !sec.classList.contains('is-open');
    sec.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', String(open));
    if (open && sec.dataset.acc !== 'plan') reviewed = true;
    if (open && scroll) {
      const sc = current().querySelector('[data-proto-scroll]');
      if (sc) setTimeout(() => sc.scrollTo({ top: sec.offsetTop - 12, behavior: reduceMotion.matches ? 'auto' : 'smooth' }), 120);
    }
    render();
    if (tour) scheduleTap(1700);
  }
  function resetSummary() {
    reviewed = false;
    const s = screens[INDEX.summary];
    s.querySelectorAll('[data-acc]').forEach((sec) => {
      const open = sec.dataset.acc === 'plan';
      sec.classList.toggle('is-open', open);
      sec.querySelector('[data-acc-toggle]').setAttribute('aria-expanded', String(open));
    });
    s.querySelector('[data-proto-scroll]').scrollTop = 0;
  }

  function resetSelections(s) {
    s.querySelectorAll('[data-group]').forEach((o) => { o.classList.remove('is-selected', 'is-disabled'); o.disabled = false; });
  }

  /* ---------- per-screen entry ---------- */
  function enter() {
    const s = current();
    if (id() === 'cpf') { cpf = ''; showCpf(); if (tour) autoTypeCpf(); }
    if (REQUIRED[id()]) resetSelections(s);
    if (id() === 'schedule') writeSchedule();
    if (id() === 'summary') resetSummary();
    if (id() === 'bio') {
      s.classList.remove('is-verified');
      const bar = s.querySelector('.op-progress span');
      bar.style.transition = 'none'; bar.style.width = '6%';
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = ''; bar.style.width = '100%'; }));
      later(() => s.classList.add('is-verified'), 2200);
    }
    if (SCREENS[step].auto) later(() => go(step + 1), SCREENS[step].auto);
    render();
    if (tour) scheduleTap();
  }

  /* ---------- navigation ---------- */
  function go(next, { instant = false } = {}) {
    clearTimers();
    clearTour();
    typing = false;
    if (instant) wrap.classList.add('op-no-anim');
    step = (next + SCREENS.length) % SCREENS.length;
    enter();
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('op-no-anim')));
  }

  // client <-> offers are tabs of the same screen: switch without the slide
  const isTabSwitch = (a, b) => [a, b].every((i) => i === INDEX.client || i === INDEX.offers);

  function act(el) {
    const kind = el.dataset.act;
    if (kind === 'select') { select(el); return; }
    if (kind === 'restart') { go(0); return; }
    if (kind === 'goto') { go(INDEX[el.dataset.to]); return; }
    if (kind === 'next') go(step + 1, { instant: isTabSwitch(step, step + 1) });
  }

  device.addEventListener('click', (e) => {
    const trusted = e.isTrusted;
    const key = e.target.closest('[data-key]');
    if (key) {
      if (trusted) stopTour();
      if (!typing) pressKey(key.dataset.key);
      return;
    }
    const tab = e.target.closest('[data-proto-tab]');
    if (tab) { if (trusted) stopTour(); go(INDEX[tab.dataset.protoTab], { instant: true }); return; }
    const back = e.target.closest('[data-proto-back]');
    if (back) { if (trusted) stopTour(); if (step > 0) go(step - 1, { instant: isTabSwitch(step, step - 1) }); return; }
    const head = e.target.closest('[data-acc-toggle]');
    if (head) { if (trusted) stopTour(); toggleSection(head); return; }
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    if (trusted) stopTour();
    act(el);
  });

  stepButtons.forEach((b) => b.addEventListener('click', () => { stopTour(); go(Number(b.dataset.step)); }));

  /* ---------- guided tour ---------- */
  /*
   * Tour pointer. It stays on screen for the whole tour and glides from one
   * control to the next (speed scales with distance), so it never pops or
   * sweeps across from an old spot. Only one move can be pending at a time.
   */
  let tourTimers = [];
  let fingerPos = null;
  const tourLater = (fn, ms) => { const t = setTimeout(fn, reduceMotion.matches ? Math.min(ms, 300) : ms); tourTimers.push(t); };
  function clearTour() { tourTimers.forEach(clearTimeout); tourTimers = []; finger.classList.remove('is-tapping'); }

  function hideFinger() {
    clearTour();
    finger.classList.remove('is-visible');
    fingerPos = null;
  }

  function moveFinger(x, y) {
    if (!fingerPos || !finger.classList.contains('is-visible')) {
      // first appearance: place it instantly, then fade in
      finger.style.transition = 'none';
      finger.style.transform = `translate(${x}px, ${y}px)`;
      void finger.offsetWidth;
      finger.style.transition = '';
      finger.classList.add('is-visible');
      fingerPos = { x, y };
      return 320;
    }
    const dist = Math.hypot(x - fingerPos.x, y - fingerPos.y);
    const ms = reduceMotion.matches ? 0 : Math.round(Math.min(900, Math.max(420, dist * 1.6)));
    finger.style.setProperty('--op-move', `${ms}ms`);
    finger.style.transform = `translate(${x}px, ${y}px)`;
    fingerPos = { x, y };
    return ms;
  }

  // wait for the screen to settle (slide = 450ms) before measuring the target
  function scheduleTap(delay) {
    clearTour();
    if (!tour || SCREENS[step].auto || typing) return;
    if (!visible()) { inView = false; tourLater(() => scheduleTap(delay), 800); return; }
    inView = true;
    const target = targetFor();
    if (!target) return;
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
    }, delay || (id() === 'done' ? 3200 : 900));
  }

  function setTour(on) {
    tour = on;
    tourBtn.setAttribute('aria-pressed', String(on));
    root.classList.toggle('is-touring', on);
    if (!on) {
      clearTimers();
      hideFinger();
      typing = false;
      if (id() === 'bio' && !current().classList.contains('is-verified')) later(() => current().classList.add('is-verified'), 1200);
      if (SCREENS[step].auto) later(() => go(step + 1), SCREENS[step].auto);
      render();
    } else if (id() === 'cpf' && cpf.length < 11) {
      autoTypeCpf();
    } else scheduleTap();
  }

  function stopTour() { if (tour) setTour(false); }

  tourBtn.addEventListener('click', () => setTour(!tour));
  replayBtn.addEventListener('click', () => { tour = true; root.classList.add('is-touring'); tourBtn.setAttribute('aria-pressed', 'true'); go(0); });

  /* ---------- start when visible (the case study scrolls inside its own panel) ---------- */
  // the observer only nudges; visibility itself is measured with visible()
  const io = new IntersectionObserver(() => {
    const was = inView;
    inView = visible();
    if (inView && !was && tour) scheduleTap();
    if (!inView && was) hideFinger();
  }, { root: scroller || null, threshold: [0, 0.45, 1] });
  io.observe(device);

  // start over (tour on) every time the case study opens
  const panel = root.closest('.orla-case');
  if (panel) {
    new MutationObserver(() => {
      if (panel.classList.contains('is-open') && !root.dataset.started) {
        root.dataset.started = '1';
        tour = !reduceMotion.matches;
        root.classList.toggle('is-touring', tour);
        tourBtn.setAttribute('aria-pressed', String(tour));
        go(0);
      }
      if (!panel.classList.contains('is-open')) delete root.dataset.started;
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  }

  tour = !reduceMotion.matches;
  root.classList.toggle('is-touring', tour);
  tourBtn.setAttribute('aria-pressed', String(tour));
  go(0);
})();
