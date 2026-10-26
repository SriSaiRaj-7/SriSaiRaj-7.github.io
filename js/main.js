/* ==========================================================================
   SRI SAI RAJ — 2001: A SPACE ODYSSEY
   Boot screen (pod bay doors), typewriter, scroll reveals, nav behavior,
   title decode, marker drift, pointer tilt
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Boot screen: the pod bay doors part at ~2.65s ------------------- */
  var boot = document.getElementById("boot-screen");
  if (boot) {
    if (reduceMotion) {
      boot.remove();
    } else {
      setTimeout(function () { boot.remove(); }, 2700);
    }
  }

  /* ---- Flicker overlay -------------------------------------------------- */
  if (!reduceMotion) {
    var flicker = document.createElement("div");
    flicker.className = "flicker";
    document.body.appendChild(flicker);
  }

  /* ---- Nav: scrolled state, active section, mobile menu ------------------ */
  var nav = document.getElementById("site-nav");
  var toggle = document.getElementById("nav-toggle");
  var veil = document.getElementById("nav-veil");
  var progress = document.getElementById("nav-progress");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("#site-nav [data-nav]"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  /* ---- Act markers drift horizontally as they pass — a little depth ----- */
  var actMarkers = Array.prototype.slice.call(document.querySelectorAll(".act-marker"));

  function driftMarkers() {
    if (reduceMotion || !actMarkers.length) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    actMarkers.forEach(function (m) {
      var r = m.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;   /* offscreen: skip */
      var p = (r.top + r.height / 2 - vh / 2) / vh;    /* ≈ -0.5 … 0.5 */
      m.style.transform = "translateX(" + (p * -14).toFixed(1) + "px)";
    });
  }

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 40);

    var current = null;
    var probe = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= probe) current = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", current !== null && a.getAttribute("href") === "#" + current);
    });

    if (progress) {
      var max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      progress.style.width = Math.min(100, Math.max(0, (window.scrollY / max) * 100)) + "%";
    }

    driftMarkers();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
      toggle.textContent = document.body.classList.contains("nav-open") ? "✕" : "☰";
    });
  }
  if (veil) {
    veil.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
      if (toggle) toggle.textContent = "☰";
    });
  }
  navLinks.forEach(function (a) {
    a.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
      if (toggle) toggle.textContent = "☰";
    });
  });

  /* ---- Reveal on scroll (sweep-based, robust to fast jumps) -------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  /* ---- Act cards: the rule draws in, titles decode like teletype -------- */
  var actCards = Array.prototype.slice.call(document.querySelectorAll(".act-card"));
  var DECODE_CHARS = "ABCDEF0123456789/\\|<>+=*·";

  function decodeTitle(el) {
    if (el.getAttribute("data-decoded")) return;
    el.setAttribute("data-decoded", "1");
    var final = el.textContent;
    if (reduceMotion || !final) return;
    /* keep the accessible name stable while the glyphs tumble */
    el.setAttribute("aria-label", final);
    var steps = Math.min(Math.max(final.length, 6), 24);
    var i = 0;
    (function step() {
      i += 1;
      var locked = Math.ceil((final.length * i) / steps);
      var out = "";
      for (var c = 0; c < final.length; c++) {
        var ch = final.charAt(c);
        if (c < locked || ch === " " || ch === "," || ch === "-") out += ch;
        else out += DECODE_CHARS.charAt(Math.floor(Math.random() * DECODE_CHARS.length));
      }
      el.textContent = out;
      if (i < steps) setTimeout(step, 30);
      else el.textContent = final;
    })();
  }

  function sweepReveals() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      if (el.classList.contains("visible")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh - 30 || r.bottom < vh) {
        el.classList.add("visible");
      }
    });

    actCards.forEach(function (card) {
      if (card.classList.contains("in-view")) return;
      var r = card.getBoundingClientRect();
      if (r.top < vh - 60 || r.bottom < vh) {
        card.classList.add("in-view");
        var title = card.querySelector(".section-title");
        if (title) decodeTitle(title);
      }
    });
  }

  window.addEventListener("scroll", sweepReveals, { passive: true });
  window.addEventListener("resize", sweepReveals);
  sweepReveals();

  /* ---- Typewriter: type a few key lines ------------------------------------ */
  var typeTargets = Array.prototype.slice.call(document.querySelectorAll("[data-typewriter]"));

  function typewrite(el, text, done) {
    el.textContent = "";
    el.style.borderRight = "2px solid var(--hal)";
    el.style.paddingRight = "2px";
    var pos = 0;
    var speed = 34;
    (function step() {
      if (pos <= text.length) {
        el.textContent = text.slice(0, pos);
        pos += 1;
        setTimeout(step, speed + Math.random() * 40);
      } else {
        el.style.borderRight = "none";
        if (done) done();
      }
    })();
  }

  var typeQueue = typeTargets.map(function (el) {
    return { el: el, text: el.getAttribute("data-typewriter"), typing: false };
  });

  function pumpTypewriters() {
    if (!typeQueue.length || reduceMotion) return;
    var item = typeQueue[0];
    if (item.typing) return;
    var r = item.el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < vh - 20 || r.bottom < vh) {
      item.typing = true;
      typewrite(item.el, item.text, function () { typeQueue.shift(); });
    }
  }

  if (!typeTargets.length || reduceMotion) {
    typeTargets.forEach(function (el) { el.textContent = el.getAttribute("data-typewriter") || el.textContent; });
  }

  /* ---- Pointer tilt + sheen on the cards (fine pointers only) ----------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    Array.prototype.slice
      .call(document.querySelectorAll(".craft, .serial-card, .contact-card"))
      .forEach(function (card) {
        card.classList.add("tilt");
        var raf = 0, rx = 0, ry = 0;
        var apply = function () {
          raf = 0;
          card.style.setProperty("--rx", rx.toFixed(2) + "deg");
          card.style.setProperty("--ry", ry.toFixed(2) + "deg");
        };
        card.addEventListener("mousemove", function (e) {
          var b = card.getBoundingClientRect();
          var nx = (e.clientX - b.left) / b.width - 0.5;
          var ny = (e.clientY - b.top) / b.height - 0.5;
          ry = nx * 10;                    /* rotateY: lean left / right */
          rx = ny * -8;                    /* rotateX: tip toward cursor */
          card.style.setProperty("--sx", ((nx + 0.5) * 100).toFixed(1) + "%");
          card.style.setProperty("--sy", ((ny + 0.5) * 100).toFixed(1) + "%");
          if (!raf) raf = requestAnimationFrame(apply);
        });
        card.addEventListener("mouseleave", function () {
          rx = 0; ry = 0;
          if (!raf) raf = requestAnimationFrame(apply);
        });
      });
  }

  /* ---- Subtle parallax on hero --------------------------------------------- */
  var hero = document.querySelector(".hero");
  if (hero && !reduceMotion) {
    var heroInner = hero.querySelector(".hero-inner");
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroInner.style.transform = "translateY(" + y * 0.18 + "px)";
        heroInner.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.9)));
      }
    }, { passive: true });

    /* pointer parallax: stars drift with the cursor, the monolith leans
       the other way — the pod-window effect. Fine pointers only. */
    if (window.matchMedia("(pointer: fine)").matches) {
      var px = 0, py = 0, parallaxRaf = 0;
      var applyParallax = function () {
        parallaxRaf = 0;
        hero.style.setProperty("--mx", px.toFixed(1) + "px");
        hero.style.setProperty("--my", py.toFixed(1) + "px");
      };
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width - 0.5) * 24;
        py = ((e.clientY - r.top) / r.height - 0.5) * 16;
        if (!parallaxRaf) parallaxRaf = requestAnimationFrame(applyParallax);
      });
      hero.addEventListener("mouseleave", function () {
        px = 0; py = 0;
        if (!parallaxRaf) parallaxRaf = requestAnimationFrame(applyParallax);
      });
    }
  }

  /* ---- Mission elapsed time: counts the visitor's time aboard ------------ */
  var metEl = document.getElementById("met-clock");
  if (metEl) {
    var metStart = Date.now();
    var metPad = function (n) { return n < 10 ? "0" + n : String(n); };
    var metTick = function () {
      var s = Math.floor((Date.now() - metStart) / 1000);
      metEl.textContent = metPad(Math.floor(s / 3600)) + ":" + metPad(Math.floor(s / 60) % 60) + ":" + metPad(s % 60);
    };
    metTick();
    setInterval(metTick, 1000);
  }

  /* ---- 300ms ticker: belt-and-braces for embedded webviews that drop
         scroll events (kiosk browsers, preview panes). Cheap by design:
         self-terminates once every reveal and typewriter has run. ------- */
  var ticker = setInterval(function () {
    onScroll();
    sweepReveals();
    pumpTypewriters();
    var allRevealed = revealEls.every(function (el) { return el.classList.contains("visible"); }) &&
      actCards.every(function (c) { return c.classList.contains("in-view"); });
    if (allRevealed && typeQueue.length === 0) clearInterval(ticker);
  }, 300);
})();
