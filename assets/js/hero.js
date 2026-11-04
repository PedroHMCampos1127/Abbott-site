/* =====================================================================
   Interações da hero — baseado em assets/DS Abbott/assets/js/abbott.js
   ===================================================================== */
(function () {
  'use strict';
  var d = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function noIntro() { clearTimeout(window.__introFallback); d.classList.remove('js'); d.classList.add('no-intro'); }
  if (!window.gsap || !window.SplitText || !window.CustomEase || !window.DrawSVGPlugin || !window.MotionPathPlugin) { noIntro(); return; }

  gsap.registerPlugin(SplitText, DrawSVGPlugin, MotionPathPlugin, CustomEase);
  // Easings exatos do DS (as mesmas curvas do CSS: --ease-inout e --ease-out-expo)
  CustomEase.create('dsInOut', '0.65,0,0.35,1');
  CustomEase.create('dsExpo', '0.16,1,0.3,1');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var hero = $('.hero');
  var curtain = $('.page-curtain');
  var titleLines = $$('[data-hero="title"]');
  var tag = $('[data-hero="tag"]');
  var sub = $('[data-hero="subtitle"]');
  var actions = $('[data-hero="actions"]');
  var heroImage = $('[data-hero="image"]');
  var heroImg = $('.hero-image img');
  var heroInner = $('.hero-image-inner');
  var badge = $('[data-hero="badge"]');
  var badgeRing = badge && badge.querySelector('svg');
  var scrollInd = $('[data-hero="scroll"]');
  var court = $('.bg-court');
  var navItems = $$('[data-nav-item]');
  var arcWrap = $('.hero-arc');
  var arcPath = arcWrap && arcWrap.querySelector('path');
  var ball = arcWrap && arcWrap.querySelector('.ball');
  var impact = arcWrap && arcWrap.querySelector('.ball-impact');
  var isDesktop = function () { return window.innerWidth > 1024; };

  /* ---------- Menu mobile (DS, com aria) ---------- */
  var hamburger = $('#hamburger');
  var mobileNav = $('#mobileNav');
  function setMenu(open) {
    hamburger.classList.toggle('active', open);
    mobileNav.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  hamburger.addEventListener('click', function () { setMenu(!mobileNav.classList.contains('active')); });
  $$('a', mobileNav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mobileNav.classList.contains('active')) { setMenu(false); hamburger.focus(); } });

  /* ---------- Selo: giro contínuo que acelera no hover ---------- */
  var spin = null;
  if (badgeRing && !reduce) {
    spin = gsap.to(badgeRing, { rotation: 360, duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' }); // DS spinSlow 18s linear
    badge.addEventListener('mouseenter', function () { gsap.to(spin, { timeScale: 3, duration: 0.8, ease: 'power2.out' }); });
    badge.addEventListener('mouseleave', function () { gsap.to(spin, { timeScale: 1, duration: 1.2, ease: 'power2.out' }); });
  }

  /* ---------- Cursor bolinha (DS quickTo .35 power3) ---------- */
  var cursor = $('.cursor-ball');
  if (cursor && finePointer) {
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    var cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    var first = true;
    window.addEventListener('mousemove', function (e) {
      if (first) { gsap.set(cursor, { x: e.clientX, y: e.clientY }); cursor.classList.add('is-on'); first = false; }
      cx(e.clientX); cy(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); first = true; });
    $$('a, button, [data-magnetic], .hero-badge, .title-stroke').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  /* ---------- Botões magnéticos (DS elastic.out(1, 0.4)) ---------- */
  if (finePointer && !reduce) {
    $$('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.dataset.magnetic) || 0.35;
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- Parallax do mouse (foto, quadra) + brilho no lado escuro ---------- */
  if (finePointer && !reduce && hero) {
    var glow = $('.hero-glow');
    var gx = gsap.quickTo(glow, 'x', { duration: 0.9, ease: 'power3' });
    var gy = gsap.quickTo(glow, 'y', { duration: 0.9, ease: 'power3' });
    var px = gsap.quickTo(heroInner, 'x', { duration: 1.2, ease: 'power3' });
    var py = gsap.quickTo(heroInner, 'y', { duration: 1.2, ease: 'power3' });
    var kx = gsap.quickTo(court, 'x', { duration: 1.4, ease: 'power3' });
    var ky = gsap.quickTo(court, 'y', { duration: 1.4, ease: 'power3' });
    var glowOn = false;
    hero.addEventListener('mousemove', function (e) {
      if (!isDesktop()) return;
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      px(nx * -26); py(ny * -20);
      kx(nx * 12); ky(ny * 8);
      gx(e.clientX - r.left); gy(e.clientY - r.top);
      var onDark = e.clientX - r.left < r.width / 2;
      if (onDark !== glowOn) { glowOn = onDark; gsap.to(glow, { opacity: onDark ? 1 : 0, duration: 0.6, ease: 'power2.out' }); }
    });
    hero.addEventListener('mouseleave', function () {
      px(0); py(0); kx(0); ky(0); glowOn = false;
      gsap.to(glow, { opacity: 0, duration: 0.6 });
    });
  }

  /* ---------- Lob da bolinha em loop (DS MotionPath) ---------- */
  function placeImpact() {
    if (!arcPath || !impact) return;
    var len = arcPath.getTotalLength();
    var pt = arcPath.getPointAtLength(len);
    var m = arcPath.getScreenCTM();
    var r = arcWrap.getBoundingClientRect();
    if (!m) return;
    gsap.set(impact, { x: pt.x * m.a + m.e - r.left, y: pt.y * m.d + m.f - r.top });
  }
  function ballLoop() {
    if (!arcPath || !ball) return null;
    placeImpact();
    window.addEventListener('resize', placeImpact);
    var mp = { path: arcPath, align: arcPath, alignOrigin: [0.5, 0.5], autoRotate: false };
    var loop = gsap.timeline({ repeat: -1, repeatDelay: 2.2, paused: true });
    loop
      .fromTo(ball, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0)
      .fromTo(ball, { motionPath: Object.assign({}, mp, { start: 0, end: 0 }) },
        { motionPath: Object.assign({}, mp, { start: 0, end: 1 }), duration: 3.2, ease: 'power1.inOut' }, 0)
      .to(ball, { scale: 0.35, autoAlpha: 0, duration: 0.22, ease: 'power2.in' }, 3.0)
      .fromTo(impact, { scale: 0.2, autoAlpha: 0.9 }, { scale: 2.8, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 3.12);
    return loop;
  }

  /* ---------- Movimento reduzido: sem intro, tudo no lugar ---------- */
  // Também quando o fallback de 5s já mostrou a página: não refaz a intro por cima do conteúdo
  if (reduce || d.classList.contains('no-intro')) {
    noIntro();
    gsap.set([titleLines, tag, sub, actions, badge, scrollInd, heroImage, navItems], { autoAlpha: 1 });
    gsap.fromTo('.hero-content, .hero-image', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' });
    return;
  }

  /* ---------- INTRO + HERO: uma timeline só ----------
     Tempos absolutos idênticos ao DS:
       0.00 logo sobe (slideUpCSS .7s expo) · 0.15 camada azul-noite sobe (.9s inout)
       0.90 cortina sai para cima (1.1s inout) · 1.20 foto (DS heroImgReveal começava aqui)
       1.35 título (DS heroTL delay 1.35) · 1.60 eyebrow (DS fadeUp delay 1.6) · 1.60 quadra (DS data-delay 1.6)
       1.90 linha do eyebrow (DS lineCss delay 1.9) · +0.7 texto · +0.95 botões · +1.1 selo · +1.5 scroll */
  function build() {
  var HERO = 1.35;
  var master = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

  // Estados iniciais (aplicados antes do primeiro frame da timeline, por baixo da cortina)
  gsap.set(heroImage, { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set(heroImg, { scale: 1.15 });
  gsap.set(navItems, { autoAlpha: 0, y: -14 });

  // 1) Cortina
  master
    .to('.page-curtain-logo span', { y: 0, opacity: 1, duration: 0.7, ease: 'dsExpo' }, 0)
    .fromTo('.page-curtain-layer', { y: 0, yPercent: 101 }, { yPercent: 0, duration: 0.9, ease: 'dsInOut' }, 0.15)
    .to(curtain, { yPercent: -101, duration: 1.1, ease: 'dsInOut' }, 0.9)
    // refinamento: o logo sai um pouco mais rápido que a cortina e some no fio da borda (sem "colar" no topo)
    .to('.page-curtain-logo span', { yPercent: -40, opacity: 0, duration: 0.7, ease: 'power2.in' }, 1.0)
    .set(curtain, { display: 'none' }, 2.0);

  // 2) Foto: clip-path de baixo para cima (mesmo sentido da cortina) + zoom-out 1.15 → 1
  master
    .to(heroImage, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'dsInOut' }, 1.2)
    .to(heroImg, { scale: 1, duration: 2.2, ease: 'dsExpo' }, 1.2);

  // 3) Título: caracteres saindo da máscara (DS heroTL: yPercent 115, rotate 10, 1.4s, stagger .045, power4.out, i * .18)
  var splits = [];
  titleLines.forEach(function (el, i) {
    gsap.set(el, { autoAlpha: 1 });
    var sp = SplitText.create(el, { type: 'words,chars', mask: 'chars', charsClass: 'char', wordsClass: 'word' });
    splits.push(sp);
    master.fromTo(sp.chars, { yPercent: 115, rotate: 10 }, { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.045, ease: 'power4.out' }, HERO + i * 0.18);
  });

  // 4) Eyebrow (DS fadeUp .8s expo @1.6 + lineCss 1s expo @1.9)
  master
    .fromTo(tag, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'dsExpo' }, 1.6)
    .fromTo('.hero-tag-line', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'dsExpo' }, 1.9);

  // 5) Texto, botões, selo, scroll (DS heroTL)
  master
    .fromTo(sub, { autoAlpha: 0, y: 40, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.2, clearProps: 'filter' }, HERO + 0.7)
    .set(actions, { autoAlpha: 1 }, HERO + 0.95)
    .fromTo(actions.children, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, HERO + 0.95)
    .fromTo(badge, { autoAlpha: 0, scale: 0, rotate: -90 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(1.6)' }, HERO + 1.1)
    .fromTo(scrollInd, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1 }, HERO + 1.5);

  // 6) Nav entra quando a cortina libera o topo da tela (borda passa pelo header ~1.85s)
  master.to(navItems, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06, ease: 'dsExpo' }, 1.7);

  // 7) Linhas de quadra (DS draw: 2.2s power2.inOut stagger .12 @1.6)
  var courtShapes = $$('rect, line, path', court);
  master
    .set(courtShapes, { visibility: 'visible' }, 1.6)
    .fromTo(courtShapes, { drawSVG: '0%' }, { drawSVG: '100%', duration: 2.2, ease: 'power2.inOut', stagger: 0.12 }, 1.6);

  // 8) Arco tracejado aparece e a bolinha começa o loop
  var loop = ballLoop();
  window.__abbottBall = loop;
  if (arcWrap) master.to(arcWrap.querySelector('.ball-arc'), { opacity: 1, duration: 1.2, ease: 'power2.out' }, 2.5);
  if (loop) master.call(function () { if (isDesktop()) loop.play(0); }, null, 3.1);

  // Fim: devolve o título ao HTML original (o hover que preenche o contorno precisa do texto inteiro)
  master.call(function () { window.__abbottIntroDone = true; document.dispatchEvent(new Event('abbott:intro-done')); }, null, 2.0);
  master.call(function () {
    splits.forEach(function (sp) { sp.revert(); });
    gsap.set(titleLines, { autoAlpha: 1 });
  });

  // Pausa o loop da bolinha no mobile / aba oculta
  window.addEventListener('resize', function () {
    if (!loop) return;
    if (isDesktop()) { if (loop.paused() && master.progress() === 1) loop.play(); } else { loop.pause(); gsap.set(ball, { autoAlpha: 0 }); }
  });
  return master;
  }

  // Começa quando as fontes estiverem prontas (evita o logo da intro piscar em fonte reserva), no máximo 1.2s de espera
  var started = false;
  function start() {
    if (started || d.classList.contains('no-intro')) return; started = true;
    d.classList.add('is-ready');
    clearTimeout(window.__introFallback);
    build().play(0); // SplitText só depois das fontes: as linhas medem certo
  }
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]).then(start);
  } else { start(); }
})();
