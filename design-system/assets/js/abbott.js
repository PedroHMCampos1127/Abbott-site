/* =====================================================================
   DS ABBOTT — interações
   Requer: GSAP 3.13 + ScrollTrigger + SplitText + DrawSVGPlugin + MotionPathPlugin, Lenis, Iconify
   Atributos/classes herdados das referências:
   - Blade & Co: #nav .scrolled, .reveal/.visible, .testimonial-item/.testimonial-dot, .hero-image img (parallax)
   - Elyse: [data-hero], [data-anim="element|split|img-overlay|slideUp-once|stagger-wrap|stagger|img-paralax"],
            [data-number], [data-slice-reveal] (--mask-gradient), [data-dropdown]
   - Amrit Palace: [letters-fade-in], [letters-fade-in-hover]
   - Quoti: .pain-point_wrap/.mwg001-*, .button_main_wrap, [data-sticker], nav hide/show
   ===================================================================== */
(function () {
  'use strict';

  const docEl = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Fallback: se o GSAP não carregar, mostra tudo
  const showAll = () => docEl.classList.remove('js');
  if (!window.gsap) { showAll(); return; }

  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
  const EASE_OUT = 'expo.out';
  const EASE_INOUT = 'power3.inOut';

  /* ---------- Lenis (Amrit/Quoti) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.dsLenis = lenis;

  /* ---------- NAV: .scrolled (Blade) + esconde ao descer (Quoti) ---------- */
  const nav = document.getElementById('nav');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle('scrolled', y > 80);
      if (window.innerWidth >= 992) nav.classList.toggle('is-hidden', y > 300 && y > lastY + 4);
      if (y < lastY - 4) nav.classList.remove('is-hidden');
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile (Blade) ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
    mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      hamburger.classList.remove('active'); mobileNav.classList.remove('active');
    }));
  }

  /* ---------- Âncoras com Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -60 }); else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Cursor bolinha ---------- */
  const cursor = document.querySelector('.cursor-ball');
  if (cursor && finePointer) {
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll('a, button, [data-magnetic], .slot, .chip').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- Spotlight (variáveis --mx/--my) ---------- */
  document.querySelectorAll('[data-spotlight]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Botões magnéticos ---------- */
  if (finePointer) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.35;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Botão que rola (Quoti .button_main_wrap) ---------- */
  document.querySelectorAll('.button_main_wrap').forEach((wrap) => {
    const main = wrap.querySelector('.button_main_element');
    const hover = wrap.querySelector('.button_hover_element');
    if (!main || !hover) return;
    const tl = gsap.timeline({ paused: true })
      .to(main, { scale: 0.8, yPercent: -40, opacity: 0, duration: 0.35, ease: 'power2.out' }, 0)
      .to(hover, { scale: 1, yPercent: -120, rotationZ: 0, duration: 0.35, ease: 'power2.out' }, 0);
    wrap.addEventListener('mouseenter', () => tl.play());
    wrap.addEventListener('mouseleave', () => tl.reverse());
  });

  /* ---------- Depoimentos (Blade) ---------- */
  const tItems = document.querySelectorAll('.testimonial-item');
  const tDots = document.querySelectorAll('.testimonial-dot');
  let tCurrent = 0; let tTimer;
  const showT = (i) => {
    tItems.forEach((x) => x.classList.remove('active'));
    tDots.forEach((x) => x.classList.remove('active'));
    if (!tItems[i]) return;
    tItems[i].classList.add('active'); if (tDots[i]) tDots[i].classList.add('active'); tCurrent = i;
  };
  const autoT = () => { clearInterval(tTimer); tTimer = setInterval(() => showT((tCurrent + 1) % tItems.length), 5500); };
  tDots.forEach((d) => d.addEventListener('click', () => { showT(parseInt(d.dataset.index, 10)); autoT(); }));
  if (tItems.length) { showT(0); autoT(); }

  /* ---------- FAQ (Elyse [data-dropdown]) ---------- */
  document.querySelectorAll('[data-dropdown]').forEach((dd) => {
    const toggle = dd.querySelector('[data-dropdown-toggle]');
    toggle && toggle.addEventListener('click', () => {
      const open = dd.classList.contains('active');
      dd.parentElement.querySelectorAll('[data-dropdown].active').forEach((o) => o.classList.remove('active'));
      if (!open) dd.classList.add('active');
      toggle.setAttribute('aria-expanded', String(!open));
      setTimeout(() => ScrollTrigger.refresh(), 520);
    });
  });

  /* ---------- Chips selecionáveis ---------- */
  document.querySelectorAll('.chip-group').forEach((g) => {
    g.addEventListener('click', (e) => {
      const c = e.target.closest('.chip'); if (!c) return;
      g.querySelectorAll('.chip').forEach((x) => x.classList.remove('is-active')); c.classList.add('is-active');
    });
  });

  /* ---------- Reveal (Blade .reveal → .visible) ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

  if (reduce) { showAll(); document.querySelectorAll('.img-overlay').forEach((o) => (o.style.height = '0%')); return; }

  /* =================================================================
     ANIMAÇÕES GSAP — cada uma vira uma "fábrica" reaproveitável
     (o Motion Gallery do design system chama window.DSAbbott.replay)
     ================================================================= */
  const factories = {};
  const DS = (window.DSAbbott = { factories, replay: (name, el) => factories[name] && factories[name](el, true) });

  // Elyse [data-anim="element"] — reinterpretado: sobe + desfoca → foca
  factories.element = (el, now) => gsap.fromTo(el,
    { autoAlpha: 0, y: '4rem', filter: 'blur(10px)' },
    { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: EASE_OUT, delay: parseFloat(el.dataset.animDelay) || 0,
      scrollTrigger: now ? null : { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' } });

  // Elyse [data-anim="split"] — linhas mascaradas sobem com leve rotação
  const splits = new WeakMap();
  factories.split = (el, now) => {
    gsap.set(el, { autoAlpha: 1 });
    let split = splits.get(el);
    if (!split) { split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' }); splits.set(el, split); }
    return gsap.fromTo(split.lines, { yPercent: 110, rotate: 2.5, transformOrigin: '0% 100%' },
      { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.1, ease: EASE_INOUT, delay: 0.1,
        scrollTrigger: now ? null : { trigger: el, start: 'top 90%', once: true } });
  };

  // Elyse [data-hero="title"] — caracteres saindo da máscara
  factories.chars = (el, now) => {
    gsap.set(el, { autoAlpha: 1 });
    let split = splits.get(el);
    if (!split) { split = SplitText.create(el, { type: 'chars', mask: 'chars', charsClass: 'char' }); splits.set(el, split); }
    return gsap.fromTo(split.chars, { yPercent: 110, rotate: 12 },
      { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.035, ease: 'power4.out', delay: now ? 0 : parseFloat(el.dataset.delay) || 0 });
  };

  // Elyse [data-anim="img-overlay"] — cortina dupla (roxo, depois fundo)
  factories.overlay = (el, now) => {
    const layers = el.querySelectorAll('.img-overlay');
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: now ? null : { trigger: el, start: 'top bottom-=75', once: true } });
    tl.fromTo(layers, { height: '101%' }, { height: '0%', duration: 1.5, ease: EASE_INOUT, stagger: 0.18 });
    if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.9, ease: EASE_OUT }, 0);
    return tl;
  };

  // Elyse [data-anim="slideUp-once"]
  factories.slideUp = (el, now) => gsap.fromTo(el, { autoAlpha: 0, yPercent: 25 },
    { autoAlpha: 1, yPercent: 0, duration: 1, ease: EASE_INOUT, scrollTrigger: now ? null : { trigger: el, start: 'top bottom', once: true } });

  // Elyse [data-anim="stagger-wrap"] > [data-anim="stagger"] — cascata com escala
  factories.stagger = (wrap, now) => {
    const items = wrap.querySelectorAll('[data-anim="stagger"]');
    return gsap.fromTo(items, { autoAlpha: 0, yPercent: 40, scale: 0.96 },
      { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1, stagger: 0.12, ease: EASE_OUT,
        scrollTrigger: now ? null : { trigger: wrap, start: 'top 88%', once: true } });
  };

  // Clip-path de baixo para cima (Elyse small-image)
  factories.clip = (el, now) => gsap.fromTo(el, { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: EASE_INOUT, scrollTrigger: now ? null : { trigger: el, start: 'top 85%', once: true } });

  // Revelação em 30 fatias (Elyse --mask-gradient)
  const SLICES = 30;
  const maskFrom = (p) => {
    const step = 100 / SLICES; let g = 'linear-gradient(0deg';
    for (let i = 0; i < SLICES; i++) {
      const s = i * step; const v = s + step * p[i]; g += `, #000 ${s}% ${v}%`;
      if (p[i] < 1) g += `, transparent ${v}% ${s + step}%`;
    }
    return g + ')';
  };
  factories.slices = (el, now) => {
    const prog = new Array(SLICES).fill(0);
    el.style.setProperty('--mask-gradient', maskFrom(prog));
    const tl = gsap.timeline({ scrollTrigger: now ? null : { trigger: el, start: 'top 80%', once: true },
      onUpdate: () => el.style.setProperty('--mask-gradient', maskFrom(prog)),
      onComplete: () => el.style.setProperty('--mask-gradient', 'none') });
    prog.forEach((_, i) => tl.to(prog, { [i]: 1, duration: 0.9, ease: 'power2.out' }, (SLICES - i) * 0.025));
    return tl;
  };

  // Amrit [letters-fade-in]
  factories.letters = (el, now) => {
    gsap.set(el, { autoAlpha: 1 });
    let split = splits.get(el);
    if (!split) { split = SplitText.create(el, { type: 'words,chars', charsClass: 'char' }); splits.set(el, split); }
    return gsap.fromTo(split.chars, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out', stagger: { amount: 0.8 },
      scrollTrigger: now ? null : { trigger: el, start: 'top 75%', once: true } });
  };

  // Quoti [data-sticker] — palavras sobem + stickers com back.out
  factories.sticker = (comp, now) => {
    const texts = comp.querySelectorAll('[data-sticker="text"]');
    const s1 = comp.querySelector('[data-sticker="first"]');
    const s2 = comp.querySelector('[data-sticker="second"]');
    let words = splits.get(comp);
    if (!words) {
      words = [];
      texts.forEach((t) => { const sp = SplitText.create(t, { type: 'words', mask: 'words', wordsClass: 'word' }); words.push(...sp.words); });
      splits.set(comp, words);
    }
    gsap.set([s1, s2].filter(Boolean), { autoAlpha: 1 });
    const tl = gsap.timeline({ delay: now ? 0 : 0.2, scrollTrigger: now ? null : { trigger: comp, start: 'top 80%', once: true } });
    tl.fromTo(words, { yPercent: 105 }, { yPercent: 0, duration: 1, stagger: 0.05, ease: 'power2.out' }, 0);
    if (s1) tl.fromTo(s1, { scale: 0 }, { scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, 0.1);
    if (s2) tl.fromTo(s2, { scale: 0, rotate: -40 }, { scale: 1, rotate: -10, duration: 0.8, ease: 'back.out(1.7)' }, 0.5);
    return tl;
  };

  // Contador (Elyse [data-number] / Blade .stat-number)
  factories.number = (el, now) => {
    const target = parseFloat(el.dataset.number);
    const obj = { v: 0 };
    return gsap.to(obj, { v: target, duration: 2.2, ease: 'power2.out',
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: now ? null : { trigger: el, start: 'top 90%', once: true } });
  };

  // Linhas de quadra (DrawSVG — Quoti)
  factories.draw = (svg, now) => {
    const shapes = svg.querySelectorAll('path, line, rect');
    if (svg.dataset.draw === 'scrub' && !now) {
      return gsap.fromTo(shapes, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', stagger: 0.05,
        scrollTrigger: { trigger: svg.closest('section, header, .ds-section') || svg, start: 'top 85%', end: 'bottom 40%', scrub: 1 } });
    }
    return gsap.fromTo(shapes, { drawSVG: '0%' }, { drawSVG: '100%', duration: 2.2, ease: 'power2.inOut', stagger: 0.12,
      delay: now ? 0 : parseFloat(svg.dataset.delay) || 0 });
  };

  // Bolinha em trajetória de lob (MotionPath) amarrada ao scroll
  factories.ball = (wrap, now) => {
    const path = wrap.querySelector('path');
    const ball = wrap.querySelector('.ball');
    if (!path || !ball) return;
    const cfg = { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false }, ease: 'none' };
    if (now) return gsap.fromTo(ball, { motionPath: { ...cfg.motionPath, start: 0, end: 0 } }, { ...cfg, motionPath: { ...cfg.motionPath, start: 0, end: 1 }, duration: 2.4, ease: 'power1.inOut' });
    return gsap.to(ball, { ...cfg, scrollTrigger: { trigger: wrap.closest('section, header, .ds-section') || wrap, start: 'top 80%', end: 'bottom 20%', scrub: 1.2 } });
  };

  // Texto gigante deslizando no scroll
  factories.giant = (el) => gsap.fromTo(el, { xPercent: 0 }, { xPercent: -35, ease: 'none',
    scrollTrigger: { trigger: el.closest('section, .ds-section') || el, start: 'top bottom', end: 'bottom top', scrub: 1 } });

  /* ---------- Aplica em toda a página ---------- */
  document.fonts.ready.then(() => {
    // Hero: título em caracteres (Elyse v2) + descrição + ações
    const heroTL = gsap.timeline({ delay: 1.35, defaults: { ease: 'power3.out' } });
    document.querySelectorAll('[data-hero="title"]').forEach((el, i) => {
      gsap.set(el, { autoAlpha: 1 });
      const sp = SplitText.create(el, { type: 'chars', mask: 'chars', charsClass: 'char' }); splits.set(el, sp);
      heroTL.fromTo(sp.chars, { yPercent: 115, rotate: 10 }, { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.045, ease: 'power4.out' }, i * 0.18);
    });
    const sub = document.querySelector('[data-hero="subtitle"]');
    if (sub) heroTL.fromTo(sub, { autoAlpha: 0, y: 40, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.2 }, 0.7);
    const act = document.querySelector('[data-hero="actions"]');
    if (act) gsap.set(act, { autoAlpha: 1 });
    if (act) heroTL.fromTo(act.children, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.95);
    const badge = document.querySelector('[data-hero="badge"]');
    if (badge) heroTL.fromTo(badge, { autoAlpha: 0, scale: 0, rotate: -90 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(1.6)' }, 1.1);
    const scrollInd = document.querySelector('[data-hero="scroll"]');
    if (scrollInd) heroTL.fromTo(scrollInd, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1 }, 1.5);

    // Parallax de saída do hero (Elyse)
    const hero = document.querySelector('.hero');
    if (hero) {
      gsap.to('.hero-content', { yPercent: -18, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.hero-image img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } });
    }

    document.querySelectorAll('[data-anim="element"]').forEach((el) => factories.element(el));
    document.querySelectorAll('[data-anim="split"]').forEach((el) => factories.split(el));
    document.querySelectorAll('[data-anim="img-overlay"]').forEach((el) => factories.overlay(el));
    document.querySelectorAll('[data-anim="slideUp-once"]').forEach((el) => factories.slideUp(el));
    document.querySelectorAll('[data-anim="stagger-wrap"]').forEach((el) => factories.stagger(el));
    document.querySelectorAll('[data-anim="clip"]').forEach((el) => factories.clip(el));
    document.querySelectorAll('[data-slice-reveal]').forEach((el) => factories.slices(el));
    document.querySelectorAll('[letters-fade-in]').forEach((el) => factories.letters(el));
    document.querySelectorAll('[data-sticker="component"]').forEach((el) => factories.sticker(el));
    document.querySelectorAll('[data-number]').forEach((el) => factories.number(el));
    document.querySelectorAll('[data-draw]').forEach((el) => factories.draw(el));
    document.querySelectorAll('[data-ball]').forEach((el) => factories.ball(el));
    document.querySelectorAll('[data-giant]').forEach((el) => factories.giant(el));

    // Parallax de imagens (Elyse img-paralax)
    gsap.utils.toArray('[data-anim="img-paralax"]').forEach((el) => {
      gsap.fromTo(el, { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });

    // Linhas finas com velocidades diferentes (Blade gold-line-decor)
    gsap.utils.toArray('.gold-line-decor').forEach((el, i) => {
      gsap.fromTo(el, { yPercent: -20 }, { yPercent: 20, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.5 + (i % 3) * 0.6 } });
    });

    // Orbes da aurora reagem ao scroll
    gsap.utils.toArray('.bg-layer').forEach((layer) => {
      const orbs = layer.querySelectorAll('.aurora-orb');
      if (!orbs.length) return;
      gsap.fromTo(orbs, { y: -60 }, { y: 60, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: layer.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
    });

    // Timeline de conquistas: linha enche no scroll
    gsap.utils.toArray('.timeline').forEach((tl) => {
      const fill = tl.querySelector('.timeline-line-fill');
      if (fill) gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 75%', end: 'bottom 60%', scrub: 1 } });
    });

    // Amrit [letters-fade-in-hover]
    document.querySelectorAll('[letters-fade-in-hover]').forEach((el) => {
      const sp = SplitText.create(el, { type: 'words,chars', charsClass: 'char' });
      const host = el.closest('a, button') || el;
      host.addEventListener('mouseenter', () => gsap.fromTo(sp.chars, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out', stagger: { amount: 0.3 } }));
    });

    initHorizontalCards();
    ScrollTrigger.refresh();
  });

  /* ---------- Fotos passando no scroll (Quoti mwg001, adaptado) ---------- */
  function initHorizontalCards() {
    document.querySelectorAll('.pain-point_wrap').forEach((root) => {
      const container = root.querySelector('.mwg001-container');
      const strip = root.querySelector('.mwg001-cards');
      const cards = root.querySelectorAll('.pain-point_card');
      if (!container || !strip) return;
      const pre = Math.min(500, window.innerWidth * 0.35);
      const getDist = () => (strip.scrollWidth - window.innerWidth) * 0.77;

      gsap.fromTo(strip, { x: 0 }, { x: -pre, ease: 'none',
        scrollTrigger: { trigger: container, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true } });
      const main = gsap.fromTo(strip, { x: -pre }, { x: () => -(getDist() + pre), ease: 'none',
        scrollTrigger: { trigger: container, pin: true, scrub: true, start: 'top top', end: () => '+=' + getDist(), invalidateOnRefresh: true } });

      cards.forEach((card, i) => {
        const sign = i % 2 ? 1 : -1; // alterna em vez de aleatório: composição mais estável
        const v = { x: (12 + (i * 7) % 14) * sign, y: (6 + (i * 5) % 6) * -sign, r: (7 + (i * 3) % 7) * sign };
        gsap.fromTo(card, { rotation: v.r, xPercent: v.x, yPercent: v.y }, { rotation: -v.r, xPercent: -v.x, yPercent: -v.y, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: main, start: 'left 140%', end: 'right -40%', scrub: true } });
        const img = card.querySelector('.pain-point_img img');
        if (img) gsap.fromTo(img, { scale: 1.25, xPercent: -6 }, { scale: 1.05, xPercent: 6, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: main, start: 'left right', end: 'right left', scrub: true } });
      });
    });
  }

  // Segurança: se algo ficar escondido (ex.: erro), mostra após 4s
  setTimeout(() => {
    document.querySelectorAll('[data-anim], [data-hero], [letters-fade-in]').forEach((el) => {
      if (getComputedStyle(el).visibility === 'hidden' && el.getBoundingClientRect().top < window.innerHeight) gsap.set(el, { autoAlpha: 1 });
    });
  }, 4000);
})();
