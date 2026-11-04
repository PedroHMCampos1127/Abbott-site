/* =====================================================================
   DOBRA 2 — rolagem (Lenis + ScrollTrigger), nav em rolagem, passagem,
   "Conheça o professor" (entrada da direita para a esquerda) e fotos passando.
   Fábricas e valores do assets/DS Abbott/assets/js/abbott.js
   ===================================================================== */
(function () {
  'use strict';
  var d = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return; // o fallback da hero já mostra tudo
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var EASE_OUT = 'expo.out';
  var inOut = gsap.parseEase('dsInOut') ? 'dsInOut' : 'power3.inOut';
  var expo = gsap.parseEase('dsExpo') ? 'dsExpo' : 'expo.out';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!d.classList.contains('no-intro')) window.scrollTo(0, 0); // fallback já mostrou a página: não puxa a pessoa de volta ao topo

  /* ---------- Lenis (DS) — travado enquanto a intro roda ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    if (!d.classList.contains('no-intro')) {
      lenis.stop();
      var unlock = function () { lenis.start(); };
      document.addEventListener('abbott:intro-done', unlock, { once: true });
      setTimeout(unlock, 6500); // segurança
    }
  }

  /* ---------- Âncoras ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = id === '#top' ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY;
      if (lenis) lenis.scrollTo(top, { duration: 1.6 }); else window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---------- NAV: .scrolled (Blade) + some ao descer (Quoti) + item ativo ---------- */
  var nav = $('#nav');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 80);
    if (window.innerWidth >= 992) nav.classList.toggle('is-hidden', y > 300 && y > lastY + 4);
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  var links = $$('.nav-links a, .mobile-nav a:not(.nav-cta)');
  function setActive(hash) {
    links.forEach(function (l) {
      var on = l.getAttribute('href') === hash;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
    });
  }
  ['#professor', '#aulas', '#parcerias'].forEach(function (id, i, all) {
    ScrollTrigger.create({ trigger: id, start: 'top 55%', end: 'bottom 55%', refreshPriority: -1,
      onToggle: function (self) { if (self.isActive) setActive(id); else if (self.direction < 0) setActive(i ? all[i - 1] : '#top'); } });
  });

  /* ---------- Bolinha da hero pausa fora da tela (desempenho) ---------- */
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top',
    onLeave: function () { if (window.__abbottBall) window.__abbottBall.pause(); },
    onEnterBack: function () { if (window.__abbottBall && window.innerWidth > 1024 && window.__abbottIntroDone) window.__abbottBall.resume(); } });

  /* ---------- Movimento reduzido: tudo visível, sem pin ---------- */
  if (reduce) {
    gsap.set('[data-r]', { autoAlpha: 1 });
    $$('.pain-point_wrap').forEach(function (w) { w.classList.add('no-pin'); });
    return;
  }

  function init() {
    /* Passagem: as duas faixas derivam em sentidos opostos com o scroll */
    gsap.fromTo('.marquee-drift.is-a', { xPercent: 2 }, { xPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.marquee-pass', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.fromTo('.marquee-drift.is-b', { xPercent: -3 }, { xPercent: 3, ease: 'none',
      scrollTrigger: { trigger: '.marquee-pass', start: 'top bottom', end: 'bottom top', scrub: 1 } });

    /* Fundo: linhas finas (Blade), quadra que se desenha (Quoti), texto gigante, bolinha */
    $$('.about .gold-line-decor').forEach(function (el, i) {
      gsap.fromTo(el, { yPercent: -20 }, { yPercent: 20, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.5 + (i % 3) * 0.6 } });
    });
    $$('.bg-court.is-scrub').forEach(function (svg) {
      gsap.fromTo(svg.querySelectorAll('rect, line'), { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', stagger: 0.05,
        scrollTrigger: { trigger: svg.closest('.sides'), start: 'top 85%', end: 'bottom 40%', scrub: 1 } });
    });
    $$('[data-giant]').forEach(function (el) {
      gsap.fromTo(el, { xPercent: 0 }, { xPercent: -35, ease: 'none',
        scrollTrigger: { trigger: el.closest('.sides, .pain-point_wrap'), start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
    $$('[data-ball]').forEach(function (wrap) {
      var path = wrap.querySelector('path'); var ball = wrap.querySelector('.ball');
      gsap.to(ball, { motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5] }, ease: 'none',
        scrollTrigger: { trigger: wrap.closest('.pain-point_wrap'), start: 'top 80%', end: 'bottom 20%', scrub: 1.2 } });
    });

    /* "Conheça o professor": tudo entra da DIREITA para a esquerda */
    $$('.about-row').forEach(function (row) {
      var photo = $('[data-r="photo"]', row);
      var overlays = $$('.img-overlay', photo);
      var img = $('img', photo);
      var mover = $('.about-photo-move', photo);
      var tl = gsap.timeline({ defaults: { ease: expo }, scrollTrigger: { trigger: row, start: 'top 70%', once: true } });

      // Foto: o recorte abre da direita, a cortina roxa e a azul-noite recolhem para a esquerda (Elyse, na horizontal)
      gsap.set(photo, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 100%)' });
      tl.to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: inOut }, 0)
        .fromTo(overlays, { scaleX: 1 }, { scaleX: 0, duration: 1.5, ease: inOut, stagger: 0.18 }, 0.2)
        .fromTo(img, { scale: 1.35, xPercent: 10 }, { scale: 1, xPercent: 0, duration: 2.1 }, 0.1);

      // Texto: eyebrow, título em linhas mascaradas, parágrafos, lista, números e botão — todos vindo da direita
      var tag = $('[data-r="tag"]', row);
      tl.fromTo(tag, { autoAlpha: 0, x: 90 }, { autoAlpha: 1, x: 0, duration: 1.2 }, 0.35)
        .fromTo($('.section-tag-line', tag), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0.6);

      var title = $('[data-r="split"]', row);
      gsap.set(title, { autoAlpha: 1 });
      var sp = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      tl.fromTo(sp.lines, { yPercent: 110, x: 70, rotate: 2.5, transformOrigin: '0% 100%' },
        { yPercent: 0, x: 0, rotate: 0, duration: 1.3, stagger: 0.12, ease: 'power4.out' }, 0.45);

      $$('[data-r="text"]', row).forEach(function (el, i) {
        tl.fromTo(el, { autoAlpha: 0, x: 110, filter: 'blur(10px)' },
          { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 1.3, clearProps: 'filter' }, 0.7 + i * 0.12);
      });
      $$('[data-r="list"]', row).forEach(function (list, i) {
        gsap.set(list, { autoAlpha: 1 });
        tl.fromTo(list.children, { autoAlpha: 0, x: 140 }, { autoAlpha: 1, x: 0, duration: 1.2, stagger: 0.09 }, 0.9 + i * 0.2);
      });

      // Números (Elyse data-number) contam junto com a entrada
      $$('[data-number]', row).forEach(function (el) {
        var o = { v: 0 }; var target = parseFloat(el.dataset.number); el.textContent = '0';
        tl.to(o, { v: target, duration: 2.2, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } }, 1.3);
      });

      // Legenda vertical e stickers (Quoti back.out 1.7)
      var label = $('[data-r="label"]', row);
      if (label) tl.fromTo(label, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 1.3);
      $$('[data-r="sticker"]', row).forEach(function (s, i) {
        tl.fromTo(s, { autoAlpha: 0, scale: 0, rotate: i ? -60 : 40 }, { autoAlpha: 1, scale: 1, rotate: i ? -10 : 0, duration: 0.8, ease: 'back.out(1.7)' }, 1.45 + i * 0.18);
      });

      // Depois da entrada: parallax da foto no scroll (Elyse img-paralax)
      gsap.fromTo(mover, { yPercent: -5 }, { yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });

    /* Botão: letras acendem no hover (Amrit letters-fade-in-hover) */
    $$('[data-letters-hover]').forEach(function (el) {
      var s = SplitText.create(el, { type: 'words,chars', charsClass: 'char' });
      var host = el.closest('a, button') || el;
      host.addEventListener('mouseenter', function () { gsap.fromTo(s.chars, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out', stagger: { amount: 0.3 } }); });
    });

    /* Fotos passando: título + DS initHorizontalCards (Quoti mwg001) */
    $$('.pain-point_wrap').forEach(function (root) {
      var head = $('.pain-point_contain', root);
      var htl = gsap.timeline({ defaults: { ease: expo }, scrollTrigger: { trigger: root, start: 'top 60%', once: true } });
      var tag = $('[data-r="tag"]', head);
      htl.fromTo(tag, { autoAlpha: 0, x: 90 }, { autoAlpha: 1, x: 0, duration: 1.2 }, 0)
        .fromTo($('.section-tag-line', tag), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0.2);
      var t = $('[data-r="split"]', head); gsap.set(t, { autoAlpha: 1 });
      var s = SplitText.create(t, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      htl.fromTo(s.lines, { yPercent: 110, rotate: 2.5, transformOrigin: '0% 100%' }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.1, ease: inOut }, 0.1)
        .fromTo($('[data-r="text"]', head), { autoAlpha: 0, x: 110, filter: 'blur(10px)' }, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 1.3, clearProps: 'filter' }, 0.45);

      var container = $('.mwg001-container', root);
      var strip = $('.mwg001-cards', root);
      var cards = $$('.pain-point_card', root);
      var bar = $('.cards-progress span', root);
      var pre = Math.min(500, window.innerWidth * 0.35);
      var getDist = function () {
        var base = (strip.scrollWidth - window.innerWidth) * 0.77; // fórmula do DS
        // garante que o último card chegue ao centro da tela (no celular a fórmula do DS não alcança)
        var last = cards[cards.length - 1];
        var need = last ? last.offsetLeft + last.offsetWidth / 2 - window.innerWidth / 2 - pre : 0;
        return Math.max(base, need);
      };

      gsap.fromTo(strip, { x: 0 }, { x: -pre, ease: 'none',
        scrollTrigger: { trigger: container, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true } });
      var main = gsap.fromTo(strip, { x: -pre }, { x: function () { return -(getDist() + pre); }, ease: 'none',
        scrollTrigger: { trigger: container, pin: true, scrub: true, start: 'top top', end: function () { return '+=' + getDist(); }, invalidateOnRefresh: true,
          onUpdate: function (self) { gsap.set(bar, { scaleX: self.progress }); } } });

      cards.forEach(function (card, i) {
        var sign = i % 2 ? 1 : -1;
        var v = { x: (12 + (i * 7) % 14) * sign, y: (6 + (i * 5) % 6) * -sign, r: (7 + (i * 3) % 7) * sign };
        gsap.fromTo(card, { rotation: v.r, xPercent: v.x, yPercent: v.y }, { rotation: -v.r, xPercent: -v.x, yPercent: -v.y, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: main, start: 'left 140%', end: 'right -40%', scrub: true } });
        var im = $('.pain-point_img img', card);
        if (im) gsap.fromTo(im, { scale: 1.25, xPercent: -6 }, { scale: 1.05, xPercent: 6, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: main, start: 'left right', end: 'right left', scrub: true } });
      });
    });

    ScrollTrigger.refresh();
  }

  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(function (r) { setTimeout(r, 1500); })]).then(init);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  // Segurança: se algo ficar escondido (erro), mostra depois de alguns segundos na tela
  setInterval(function () {
    $$('[data-r]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (getComputedStyle(el).visibility === 'hidden' && r.top < window.innerHeight * 0.4 && r.bottom > 0 && !el.__waited) { el.__waited = Date.now(); }
      if (el.__waited && Date.now() - el.__waited > 3000 && getComputedStyle(el).visibility === 'hidden') gsap.set(el, { autoAlpha: 1, clipPath: 'none' });
    });
  }, 1000);
})();
