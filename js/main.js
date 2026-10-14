/* =========================================================
   Afsara Afrose — Portfolio interactions
   No dependencies. Every effect degrades gracefully: without
   JavaScript the page is fully readable, and motion is switched
   off for visitors who ask their device to reduce it.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  /* ---------- Theme ---------- */
  const themeColor = $('meta[name="theme-color"]');
  const syncThemeColor = () => {
    if (themeColor) themeColor.content = getComputedStyle(root).getPropertyValue('--bg').trim();
  };
  syncThemeColor();

  const themeToggle = $('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('aa-theme', next); } catch (e) { /* private mode */ }
      syncThemeColor();
    });
  }

  /* ---------- Hero name: split into letters ---------- */
  $$('[data-split]').forEach((el, lineIndex) => {
    const text = el.textContent;
    el.textContent = '';
    Array.from(text).forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.setProperty('--i', i);
      span.style.setProperty('--base', `${lineIndex * 180 + 150}ms`);
      el.appendChild(span);
    });
  });
  requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('is-loaded')));

  /* ---------- Scroll reveal ---------- */
  $$('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--d', `${i * 90}ms`);
    });
  });

  $$('.skill .chips').forEach((list) => {
    Array.from(list.children).forEach((chip, i) => {
      chip.style.setProperty('--cd', `${i * 45 + 250}ms`);
    });
  });

  const revealEls = $$('.reveal');
  const showReveal = (el) => {
    el.classList.add('is-in');
    // Clear the stagger delay afterwards so hover transitions respond instantly.
    window.setTimeout(() => el.style.setProperty('--d', '0s'), 1600);
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showReveal(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach(showReveal);
  }

  /* ---------- About statement: words light up with the scroll ---------- */
  const wordsEl = $('[data-words]');
  let words = [];
  if (wordsEl) {
    const wrapWords = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) { wrapWords(child); return; }
        if (child.nodeType !== Node.TEXT_NODE) return;
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = part;
          frag.appendChild(span);
        });
        node.replaceChild(frag, child);
      });
    };
    wrapWords(wordsEl);
    words = $$('.word', wordsEl);
    if (reduceMotion) words.forEach((w) => w.classList.add('is-lit'));
  }
  const lightWords = () => {
    if (!words.length || reduceMotion) return;
    const rect = wordsEl.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the statement enters near the bottom of the screen, 1 once it reaches the upper third.
    const p = clamp((vh * 0.88 - rect.top) / (vh * 0.5 + rect.height), 0, 1);
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
  };

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => {
      el.textContent = (0).toFixed(parseInt(el.dataset.decimals || '0', 10));
      countObserver.observe(el);
    });
  }

  /* ---------- Rotating role line ---------- */
  const rotator = $('.rotator');
  if (rotator && !reduceMotion) {
    const items = $$(':scope > span', rotator);
    let index = 0;
    window.setInterval(() => {
      const current = items[index];
      index = (index + 1) % items.length;
      const next = items[index];
      current.classList.remove('is-active');
      current.classList.add('is-leaving');
      next.classList.remove('is-leaving');
      next.classList.add('is-active');
      window.setTimeout(() => current.classList.remove('is-leaving'), 750);
    }, 2800);
  }

  /* ---------- Scroll-linked: nav state, progress bar, About words, timeline ---------- */
  const nav = $('#nav');
  const progressBar = $('.progress__bar');
  const timeline = $('.timeline');
  const timelineFill = $('.timeline__fill');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;

    if (progressBar) progressBar.style.setProperty('--p', max > 0 ? clamp(y / max, 0, 1) : 0);

    if (nav) {
      nav.classList.toggle('is-scrolled', y > 24);
      const goingDown = y > lastY && y > 320;
      nav.classList.toggle('is-hidden', goingDown && !body.classList.contains('menu-open'));
    }

    lightWords();

    if (timeline && timelineFill) {
      const rect = timeline.getBoundingClientRect();
      const p = (window.innerHeight * 0.6 - rect.top) / rect.height;
      timelineFill.style.setProperty('--p', clamp(p, 0, 1));
    }

    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window && navLinks.length) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('is-active'));
        const link = byId.get(entry.target.id);
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
  };
  if (burger && menu) {
    setMenu(false);
    burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    // Project cards tilt toward the pointer.
    $$('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--rx', `${(0.5 - y) * 5}deg`);
        card.style.setProperty('--ry', `${(x - 0.5) * 7}deg`);
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        ['--rx', '--ry', '--mx', '--my'].forEach((p) => card.style.removeProperty(p));
      });
    });

    // Soft highlight that follows the pointer across cards.
    $$('.spot').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });

    // Buttons lean slightly toward the pointer.
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    // Hero portrait parallax.
    const parallax = $('[data-parallax]');
    const hero = $('.hero');
    if (parallax && hero) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        parallax.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        parallax.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      hero.addEventListener('pointerleave', () => {
        parallax.style.setProperty('--px', 0);
        parallax.style.setProperty('--py', 0);
      });
    }

    // Cursor ring that trails the pointer.
    const cursor = $('.cursor');
    if (cursor) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const follow = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.1 ? requestAnimationFrame(follow) : 0;
      };
      window.addEventListener('pointermove', (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!cursor.classList.contains('is-on')) {
          cx = tx;
          cy = ty;
          cursor.classList.add('is-on');
        }
        if (!raf) raf = requestAnimationFrame(follow);
        cursor.classList.toggle('is-hover', Boolean(e.target.closest('a, button, .project')));
      }, { passive: true });
      root.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
    }
  }

  /* ---------- Toast ---------- */
  const toastEl = $('.toast');
  let toastTimer = 0;
  const toast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  };

  /* ---------- Copy to clipboard ---------- */
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback for pages opened straight from disk or older browsers.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  };

  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copy);
      toast(ok ? 'Email address copied' : btn.dataset.copy);
    });
  });

  /* ---------- Dhaka local time & current year ---------- */
  const clocks = $$('[data-clock]');
  if (clocks.length) {
    let formatter = null;
    try {
      formatter = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Dhaka',
      });
    } catch (e) { formatter = null; }
    if (formatter) {
      const tickClock = () => {
        const label = `${formatter.format(new Date())} GMT+6`;
        clocks.forEach((el) => { el.textContent = label; });
      };
      tickClock();
      window.setInterval(tickClock, 20000);
    }
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
