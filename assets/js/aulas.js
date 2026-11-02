/* =====================================================================
   DOBRA 3 — Aulas: grade (filtros, dia de hoje), configurador de plano
   (placar que rola), avulsos e mapa. Fábricas do DS Abbott.
   ===================================================================== */
(function () {
  'use strict';
  var d = document.documentElement;
  var hasG = !!(window.gsap && window.ScrollTrigger && window.SplitText);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = $('#aulas'); if (!root) return;
  var WA = 'https://wa.me/5515997421167'; // WhatsApp do Guilherme: +55 15 99742-1167
  var inOut = hasG && gsap.parseEase('dsInOut') ? 'dsInOut' : 'power3.inOut';
  var expo = hasG && gsap.parseEase('dsExpo') ? 'dsExpo' : 'expo.out';

  /* ================= GRADE ================= */
  var slots = $$('[data-slot]', root);
  // Filtros (DS .chip)
  $$('[data-filter]', root).forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      $$('[data-filter]', root).forEach(function (c) { var on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      slots.forEach(function (s, i) {
        var cats = (s.dataset.cat || '').split(' ');
        var match = f === 'all' ? true : cats.indexOf(f) > -1;
        s.style.transitionDelay = (i % 6) * 25 + 'ms';
        s.classList.toggle('is-dim', !match);
        if (s.tagName === 'A') { if (match) s.removeAttribute('tabindex'); else s.setAttribute('tabindex', '-1'); }
      });
    });
  });

  // Destaca o dia de hoje (só seg–qui)
  var now = new Date(); var wd = now.getDay();
  var todayCol = $('.board-day[data-day="' + wd + '"]', root);
  if (todayCol) {
    todayCol.classList.add('is-today');
    var hc = $('.board-headcell[data-day="' + wd + '"]', root); if (hc) hc.classList.add('is-today');
  }
  // Celular: abas de dia (lista de turmas do dia escolhido)
  var tabs = $$('.day-tab', root), dayCols = $$('.board-day', root), thumbBar = $('.day-tabs', root);
  function showDay(n, animate) {
    tabs.forEach(function (t) { var on = +t.dataset.daytab === n; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
    if (thumbBar) thumbBar.style.setProperty('--i', n - 1);
    dayCols.forEach(function (c) { c.classList.toggle('is-shown', +c.dataset.day === n); });
    var col = $('.board-day[data-day="' + n + '"]', root);
    if (animate && hasG && !reduce && col) gsap.fromTo($$('.slot:not(.is-dim)', col), { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.05, ease: 'expo.out', clearProps: 'transform,opacity,visibility' });
  }
  function checkEmpty() { dayCols.forEach(function (c) { c.classList.toggle('is-empty', !$$('.slot:not(.is-dim)', c).length); }); }
  tabs.forEach(function (t, i) {
    if (+t.dataset.daytab === wd) t.classList.add('is-today');
    t.addEventListener('click', function () { showDay(+t.dataset.daytab, true); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!k) return;
      var n = ((i + k + 4) % 4) + 1; showDay(n, true); tabs[n - 1].focus();
    });
  });
  showDay(wd >= 1 && wd <= 4 ? wd : 1, false);
  $$('[data-filter]', root).forEach(function (chip) { chip.addEventListener('click', function () { setTimeout(checkEmpty, 0); }); });

  // Tablet: a grade já abre no dia de hoje
  var scroller = $('.board-scroll', root);
  if (todayCol && scroller && window.innerWidth <= 1024 && window.innerWidth > 767) {
    setTimeout(function () { scroller.scrollLeft = todayCol.offsetLeft - 56; }, 50);
  }

  /* ================= CONFIGURADOR DE PLANO ================= */
  var PRICES = { // tabela 2025 da arena Resenha (valor mensal em cada plano)
    turma:    { mensal: [305, 485, 665], trimestral: [285, 430, 565], semestral: [255, 405, 535], anual: [245, 370, 470] },
    treino:   { trimestral: 390, semestral: 380, anual: 360 },
    personal: { mensal: [400, 780], trimestral: [385, 765], semestral: [370, 750], anual: [350, 735] }
  };
  var form = $('.cfg', root);
  var priceEl = $('[data-price]', root);
  var saveEl = $('[data-save]', root), saveVal = $('[data-save-val]', root), saveTxt = saveEl && saveEl.querySelector('small');
  var summaryEl = $('[data-summary]', root), linkEl = $('[data-plan-link]', root), card = $('[data-tilt]', root);
  var hintFreq = $('[data-hint="freq"]', root), hintPlano = $('[data-hint="plano"]', root);
  var MOD = { turma: 'Turma', treino: 'Treino 1h30', personal: 'Personal' };
  var PLAN = { mensal: 'mensal', trimestral: 'trimestral', semestral: 'semestral', anual: 'anual' };
  var radios = function (n) { return $$('input[name="' + n + '"]', form); };
  var val = function (n) { var r = form.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : null; };
  var setVal = function (n, v) { radios(n).forEach(function (r) { r.checked = r.value === v; }); };

  // Placar: cada dígito é uma coluna 0–9 que rola
  var digits = [];
  function buildOdo(n) {
    priceEl.innerHTML = '';
    String(n).split('').forEach(function (ch) {
      var w = document.createElement('span'); w.className = 'odo'; w.setAttribute('aria-hidden', 'true');
      var col = document.createElement('span'); col.className = 'odo-col';
      for (var i = 0; i < 10; i++) { var s = document.createElement('span'); s.textContent = i; col.appendChild(s); }
      w.appendChild(col); priceEl.appendChild(w); digits.push(col);
      if (hasG) gsap.set(col, { yPercent: -parseInt(ch, 10) * 10 });
    });
  }
  function rollTo(n, instant) {
    var str = String(n);
    if (str.length !== digits.length) { digits = []; buildOdo(n); return; }
    str.split('').forEach(function (ch, i) {
      var y = -parseInt(ch, 10) * 10;
      if (!hasG || instant) { if (hasG) gsap.set(digits[i], { yPercent: y }); else digits[i].style.transform = 'translateY(' + y + '%)'; }
      else gsap.to(digits[i], { yPercent: y, duration: 0.9 + i * 0.12, ease: 'expo.out', overwrite: true });
    });
    priceEl.setAttribute('aria-label', n + ' reais por mês');
  }

  function update(animate) {
    var mod = val('mod');
    // Regras da tabela: treino 1h30 não tem mensal nem frequência; personal vai até 2x
    radios('freq').forEach(function (r) { r.disabled = mod === 'treino' || (mod === 'personal' && r.value === '2'); });
    radios('plano').forEach(function (r) { r.disabled = mod === 'treino' && r.value === 'mensal'; });
    if (mod === 'personal' && val('freq') === '2') setVal('freq', '1');
    if (mod === 'treino' && val('plano') === 'mensal') setVal('plano', 'trimestral');
    $('[data-step="freq"]', form).classList.toggle('is-na', mod === 'treino');
    hintFreq.textContent = mod === 'treino' ? 'Treino de 1h30 tem valor único por plano.' : mod === 'personal' ? 'Personal: 1x ou 2x por semana.' : '';
    hintPlano.textContent = mod === 'treino' ? 'Treino de 1h30: planos trimestral, semestral ou anual.' : '';

    var plano = val('plano'), f = parseInt(val('freq'), 10);
    var price = mod === 'treino' ? PRICES.treino[plano] : PRICES[mod][plano][f];
    var base = mod === 'treino' ? PRICES.treino.trimestral : PRICES[mod].mensal[f];
    var save = base - price;
    var summary = MOD[mod] + (mod === 'treino' ? '' : ' · ' + (f + 1) + 'x por semana') + ' · ' + PLAN[plano];
    summaryEl.textContent = summary;
    linkEl.href = WA + '?text=' + encodeURIComponent('Oi, Guilherme! Vi no site e quero o plano: ' + summary + ' (R$ ' + price + ',00 por mês).');
    rollTo(price, !animate);

    if (save > 0) {
      saveVal.textContent = 'R$ ' + save;
      if (saveTxt) saveTxt.textContent = 'a menos por mês que o ' + (mod === 'treino' ? 'trimestral' : 'mensal');
      var wasHidden = saveEl.classList.contains('is-hidden');
      saveEl.classList.remove('is-hidden');
      if (hasG && animate) gsap.fromTo(saveEl, { scale: wasHidden ? 0 : 0.85, rotate: wasHidden ? -40 : 4 }, { scale: 1, rotate: 10, duration: 0.8, ease: 'back.out(1.7)', overwrite: true });
    } else if (hasG && animate && !saveEl.classList.contains('is-hidden')) {
      gsap.to(saveEl, { scale: 0, rotate: -30, duration: 0.35, ease: 'power2.in', onComplete: function () { saveEl.classList.add('is-hidden'); gsap.set(saveEl, { scale: 1, rotate: 10 }); } });
    } else { saveEl.classList.add('is-hidden'); }

    if (hasG && animate && !reduce) gsap.fromTo(card, { rotationY: -10 }, { rotationY: 0, duration: 1, ease: 'elastic.out(1, 0.6)' });
    moveThumbs(animate);
  }

  // Pílula que desliza por trás da opção escolhida
  function moveThumbs(animate) {
    $$('.seg', form).forEach(function (seg) {
      var thumb = $('.seg-thumb', seg);
      var lab = seg.querySelector('input:checked'); if (!lab) return; lab = lab.parentElement;
      var x = lab.offsetLeft, w = lab.offsetWidth;
      if (hasG && animate && !reduce) gsap.to(thumb, { x: x, width: w, duration: 0.6, ease: 'expo.out' });
      else if (hasG) gsap.set(thumb, { x: x, width: w });
      else { thumb.style.transform = 'translateX(' + x + 'px)'; thumb.style.width = w + 'px'; }
    });
  }
  form.addEventListener('change', function () { update(true); });
  window.addEventListener('resize', function () { moveThumbs(false); });
  buildOdo(305);
  update(false);

  // Card de preço inclina com o mouse
  if (hasG && fine && !reduce) {
    var stage = $('.plan-stage', root);
    gsap.set(card, { rotation: -1.5, transformPerspective: 1200 });
    var rx = gsap.quickTo(card, 'rotationX', { duration: 0.8, ease: 'power3' });
    var ry = gsap.quickTo(card, 'rotationY', { duration: 0.8, ease: 'power3' });
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 12);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
    });
    stage.addEventListener('mouseleave', function () { rx(0); ry(0); });
  }

  /* Pino do mapa no fim da rota (o SVG usa "slice", então calcula na tela) */
  var route = $('[data-route]', root), pin = $('.map-pin', root), map = $('.map', root);
  function placePin() {
    if (!route || !pin) return;
    var m = route.getScreenCTM(); if (!m) return;
    var pt = route.getPointAtLength(route.getTotalLength()); var r = map.getBoundingClientRect();
    pin.style.left = (pt.x * m.a + m.e - r.left) + 'px'; pin.style.top = (pt.y * m.d + m.f - r.top) + 'px';
  }
  placePin(); window.addEventListener('resize', placePin); window.addEventListener('load', placePin);

  /* ================= REVELAÇÕES ================= */
  if (!hasG || reduce) { if (hasG) gsap.set('[data-a]', { autoAlpha: 1 }); return; }

  function init() {
    // Fundo da dobra
    $$('.aulas .gold-line-decor').forEach(function (el, i) {
      gsap.fromTo(el, { yPercent: -20 }, { yPercent: 20, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.5 + (i % 3) * 0.6 } });
    });
    gsap.fromTo($$('.aulas .bg-court > *'), { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', stagger: 0.05,
      scrollTrigger: { trigger: root, start: 'top 85%', end: 'center 40%', scrub: 1 } });
    gsap.fromTo('.aulas [data-giant]', { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 } });

    // Cabeçalho
    var head = $('.aulas-head', root);
    var tl = gsap.timeline({ defaults: { ease: expo }, scrollTrigger: { trigger: head, start: 'top 78%', once: true } });
    var tag = $('[data-a="tag"]', head);
    tl.fromTo(tag, { autoAlpha: 0, x: 90 }, { autoAlpha: 1, x: 0, duration: 1.2 }, 0)
      .fromTo($('.section-tag-line', tag), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0.2);
    var t = $('[data-a="split"]', head); gsap.set(t, { autoAlpha: 1 });
    var sp = SplitText.create(t, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    tl.fromTo(sp.lines, { yPercent: 110, rotate: 2.5, transformOrigin: '0% 100%' }, { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.12, ease: 'power4.out' }, 0.1)
      .fromTo($('[data-a="text"]', head), { autoAlpha: 0, y: 40, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.2, clearProps: 'filter' }, 0.4);
    var pills = $('[data-a="pills"]', head); gsap.set(pills, { autoAlpha: 1 });
    tl.fromTo(pills.children, { autoAlpha: 0, scale: 0.6, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'back.out(1.7)' }, 0.7);

    // Títulos de bloco
    $$('.block-head[data-a="text"]', root).forEach(function (el) {
      gsap.fromTo(el, { autoAlpha: 0, y: 50, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: expo, clearProps: 'filter',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // Grade: o quadro abre de baixo (Elyse clip), dias e horas entram, turmas caem em cascata por dia
    var board = $('[data-a="board"]', root);
    var btl = gsap.timeline({ defaults: { ease: expo }, scrollTrigger: { trigger: board, start: 'top 80%', once: true } });
    gsap.set(board, { autoAlpha: 1 });
    btl.fromTo(board, { clipPath: 'inset(100% 0% 0% 0% round 1.25rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 1.25rem)', duration: 1.3, ease: inOut, clearProps: 'clipPath' }, 0)
      .fromTo($$('.chip', board), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.04 }, 0.6)
      .fromTo($$('.board-headcell', board), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.7)
      .fromTo($$('.board-rail span', board), { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.04 }, 0.8);
    $$('.board-day', board).forEach(function (day, di) {
      btl.fromTo($$('.slot', day), { autoAlpha: 0, yPercent: 40, scale: 0.92 },
        { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.9, stagger: 0.07, clearProps: 'transform,opacity,visibility' }, 0.95 + di * 0.12);
    });

    // Configurador: passos entram da direita; card cai girando e o placar rola de 000
    var cfg = $('[data-a="cfg"]', root); gsap.set(cfg, { autoAlpha: 1 });
    var plan = $('[data-a="plan"]', root); gsap.set(plan, { autoAlpha: 1 });
    var ptl = gsap.timeline({ defaults: { ease: expo }, scrollTrigger: { trigger: '.planos', start: 'top 75%', once: true } });
    ptl.fromTo(cfg.children, { autoAlpha: 0, x: 80, filter: 'blur(8px)' }, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.1, clearProps: 'filter' }, 0)
      .fromTo(card, { autoAlpha: 0, y: 120, rotation: 8, scale: 0.9 }, { autoAlpha: 1, y: 0, rotation: -1.5, scale: 1, duration: 1.4 }, 0.15)
      .add(function () { digits.forEach(function (c) { gsap.set(c, { yPercent: 0 }); }); update(true); }, 0.55);

    // Avulsos + local: cascata (DS stagger) + rota do mapa se desenha + pino cai
    var ex = $('[data-a="extras"]', root); gsap.set(ex, { autoAlpha: 1 });
    var etl = gsap.timeline({ defaults: { ease: expo }, scrollTrigger: { trigger: ex, start: 'top 80%', once: true } });
    etl.fromTo(ex.children, { autoAlpha: 0, yPercent: 30, scale: 0.96 }, { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1.1, stagger: 0.12 }, 0)
      .fromTo($('.feature-sticker', ex), { scale: 0, rotate: -30 }, { scale: 1, rotate: 4, duration: 0.8, ease: 'back.out(1.7)' }, 0.6)
      .fromTo($('[data-route]', ex), { drawSVG: '0%' }, { drawSVG: '100%', duration: 2, ease: 'power2.inOut' }, 0.6)
      .fromTo($('.map-pin', ex), { autoAlpha: 0, y: -60 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'bounce.out' }, 2.2);

    // Cursor cresce nos novos interativos
    var cursor = $('.cursor-ball');
    if (cursor && fine) $$('.seg label, .chip, .slot', root).forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
    ScrollTrigger.refresh();
  }
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(function (r) { setTimeout(r, 1500); })]).then(function () { setTimeout(init, 0); });

  // Segurança: nada fica escondido
  setInterval(function () {
    $$('[data-a]', root).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (getComputedStyle(el).visibility === 'hidden' && r.top < window.innerHeight * 0.5 && r.bottom > 0) {
        el.__w = el.__w || Date.now();
        if (Date.now() - el.__w > 3000) gsap.set(el, { autoAlpha: 1 });
      }
    });
  }, 1000);
})();
