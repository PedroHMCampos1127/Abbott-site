/* =====================================================================
   DOBRA 4 — Parcerias: raquete 3D (vídeo 360°), cupom GABBOTT copiável,
   órbita da bolinha, entrada coreografada. Fábricas do DS Abbott.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.getElementById('parcerias'); if (!root) return;
  var hasG = !!(window.gsap && window.ScrollTrigger && window.SplitText);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || root).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); };
  var expo = hasG && gsap.parseEase('dsExpo') ? 'dsExpo' : 'expo.out';
  var inOut = hasG && gsap.parseEase('dsInOut') ? 'dsInOut' : 'power3.inOut';

  /* ---------- Vídeo: webm transparente; no Safari usa o mp4 (fundo escuro + blend) ---------- */
  var video = $('[data-racket]');
  var ua = navigator.userAgent;
  var isSafari = /^((?!chrome|chromium|crios|fxios|android|edg).)*safari/i.test(ua);
  if (isSafari) {
    var webm = video.querySelector('source[type="video/webm"]'); if (webm) webm.remove();
    video.classList.add('is-mp4'); video.parentElement.classList.add('is-mp4');
  }
  var inView = false;
  function play() { if (reduce) return; var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        inView = e.isIntersecting;
        if (inView) { if (!video.__loaded) { video.__loaded = true; video.preload = 'auto'; video.load(); } play(); } else video.pause();
      });
    }, { rootMargin: '200px 0px' }).observe(video);
  } else { video.preload = 'auto'; video.load(); play(); }
  if (reduce) { video.addEventListener('loadeddata', function () { video.currentTime = 0; }); }

  /* ---------- Copiar cupom ---------- */
  var btn = $('[data-copy]'), toast = $('.coupon-toast');
  function fallbackCopy(text) {
    var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
  }
  function burst() {
    if (!hasG || reduce) return;
    var wrap = $('.coupon-wrap'), r = btn.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    var cx = r.left - w.left + r.width / 2, cy = r.top - w.top + r.height / 2;
    for (var i = 0; i < 14; i++) {
      var b = document.createElement('span'); b.className = 'burst'; wrap.appendChild(b);
      var ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 90, s = 0.5 + Math.random() * 0.8;
      gsap.set(b, { left: cx - 6, top: cy - 6, scale: s });
      gsap.timeline({ onComplete: (function (el) { return function () { el.remove(); }; })(b) })
        .to(b, { x: Math.cos(ang) * dist, duration: 1.1, ease: 'power2.out' }, 0)
        .to(b, { y: Math.sin(ang) * dist * 0.7 - 40, duration: 0.45, ease: 'power2.out' }, 0)
        .to(b, { y: '+=' + (90 + Math.random() * 60), duration: 0.7, ease: 'power2.in' }, 0.45)
        .to(b, { autoAlpha: 0, scale: 0, duration: 0.3 }, 0.85);
    }
  }
  var copiedT;
  btn.addEventListener('click', function () {
    var code = btn.dataset.copy;
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).catch(function () { fallbackCopy(code); });
    else fallbackCopy(code);
    btn.classList.add('is-copied'); btn.setAttribute('aria-label', 'Cupom GABBOTT copiado');
    if (hasG) {
      gsap.fromTo(toast, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: expo });
      gsap.fromTo('.coupon', { rotation: -2 }, { rotation: -2, keyframes: [{ rotation: 1, duration: 0.12 }, { rotation: -4, duration: 0.14 }, { rotation: -2, duration: 0.5, ease: 'elastic.out(1, 0.4)' }] });
      var chars = root.__codeChars;
      if (chars) gsap.fromTo(chars, { yPercent: 0 }, { keyframes: [{ yPercent: -18, duration: 0.18, ease: 'power2.out' }, { yPercent: 0, duration: 0.5, ease: 'bounce.out' }], stagger: 0.04 });
    } else { toast.style.opacity = 1; }
    burst();
    clearTimeout(copiedT);
    copiedT = setTimeout(function () {
      btn.classList.remove('is-copied'); btn.setAttribute('aria-label', 'Copiar o cupom GABBOTT');
      if (hasG) gsap.to(toast, { autoAlpha: 0, duration: 0.5 }); else toast.style.opacity = 0;
    }, 2800);
  });

  if (!hasG) return;
  if (reduce) { gsap.set('[data-p]', { autoAlpha: 1 }); return; }

  /* ---------- Movimento contínuo do palco ---------- */
  var stage = $('.racket-stage'), float = $('.racket-float'), glow = $('.racket-glow'), shadow = $('.racket-shadow');
  var ring = $('.racket-ring svg'), orbit = $('.racket-orbit'), orbitPath = $('.racket-orbit path'), ball = $('.racket-orbit .ball');
  gsap.set([float, glow, $('.racket-ring')], { xPercent: -50, yPercent: -50, x: 0, y: 0 });
  gsap.set(shadow, { xPercent: -50, x: 0 });
  // flutua (bob) e a sombra respira junto
  gsap.to(video, { y: -18, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(shadow, { scaleX: 0.82, opacity: 0.7, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(glow, { scale: 1.08, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  var ringSpin = gsap.to(ring, { rotation: 360, duration: 40, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
  // bolinha orbitando: passa na frente e atrás da raquete
  var orbitTl = gsap.to(ball, { motionPath: { path: orbitPath, align: orbitPath, alignOrigin: [0.5, 0.5] }, duration: 6, ease: 'none', repeat: -1,
    onUpdate: function () {
      var p = this.progress(); var front = p < 0.25 || p > 0.75;
      orbit.classList.toggle('is-front', front);
      gsap.set(ball, { scale: front ? 1 : 0.65, opacity: front ? 1 : 0.55 });
    } });

  // Scroll mais rápido = raquete gira mais rápido
  var rate = { v: 1 };
  ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top',
    onUpdate: function (self) {
      var target = 1 + Math.min(Math.abs(self.getVelocity()) / 700, 3);
      gsap.to(rate, { v: target, duration: 0.3, overwrite: true, onUpdate: function () { video.playbackRate = rate.v; },
        onComplete: function () { gsap.to(rate, { v: 1, duration: 1.4, ease: 'power2.out', onUpdate: function () { video.playbackRate = rate.v; } }); } });
      ringSpin.timeScale(rate.v * 1.5);
      orbitTl.timeScale(rate.v);
    } });

  // Mouse: parallax em camadas (raquete, aro, etiquetas)
  if (fine) {
    var fx = gsap.quickTo(float, 'x', { duration: 1, ease: 'power3' }), fy = gsap.quickTo(float, 'y', { duration: 1, ease: 'power3' });
    var tags = $$('.racket-tag').map(function (t) {
      var d = parseFloat(t.dataset.depth) || 1;
      return { d: d, x: gsap.quickTo(t, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(t, 'y', { duration: 1.2, ease: 'power3' }) };
    });
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect(); var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      fx(nx * 28); fy(ny * 22);
      tags.forEach(function (t) { t.x(nx * -30 * t.d); t.y(ny * -24 * t.d); });
      gsap.to(rate, { v: 1 + Math.abs(nx) * 1.6, duration: 0.6, overwrite: true, onUpdate: function () { video.playbackRate = rate.v; } });
    });
    stage.addEventListener('mouseleave', function () {
      fx(0); fy(0); tags.forEach(function (t) { t.x(0); t.y(0); });
      gsap.to(rate, { v: 1, duration: 1, overwrite: true, onUpdate: function () { video.playbackRate = rate.v; } });
    });
    // ticket: endireita e levanta no hover
    var coupon = $('.coupon');
    coupon.addEventListener('mouseenter', function () { gsap.to(coupon, { rotation: 0, scale: 1.02, duration: 0.6, ease: expo }); });
    coupon.addEventListener('mouseleave', function () { gsap.to(coupon, { rotation: -2, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' }); });
    var cursor = document.querySelector('.cursor-ball');
    if (cursor) $$('.coupon-copy, .parc a').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  /* ---------- Entrada coreografada ---------- */
  function init() {
    $$('.gold-line-decor').forEach(function (el, i) {
      gsap.fromTo(el, { yPercent: -20 }, { yPercent: 20, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.5 + (i % 3) * 0.6 } });
    });
    gsap.fromTo($$('.bg-court > *'), { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', stagger: 0.05, scrollTrigger: { trigger: root, start: 'top 85%', end: 'center 40%', scrub: 1 } });
    gsap.fromTo($('[data-giant]'), { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.fromTo(stage, { y: 60 }, { y: -40, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 } });

    var tl = gsap.timeline({ defaults: { ease: expo }, scrollTrigger: { trigger: root, start: 'top 62%', once: true } });

    // Palco: luz acende, aro desenha, raquete sobe do escuro girando
    gsap.set(stage, { autoAlpha: 1 });
    tl.fromTo(glow, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6 }, 0)
      .fromTo($('.racket-ring'), { autoAlpha: 0, rotation: -120, scale: 0.7 }, { autoAlpha: 1, rotation: 0, scale: 1, duration: 1.8 }, 0.1)
      .fromTo(float, { autoAlpha: 0, yPercent: -30, scale: 0.6, filter: 'blur(18px)' }, { autoAlpha: 1, yPercent: -50, scale: 1, filter: 'blur(0px)', duration: 1.6, clearProps: 'filter' }, 0.25)
      .fromTo(shadow, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.2 }, 0.6)
      .fromTo(orbitPath, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, ease: inOut }, 0.6)
      .fromTo(ball, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1.4)
      .fromTo($$('.racket-tag'), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.8, stagger: 0.09, ease: 'back.out(1.7)' }, 1.0)
      .fromTo($$('.racket-label, .racket-hint'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1 }, 1.4);

    // Texto da esquerda
    var tag = $('[data-p="tag"]');
    tl.fromTo(tag, { autoAlpha: 0, x: 90 }, { autoAlpha: 1, x: 0, duration: 1.2 }, 0.1)
      .fromTo($('.section-tag-line', tag), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0.3);
    var t = $('[data-p="split"]'); gsap.set(t, { autoAlpha: 1 });
    var sp = SplitText.create(t, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    tl.fromTo(sp.lines, { yPercent: 110, rotate: 2.5, transformOrigin: '0% 100%' }, { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.12, ease: 'power4.out' }, 0.2)
      .fromTo($('[data-p="text"]'), { autoAlpha: 0, x: 110, filter: 'blur(10px)' }, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 1.2, clearProps: 'filter' }, 0.5);

    // Ticket: entra de lado como um cartão jogado na mesa, letras do código sobem, carimbo e botão estouram
    var cw = $('[data-p="coupon"]'); gsap.set(cw, { autoAlpha: 1 });
    var code = $('[data-code]');
    var cs = SplitText.create(code, { type: 'chars', mask: 'chars', charsClass: 'char' }); root.__codeChars = cs.chars;
    tl.fromTo('.coupon', { autoAlpha: 0, x: 160, rotation: 14 }, { autoAlpha: 1, x: 0, rotation: -2, duration: 1.3 }, 0.7)
      .fromTo(cs.chars, { yPercent: 115, rotate: 10 }, { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.06, ease: 'power4.out' }, 1.0)
      .fromTo($$('.coupon-kicker, .coupon-note'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 1.2)
      .fromTo('.coupon-perf', { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: inOut }, 1.1)
      .fromTo('.coupon-copy', { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.7)' }, 1.35)
      .fromTo('.coupon-stamp', { scale: 0, rotate: -30 }, { scale: 1, rotate: 5, duration: 0.8, ease: 'back.out(1.7)' }, 1.6);

    var act = $('[data-p="actions"]'); gsap.set(act, { autoAlpha: 1 });
    tl.fromTo(act.children, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 1.55);
    var steps = $('[data-p="steps"]'); gsap.set(steps, { autoAlpha: 1 });
    var vertical = window.innerWidth <= 767;
    tl.fromTo('.steps-line span', vertical ? { scaleY: 0, scaleX: 1 } : { scaleX: 0 }, vertical ? { scaleY: 1, duration: 1.4, ease: inOut } : { scaleX: 1, duration: 1.4, ease: inOut }, 1.7)
      .fromTo($$('li', steps), { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 1, stagger: 0.15 }, 1.8);

    ScrollTrigger.refresh();
  }
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(function (r) { setTimeout(r, 1500); })]).then(function () { setTimeout(init, 0); });

  // Segurança: nada fica escondido
  setInterval(function () {
    $$('[data-p]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (getComputedStyle(el).visibility === 'hidden' && r.top < window.innerHeight * 0.5 && r.bottom > 0) {
        el.__w = el.__w || Date.now(); if (Date.now() - el.__w > 3000) gsap.set(el, { autoAlpha: 1 });
      }
    });
  }, 1000);
})();
