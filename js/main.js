/* ============================================================
   THE CONNECTION RETREAT — MAIN JS
   Smooth scroll · Reveal animations · Nav · Parallax · Loader
   ============================================================ */

(function () {
  'use strict';

  /* ---- LOADER ---- */
  const loader = document.getElementById('loader');
  const body   = document.body;

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('hidden');
    body.classList.remove('loading');
  }

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 900);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 900));
  }

  /* ---- NAVIGATION ---- */
  const nav       = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  // Scroll state
  let lastScroll  = 0;
  let ticking     = false;

  function updateNav() {
    const y = window.scrollY;
    if (y > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  // Mobile toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      // Animate hamburger
      const spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.transform = 'translateY(-0px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    });

    // Close on link click
    navMenu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
        navToggle.querySelectorAll('span').forEach(s => s.style.transform = '');
      });
    });
  }

  /* ---- INTERSECTION OBSERVER: REVEAL ANIMATIONS ---- */
  const revealEls = document.querySelectorAll('.reveal-up');

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Stagger siblings within the same parent
            const parent   = entry.target.parentElement;
            const siblings = parent ? Array.from(parent.querySelectorAll('.reveal-up')) : [entry.target];
            const idx      = siblings.indexOf(entry.target);
            const delay    = idx * 100;

            setTimeout(() => entry.target.classList.add('visible'), delay);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => {
      revealObserver.observe(el);
    });
  }



  /* ---- ELEMENTS SECTION: horizontal scroll hint on mobile ---- */
  const elementsTrack = document.querySelector('.elements__track');

  if (elementsTrack) {
    // On mobile, make the track horizontally scrollable
    function checkElementLayout() {
      if (window.innerWidth <= 900) {
        elementsTrack.style.overflowX = 'auto';
        elementsTrack.style.gridTemplateColumns = 'repeat(5, 280px)';
      } else {
        elementsTrack.style.overflowX = '';
        elementsTrack.style.gridTemplateColumns = '';
      }
    }
    checkElementLayout();
    window.addEventListener('resize', checkElementLayout);
  }

  /* ---- FAQ SMOOTH ANIMATION ---- */
  document.querySelectorAll('.faq__item').forEach(item => {
    const summary = item.querySelector('.faq__question');
    const answer  = item.querySelector('.faq__answer');

    if (!summary || !answer) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      const isOpen = item.hasAttribute('open');

      // Close all others
      document.querySelectorAll('.faq__item[open]').forEach(open => {
        if (open !== item) {
          const a = open.querySelector('.faq__answer');
          if (a) {
            a.style.maxHeight = '0';
            a.style.opacity   = '0';
          }
          setTimeout(() => open.removeAttribute('open'), 400);
        }
      });

      if (isOpen) {
        answer.style.maxHeight = '0';
        answer.style.opacity   = '0';
        setTimeout(() => item.removeAttribute('open'), 400);
      } else {
        item.setAttribute('open', '');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity   = '1';
      }
    });

    // Set initial styles
    answer.style.maxHeight   = '0';
    answer.style.opacity     = '0';
    answer.style.overflow    = 'hidden';
    answer.style.transition  = 'max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease';
  });

  /* ---- CURSOR GLOW (desktop only) ---- */
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9000;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201, 169, 110, 0.06) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: opacity 0.3s;
      top: -300px; left: -300px;
    `;
    document.body.appendChild(glow);

    let mx = -300, my = -300;
    let cx = -300, cy = -300;
    let raf;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });

    function animateGlow() {
      cx += (mx - cx) * 0.1;
      cy += (my - cy) * 0.1;
      glow.style.left = cx + 'px';
      glow.style.top  = cy + 'px';
      raf = requestAnimationFrame(animateGlow);
    }
    animateGlow();

    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
  }

  /* ---- ELEMENT CARD: mouse-track glow (desktop) ---- */
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.element-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x    = ((e.clientX - rect.left) / rect.width) * 100;
        const y    = ((e.clientY - rect.top)  / rect.height) * 100;
        const orb  = card.querySelector('.element-card__orb');
        if (orb) {
          orb.style.background = `radial-gradient(circle at ${x}% ${y}%, currentColor 0%, transparent 60%)`;
          orb.style.opacity    = '0.12';
        }
      });
      card.addEventListener('mouseleave', () => {
        const orb = card.querySelector('.element-card__orb');
        if (orb) orb.style.opacity = '0';
      });
    });
  }

  /* ---- SMOOTH SCROLL for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- ACTIVE NAV LINK HIGHLIGHTING ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.style.color = 'var(--gold)';
    }
  });

  /* ---- JOURNEY SCROLL CANVAS ---- */
  (function () {
    const section    = document.getElementById('journey');
    const canvas     = document.getElementById('journeyCanvas');
    if (!section || !canvas) return;

    const nameEl     = document.getElementById('journeyName');
    const qualEl     = document.getElementById('journeyQuality');
    const verseEl    = document.getElementById('journeyVerse');
    const hintEl     = document.getElementById('journeyHint');
    const fillEl     = document.getElementById('journeyFill');
    const stageSpans = document.querySelectorAll('.journey__progress-stages span');
    const iconEls    = [
      document.getElementById('journeyIconEarth'),
      document.getElementById('journeyIconWater'),
      document.getElementById('journeyIconFire'),
      document.getElementById('journeyIconAir'),
      document.getElementById('journeyIconSpace'),
    ];
    const DPR = window.devicePixelRatio || 1;

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      spawnParticles();
      spawnStars();
    }

    /* ---- STAGE DATA ---- */
    const STAGES = [
      {
        name: 'Earth',
        q:    'Grounding · Self-connection · Nervous system',
        text: 'You arrive.\nThe earth remembers\nhow to hold you.',
        skyTop: [8, 5, 2],    skyMid: [16, 11, 5],    skyHor: [32, 22, 10],
        glow: [195, 148, 58], pCol: [210, 175, 100],
        ground0: [22, 16, 7], ground1: [6, 4, 2],
        fogCol: [28, 20, 10],
        starBright: 0.15,
        pMode: 'dust',
      },
      {
        name: 'Water',
        q:    'Flow · Emotional openness · Authentic relating',
        text: 'You soften.\nWhat you kept held\nbegins to move.',
        skyTop: [2, 6, 18],   skyMid: [3, 10, 28],   skyHor: [6, 20, 44],
        glow: [55, 135, 215], pCol: [90, 162, 228],
        ground0: [4, 12, 30], ground1: [1, 4, 12],
        fogCol: [5, 14, 36],
        starBright: 0.35,
        pMode: 'rain',
      },
      {
        name: 'Fire',
        q:    'Intensity · Transformation · Ecstatic dance',
        text: 'You ignite.\nAt the edge of what you can feel,\nsomething opens.',
        skyTop: [14, 4, 1],   skyMid: [22, 7, 2],   skyHor: [40, 14, 3],
        glow: [232, 98, 22],  pCol: [252, 145, 42],
        ground0: [30, 10, 2], ground1: [8, 2, 0],
        fogCol: [38, 12, 2],
        starBright: 0.05,
        pMode: 'embers',
      },
      {
        name: 'Air',
        q:    'Expression · Voice · Play · Freedom',
        text: 'You lighten.\nThe self that laughs\nis more honest.',
        skyTop: [5, 10, 22],  skyMid: [7, 16, 30],  skyHor: [14, 26, 46],
        glow: [130, 190, 238], pCol: [175, 218, 248],
        ground0: [8, 16, 30], ground1: [2, 5, 12],
        fogCol: [10, 20, 38],
        starBright: 0.22,
        pMode: 'feathers',
      },
      {
        name: 'Space',
        q:    'Integration · Stillness · Ritual · Closure',
        text: 'You integrate.\nIn the stillness after,\nyou are changed.',
        skyTop: [2, 2, 6],    skyMid: [4, 4, 12],   skyHor: [8, 6, 20],
        glow: [168, 140, 238], pCol: [215, 200, 255],
        ground0: [5, 4, 14],  ground1: [1, 1, 4],
        fogCol: [6, 5, 18],
        starBright: 1.0,
        pMode: 'stars',
      },
    ];

    /* ---- PARTICLES ---- */
    const PCOUNT = 200;
    let parts = [];
    let stars = [];
    const SCOUNT = 280;

    function spawnParticles() {
      parts = Array.from({ length: PCOUNT }, () => ({
        x:     Math.random() * (W || 800),
        y:     Math.random() * (H || 600),
        r:     Math.random() * 2.2 + 0.4,
        op:    Math.random() * 0.7 + 0.2,
        seed:  Math.random(),
        phase: Math.random() * Math.PI * 2,
        vy:    (Math.random() - 0.5) * 0.3,
        vx:    (Math.random() - 0.5) * 0.3,
        len:   Math.random() * 16 + 5,
      }));
    }

    function spawnStars() {
      stars = Array.from({ length: SCOUNT }, () => ({
        x:     Math.random() * (W || 800),
        y:     Math.random() * (H || 600) * 0.72,
        r:     Math.random() * 1.4 + 0.2,
        base:  Math.random() * 0.55 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0015 + 0.0005,
      }));
    }

    /* ---- SCROLL TRACKING ---- */
    let rawProg = 0, curProg = 0;
    function onScroll() {
      const rect  = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      rawProg = Math.max(0, Math.min(1, -rect.top / total));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---- HELPERS ---- */
    const jLerp  = (a, b, t) => a + (b - a) * t;
    const jClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const jEase  = (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const lC     = (a, b, t) => a.map((v, i) => Math.round(jLerp(v, b[i], t)));
    const rgba   = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    let lastSI = -1;
    let hintHidden = false;
    let textAlpha  = 0;
    let textTarget = 0;
    let currentText = '';

    /* ---- TERRAIN per element ---- */
    function drawTerrain(si, sp, horizonY, glowC) {
      switch (si) {
        case 0: // Earth — rolling hills with roots
          drawHills(horizonY, glowC, sp);
          break;
        case 1: // Water — calm water surface + ripples
          drawWater(horizonY, glowC, curProg, sp);
          break;
        case 2: // Fire — rocky ground with embers glow
          drawFireGround(horizonY, glowC, sp);
          break;
        case 3: // Air — light hills, distant horizon
          drawAirHorizon(horizonY, glowC, sp);
          break;
        case 4: // Space — barren flat plane
          drawSpacePlane(horizonY, glowC, sp);
          break;
      }
    }

    function drawHills(hy, glowC, t) {
      ctx.save();
      // Distant far hill range
      ctx.beginPath();
      ctx.moveTo(-20, hy + 5);
      ctx.bezierCurveTo(W*0.1, hy - 55, W*0.28, hy - 80, W*0.42, hy - 32);
      ctx.bezierCurveTo(W*0.54, hy + 8, W*0.68, hy - 52, W*0.82, hy - 68);
      ctx.bezierCurveTo(W*0.92, hy - 80, W*1.02, hy - 30, W+20, hy + 5);
      ctx.lineTo(W+20, hy + 50); ctx.lineTo(-20, hy + 50);
      ctx.closePath();
      ctx.fillStyle = rgba(lC([16,12,6],[10,7,3],t), 0.72);
      ctx.fill();
      // Near sweeping hill
      ctx.beginPath();
      ctx.moveTo(-20, hy + 38);
      ctx.bezierCurveTo(W*0.08, hy - 18, W*0.22, hy - 42, W*0.38, hy - 12);
      ctx.bezierCurveTo(W*0.52, hy + 18, W*0.72, hy - 28, W*0.88, hy - 44);
      ctx.bezierCurveTo(W*0.96, hy - 52, W*1.02, hy - 10, W+20, hy + 30);
      ctx.lineTo(W+20, hy + 80); ctx.lineTo(-20, hy + 80);
      ctx.closePath();
      ctx.fillStyle = rgba(lC([10,7,3],[5,3,1],t), 0.88);
      ctx.fill();
      // Foreground silhouette
      ctx.beginPath();
      ctx.moveTo(-20, H);
      ctx.lineTo(-20, hy + 55);
      for (let x = 0; x <= W + 20; x += 22) {
        const rh = 6 + Math.sin(x * 0.018) * 10 + Math.sin(x * 0.041) * 6;
        ctx.lineTo(x, hy + 55 - rh);
      }
      ctx.lineTo(W + 20, H);
      ctx.closePath();
      ctx.fillStyle = rgba([5,3,1], 0.92);
      ctx.fill();
      // Root lines
      for (let i = 0; i < 7; i++) {
        const rx = W * (0.1 + i * 0.13);
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = rgba([201,165,90], 1);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(rx, hy + 2);
        ctx.bezierCurveTo(rx - 8 + i * 3, hy + 18, rx - 4, hy + 26, rx + 5, hy + 34);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    function drawWater(hy, glowC, prog, t) {
      ctx.save();
      const wt = (prog * 8) % 1;
      // Water body
      const wGrad = ctx.createLinearGradient(0, hy, 0, H);
      wGrad.addColorStop(0,   rgba(lC([5,14,38],[2,5,14],0), 0.88));
      wGrad.addColorStop(1,   rgba(lC([2,5,14],[1,2,5],0),   0.98));
      ctx.fillStyle = wGrad;
      ctx.fillRect(0, hy, W, H - hy);
      // Wave rows
      for (let row = 0; row < 7; row++) {
        const rowY = hy + row * 14;
        const amp  = (7 - row) * 4.5;
        const freq = 0.008 + row * 0.002;
        ctx.beginPath();
        ctx.moveTo(-20, rowY);
        for (let x = 0; x <= W + 20; x += 3) {
          const y = rowY + Math.sin(x * freq + wt * Math.PI * 2 + row * 0.7) * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W + 20, hy - 5); ctx.lineTo(-20, hy - 5);
        ctx.closePath();
        ctx.fillStyle = rgba(lC([4,12,32],[1,4,10], row/7), 0.18 - row * 0.02);
        ctx.fill();
      }
      // Wide reflection column
      const refl = ctx.createLinearGradient(W*0.3, hy, W*0.7, hy + H*0.3);
      refl.addColorStop(0, rgba(glowC, 0.18));
      refl.addColorStop(1, rgba(glowC, 0));
      ctx.fillStyle = refl;
      ctx.beginPath();
      ctx.moveTo(W*0.38, hy);
      ctx.lineTo(W*0.62, hy);
      ctx.lineTo(W*0.75, H);
      ctx.lineTo(W*0.25, H);
      ctx.closePath();
      ctx.fill();
      // Specular glints
      for (let i = 0; i < 18; i++) {
        const gx = W * (i * 0.058 + 0.01);
        const gy = hy + 8 + Math.sin(gx * 0.012 + wt * 6) * 16;
        ctx.beginPath();
        ctx.ellipse(gx, gy, 22, 1.8, -0.15, 0, Math.PI * 2);
        ctx.fillStyle = rgba(glowC, 0.14);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawFireGround(hy, glowC, t) {
      ctx.save();
      // Wide molten horizon glow
      const mg = ctx.createLinearGradient(0, hy - H*0.08, 0, hy + H*0.12);
      mg.addColorStop(0,   rgba(glowC, 0));
      mg.addColorStop(0.35, rgba(glowC, 0.38));
      mg.addColorStop(0.65, rgba(glowC, 0.22));
      mg.addColorStop(1,   rgba(glowC, 0));
      ctx.fillStyle = mg;
      ctx.fillRect(0, hy - H*0.08, W, H*0.2);
      // Rocky silhouette — jagged mountain range
      ctx.beginPath();
      ctx.moveTo(-20, hy + 30);
      for (let x = 0; x <= W + 20; x += 18) {
        const rh = 10 + Math.abs(Math.sin(x * 0.055)) * 40 + Math.abs(Math.sin(x * 0.022)) * 22;
        ctx.lineTo(x, hy + 20 - rh);
      }
      ctx.lineTo(W + 20, hy + 50); ctx.lineTo(-20, hy + 50);
      ctx.closePath();
      ctx.fillStyle = rgba([8, 3, 0], 0.92);
      ctx.fill();
      // Crack-glow lines at base
      for (let i = 0; i < 10; i++) {
        const cx2 = W * (0.05 + i * 0.1);
        const lg = ctx.createLinearGradient(cx2, hy, cx2, hy + 38);
        lg.addColorStop(0, rgba(glowC, 0.45));
        lg.addColorStop(1, rgba(glowC, 0));
        ctx.strokeStyle = lg;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(cx2, hy + 4);
        ctx.lineTo(cx2 + 4, hy + 20);
        ctx.lineTo(cx2 - 3, hy + 32);
        ctx.stroke();
      }
      // Foreground rubble
      ctx.beginPath();
      ctx.moveTo(-20, H);
      for (let x = 0; x <= W + 20; x += 14) {
        const rh = 4 + Math.abs(Math.sin(x * 0.08)) * 14;
        ctx.lineTo(x, hy + 50 - rh);
      }
      ctx.lineTo(W + 20, H);
      ctx.closePath();
      ctx.fillStyle = rgba([4, 1, 0], 0.98);
      ctx.fill();
      ctx.restore();
    }

    function drawAirHorizon(hy, glowC, t) {
      ctx.save();
      // Gently undulating hills, very soft
      ctx.beginPath();
      ctx.moveTo(0, hy + 8);
      for (let x = 0; x <= W; x += 6) {
        const h = Math.sin(x * 0.006) * 18 + Math.sin(x * 0.018) * 8;
        ctx.lineTo(x, hy + 8 - h);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = rgba([6, 12, 22], 0.55);
      ctx.fill();
      ctx.restore();
    }

    function drawSpacePlane(hy, glowC, t) {
      ctx.save();
      // Milky Way band — diagonal soft glow
      const mw = ctx.createLinearGradient(0, 0, W, H * 0.7);
      mw.addColorStop(0,    rgba(glowC, 0));
      mw.addColorStop(0.3,  rgba([200, 185, 255], 0.04));
      mw.addColorStop(0.5,  rgba([200, 185, 255], 0.06));
      mw.addColorStop(0.7,  rgba([200, 185, 255], 0.04));
      mw.addColorStop(1,    rgba(glowC, 0));
      ctx.fillStyle = mw;
      ctx.fillRect(0, 0, W, H * 0.7);
      // Flat barren ground
      ctx.beginPath();
      ctx.moveTo(-20, hy + 4);
      for (let x = 0; x <= W + 20; x += 30) {
        const rh = Math.sin(x * 0.004) * 4;
        ctx.lineTo(x, hy + 4 - rh);
      }
      ctx.lineTo(W + 20, H); ctx.lineTo(-20, H);
      ctx.closePath();
      ctx.fillStyle = rgba([3,2,8], 0.96);
      ctx.fill();
      // Ground glow at horizon
      const gndG = ctx.createLinearGradient(0, hy - 10, 0, hy + 30);
      gndG.addColorStop(0, rgba(glowC, 0));
      gndG.addColorStop(0.5, rgba(glowC, 0.12));
      gndG.addColorStop(1, rgba(glowC, 0));
      ctx.fillStyle = gndG;
      ctx.fillRect(0, hy - 10, W, 40);
      // Perspective grid
      for (let i = -5; i <= 5; i++) {
        const gx = W * 0.5 + i * W * 0.14;
        ctx.beginPath();
        ctx.moveTo(gx, hy + 2);
        ctx.lineTo(W * (0.5 + i * 0.55), H);
        ctx.strokeStyle = rgba(glowC, 0.05 - Math.abs(i) * 0.006);
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
      // Horizontal grid lines
      for (let i = 0; i < 6; i++) {
        const ly = hy + 12 + i * i * 8;
        ctx.beginPath();
        ctx.moveTo(0, ly); ctx.lineTo(W, ly);
        ctx.strokeStyle = rgba(glowC, Math.max(0, 0.04 - i * 0.006));
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    /* ---- PARTICLE DRAW ---- */
    function updateParticles(mode, pC, ts, horizonY) {
      parts.forEach(p => {
        switch (mode) {
          case 'dust':    // Earth: slow orbiting motes above ground
            p.x += Math.sin(ts * 0.0005 + p.phase) * 0.18;
            p.y += 0.08 + p.seed * 0.06;
            if (p.y > horizonY + 20) { p.y = horizonY - 60 - Math.random() * H * 0.3; p.x = Math.random() * W; }
            break;
          case 'rain':    // Water: diagonal rainfall
            p.x -= 0.25 + p.seed * 0.15;
            p.y += 2.2 + p.seed * 1.4;
            if (p.y > H) { p.y = -10; p.x = Math.random() * W; }
            break;
          case 'embers':  // Fire: rising sparks with side sway
            p.y -= 1.1 + p.seed * 0.9;
            p.x += Math.sin(ts * 0.0018 + p.phase) * 0.38;
            if (p.y < 0) { p.y = horizonY + 10 + Math.random() * 30; p.x = W * 0.3 + Math.random() * W * 0.4; }
            break;
          case 'feathers': // Air: sweep across with flutter
            p.x += 1.1 + p.seed * 0.6;
            p.y += Math.sin(ts * 0.0012 + p.phase) * 0.25;
            if (p.x > W + 20) { p.x = -20; p.y = Math.random() * H * 0.75; }
            break;
          case 'stars':   // Space: very slow drift, twinkle
            p.x += (p.seed - 0.5) * 0.04;
            p.y += (p.phase / (Math.PI * 2) - 0.5) * 0.04;
            p.op = 0.2 + Math.sin(ts * 0.002 + p.phase) * 0.35 + 0.35;
            break;
        }

        // Draw
        if (mode === 'rain') {
          ctx.save();
          ctx.globalAlpha = p.op * 0.4;
          ctx.strokeStyle = rgba(pC, 1);
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 1.5, p.y + p.len);
          ctx.stroke();
          ctx.restore();
        } else if (mode === 'feathers') {
          ctx.save();
          ctx.globalAlpha = p.op * 0.5;
          ctx.strokeStyle = rgba(pC, 1);
          ctx.lineWidth   = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          const ex = p.x + Math.cos(p.phase) * p.len;
          const ey = p.y + Math.sin(p.phase) * p.len * 0.4;
          ctx.quadraticCurveTo(p.x + p.len * 0.5, p.y - 5, ex, ey);
          ctx.stroke();
          ctx.restore();
        } else if (mode === 'embers') {
          // Embers get a small radial glow
          const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          gr.addColorStop(0,   rgba(pC, p.op * 0.9));
          gr.addColorStop(0.4, rgba(pC, p.op * 0.3));
          gr.addColorStop(1,   rgba(pC, 0));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = gr;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,240,200,${p.op * 0.95})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = rgba(pC, p.op * 0.65);
          ctx.fill();
        }
      });
    }

    /* ---- GEOMETRIC PATH HELPERS ---- */
    function pathTriangleDown(cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx,           cy + r);
      ctx.lineTo(cx - r*0.866, cy - r*0.5);
      ctx.lineTo(cx + r*0.866, cy - r*0.5);
      ctx.closePath();
    }
    function pathTriangleUp(cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx,           cy - r);
      ctx.lineTo(cx - r*0.866, cy + r*0.5);
      ctx.lineTo(cx + r*0.866, cy + r*0.5);
      ctx.closePath();
    }

    /* ---- SINGLE ELEMENT SYMBOL ---- */
    function _drawSymbol(idx, cx, cy, r, alpha, ts) {
      if (alpha < 0.01) return;
      const st    = STAGES[idx];
      const glow  = st.glow;
      const cream = [228, 210, 170];
      const lw    = Math.max(1, r * 0.026);
      const pulse = 1 + Math.sin(ts * 0.0006 + idx * 1.2) * 0.014;
      const pr    = r * pulse;

      ctx.save();

      // Large diffuse aura
      ctx.globalAlpha = alpha * 0.30;
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 3.4);
      aura.addColorStop(0,    rgba(glow, 1));
      aura.addColorStop(0.28, rgba(glow, 0.55));
      aura.addColorStop(0.65, rgba(glow, 0.14));
      aura.addColorStop(1,    rgba(glow, 0));
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, W, H);

      // Tight inner core glow
      ctx.globalAlpha = alpha * 0.28;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 1.1);
      core.addColorStop(0,   rgba(glow, 1));
      core.addColorStop(0.5, rgba(glow, 0.40));
      core.addColorStop(1,   rgba(glow, 0));
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, W, H);

      // Symbol strokes
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = rgba(cream, 1);
      ctx.lineWidth   = lw;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'miter';

      if (idx === 0) {
        // Earth: ▽ with horizontal bar
        pathTriangleDown(cx, cy, pr);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - pr * 0.577, cy);
        ctx.lineTo(cx + pr * 0.577, cy);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.18;
        ctx.lineWidth   = lw * 0.55;
        pathTriangleDown(cx, cy, pr * 0.40);
        ctx.stroke();

      } else if (idx === 1) {
        // Water: ▽ with inner reflection arcs
        pathTriangleDown(cx, cy, pr);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.26;
        ctx.lineWidth   = lw * 0.6;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(cx, cy + pr * 0.14, pr * (0.20 + i * 0.16), Math.PI * 0.16, Math.PI * 0.84);
          ctx.stroke();
        }

      } else if (idx === 2) {
        // Fire: △ with inner warm fill then stroke
        const fireFill = ctx.createRadialGradient(cx, cy - pr * 0.1, 0, cx, cy, pr * 0.78);
        fireFill.addColorStop(0,   rgba([255, 210, 90], 0.22));
        fireFill.addColorStop(0.5, rgba([232, 98, 22],  0.10));
        fireFill.addColorStop(1,   rgba([232, 98, 22],  0));
        ctx.fillStyle   = fireFill;
        ctx.globalAlpha = alpha;
        pathTriangleUp(cx, cy, pr);
        ctx.fill();
        ctx.strokeStyle = rgba(cream, 1);
        ctx.lineWidth   = lw;
        pathTriangleUp(cx, cy, pr);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.18;
        ctx.lineWidth   = lw * 0.55;
        pathTriangleUp(cx, cy + pr * 0.09, pr * 0.42);
        ctx.stroke();

      } else if (idx === 3) {
        // Air: △ with bar + slow rotating outer arc
        pathTriangleUp(cx, cy, pr);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - pr * 0.577, cy);
        ctx.lineTo(cx + pr * 0.577, cy);
        ctx.stroke();
        const rot = ts * 0.00022;
        ctx.globalAlpha = alpha * 0.22;
        ctx.lineWidth   = lw * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, pr * 1.40, rot, rot + Math.PI * 1.75);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, pr * 1.40, rot + Math.PI, rot + Math.PI * 2.75);
        ctx.globalAlpha = alpha * 0.09;
        ctx.stroke();

      } else {
        // Space: ○ + inner ring + central dot + slow dashed outer ring
        ctx.beginPath();
        ctx.arc(cx, cy, pr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.40;
        ctx.lineWidth   = lw * 0.65;
        ctx.beginPath();
        ctx.arc(cx, cy, pr * 0.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = rgba(cream, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, pr * 0.055, 0, Math.PI * 2);
        ctx.fill();
        const rot = ts * 0.00018;
        ctx.globalAlpha = alpha * 0.18;
        ctx.lineWidth   = lw * 0.45;
        ctx.setLineDash([pr * 0.09, pr * 0.18]);
        ctx.beginPath();
        ctx.arc(cx, cy, pr * 1.32, rot, rot + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    /* ---- CROSSFADE BETWEEN ELEMENT SYMBOLS ---- */
    function drawCenterSymbol(si, sp, ts) {
      const cx  = W * 0.5;
      const cy  = H * 0.38;
      const r   = H * 0.16;
      // Current symbol fills most of stage, quick fade at last 25%
      const aOut = jClamp((1 - sp) / 0.25, 0, 1);
      const aIn  = jClamp((sp - 0.75) / 0.25, 0, 1);
      _drawSymbol(si, cx, cy, r, aOut, ts);
      if (si + 1 < STAGES.length) {
        _drawSymbol(si + 1, cx, cy, r, aIn, ts);
      }
    }

    /* ---- POETIC TEXT ---- */
    function drawPoetry(alpha, text, ts) {
      if (alpha <= 0) return;
      const lines = text.split('\n');
      const baseY = H * 0.09;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign   = 'center';
      lines.forEach((line, i) => {
        const size = i === 0 ? H * 0.028 : H * 0.022;
        ctx.font = `300 ${size}px 'Cormorant Garamond', Georgia, serif`;
        ctx.fillStyle = i === 0
          ? `rgba(240, 228, 200, 1)`
          : `rgba(180, 160, 120, 0.9)`;
        ctx.fillText(line, W * 0.5, baseY + i * (size * 1.55));
      });
      ctx.restore();
    }

    /* ---- FIGURE ---- */
    function drawFigure(cx, gy, glowC) {
      const sc = H * 0.065;
      const s  = sc;
      // Shadow pool
      ctx.save();
      const pool = ctx.createRadialGradient(cx, gy, 0, cx, gy, s * 2.2);
      pool.addColorStop(0,   rgba(glowC, 0.22));
      pool.addColorStop(0.6, rgba(glowC, 0.07));
      pool.addColorStop(1,   rgba(glowC, 0));
      ctx.fillStyle = pool;
      ctx.beginPath();
      ctx.ellipse(cx, gy + 2, s * 2.2, s * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = rgba([4, 3, 1], 0.96);
      // Legs
      ctx.beginPath();
      ctx.moveTo(cx - s*0.17, gy);
      ctx.lineTo(cx - s*0.05, gy - s*0.44);
      ctx.lineTo(cx + s*0.05, gy - s*0.44);
      ctx.lineTo(cx + s*0.17, gy);
      ctx.closePath();
      ctx.fill();
      // Torso
      ctx.beginPath();
      ctx.moveTo(cx - s*0.15, gy - s*0.44);
      ctx.lineTo(cx + s*0.15, gy - s*0.44);
      ctx.lineTo(cx + s*0.10, gy - s*0.74);
      ctx.lineTo(cx - s*0.10, gy - s*0.74);
      ctx.closePath();
      ctx.fill();
      // Arms (slightly raised — receptive posture)
      ctx.beginPath();
      ctx.moveTo(cx - s*0.10, gy - s*0.68);
      ctx.lineTo(cx - s*0.28, gy - s*0.52);
      ctx.lineWidth   = s * 0.055;
      ctx.strokeStyle = rgba([4,3,1], 0.96);
      ctx.lineCap     = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + s*0.10, gy - s*0.68);
      ctx.lineTo(cx + s*0.28, gy - s*0.52);
      ctx.stroke();
      // Head
      ctx.beginPath();
      ctx.arc(cx, gy - s*0.84, s*0.105, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rim light
      ctx.save();
      ctx.globalAlpha  = 0.28;
      ctx.strokeStyle  = rgba(glowC, 1);
      ctx.lineWidth    = s * 0.022;
      ctx.lineCap      = 'round';
      ctx.beginPath();
      ctx.arc(cx, gy - s*0.84, s*0.105, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.restore();
    }

    /* ---- MAIN DRAW LOOP ---- */
    function draw(ts) {
      requestAnimationFrame(draw);
      curProg += (rawProg - curProg) * 0.05;

      const stF = curProg * (STAGES.length - 1);
      const si  = jClamp(Math.floor(stF), 0, STAGES.length - 2);
      const sp  = jEase(stF - si);
      const s0  = STAGES[si];
      const s1  = STAGES[si + 1];

      ctx.clearRect(0, 0, W, H);

      // Multi-stop sky gradient
      const skyTop = lC(s0.skyTop, s1.skyTop, sp);
      const skyMid = lC(s0.skyMid, s1.skyMid, sp);
      const skyHor = lC(s0.skyHor, s1.skyHor, sp);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0,    rgba(skyTop, 1));
      skyGrad.addColorStop(0.45, rgba(skyMid, 1));
      skyGrad.addColorStop(1,    rgba(skyHor, 1));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      const glowC    = lC(s0.glow, s1.glow, sp);
      const starBr   = jLerp(s0.starBright, s1.starBright, sp);
      const horizonY = H * 0.60;

      // Stars layer — visible intensity per element
      if (starBr > 0.02) {
        const now = ts;
        stars.forEach(st => {
          const twinkle = st.base + Math.sin(now * st.speed + st.phase) * 0.2;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fillStyle = rgba([220, 215, 240], jClamp(twinkle * starBr, 0, 1));
          ctx.fill();
        });
      }

      // Atmospheric column centred on the symbol position
      const col = ctx.createRadialGradient(W*0.5, H*0.38, 0, W*0.5, H*0.38, H*0.88);
      col.addColorStop(0,    rgba(glowC, 0.18));
      col.addColorStop(0.15, rgba(glowC, 0.09));
      col.addColorStop(0.48, rgba(glowC, 0.03));
      col.addColorStop(1,    rgba(glowC, 0));
      ctx.fillStyle = col;
      ctx.fillRect(0, 0, W, H);

      // Strong horizon glow
      const hGlow = ctx.createRadialGradient(W*0.5, horizonY, 0, W*0.5, horizonY, W*0.55);
      hGlow.addColorStop(0,   rgba(glowC, 0.32));
      hGlow.addColorStop(0.3, rgba(glowC, 0.12));
      hGlow.addColorStop(1,   rgba(glowC, 0));
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, horizonY - H*0.25, W, H*0.5);

      // Ground fill
      const grdC0 = lC(s0.ground0, s1.ground0, sp);
      const grdC1 = lC(s0.ground1, s1.ground1, sp);
      const grd   = ctx.createLinearGradient(0, horizonY, 0, H);
      grd.addColorStop(0, rgba(grdC0, 0.95));
      grd.addColorStop(1, rgba(grdC1, 1));
      ctx.fillStyle = grd;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // Element-specific terrain
      const drawSI = sp > 0.5 ? Math.min(si + 1, STAGES.length - 1) : si;
      drawTerrain(drawSI, sp, horizonY, glowC);

      // Atmospheric mist/fog at horizon
      const fogC = lC(s0.fogCol, s1.fogCol, sp);
      const fog  = ctx.createLinearGradient(0, horizonY - H*0.08, 0, horizonY + H*0.06);
      fog.addColorStop(0,   rgba(fogC, 0));
      fog.addColorStop(0.4, rgba(fogC, 0.28));
      fog.addColorStop(0.7, rgba(fogC, 0.18));
      fog.addColorStop(1,   rgba(fogC, 0));
      ctx.fillStyle = fog;
      ctx.fillRect(0, horizonY - H*0.08, W, H*0.14);

      // Particles
      const pC   = lC(s0.pCol, s1.pCol, sp);
      const mode = sp > 0.5 ? s1.pMode : s0.pMode;
      updateParticles(mode, pC, ts, horizonY);

      // Subtle vignette
      const vig = ctx.createRadialGradient(W*0.5, H*0.5, H*0.3, W*0.5, H*0.5, H*0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // UI updates
      if (drawSI !== lastSI) {
        lastSI = drawSI;
        if (nameEl)  nameEl.textContent  = STAGES[drawSI].name;
        if (qualEl)  qualEl.textContent  = STAGES[drawSI].q;
        if (verseEl) verseEl.textContent = STAGES[drawSI].text.replace(/\n/g, ' ');
        iconEls.forEach((el, i) => {
          if (el) el.classList.toggle('journey__icon-svg--hidden', i !== drawSI);
        });
        stageSpans.forEach((el, i) => el.classList.toggle('active', i === drawSI));
      }
      if (fillEl) fillEl.style.width = (curProg * 100) + '%';
      if (!hintHidden && rawProg > 0.02) {
        hintHidden = true;
        if (hintEl) hintEl.style.opacity = '0';
      }
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  })();

})();
