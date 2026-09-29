/* ==========================================================================
   SRI SAI RAJ — A PICTURE IN FOUR ACTS
   Film-leader intro, typewriter, scroll reveals, nav behavior
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Film countdown leader ------------------------------------------ */
  var leader = document.getElementById("film-leader");
  if (leader && !reduceMotion) {
    var num = leader.querySelector(".leader-num");
    var counts = ["3", "2"];
    var i = 0;
    var tick = setInterval(function () {
      i += 1;
      if (i < counts.length) {
        num.textContent = counts[i];
        restartSweep(leader);
      } else {
        clearInterval(tick);
      }
    }, 800);
    setTimeout(function () { leader.remove(); }, 3100);
  } else if (leader) {
    leader.remove();
  }

  function restartSweep(scope) {
    var sweep = scope.querySelector(".leader-sweep");
    if (!sweep) return;
    var clone = sweep.cloneNode(true);
    sweep.parentNode.replaceChild(clone, sweep);
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
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("#site-nav [data-nav]"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

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

  function sweepReveals() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      if (el.classList.contains("visible")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh - 30 || r.bottom < vh) {
        el.classList.add("visible");
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
    el.style.borderRight = "2px solid var(--gold)";
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

  if (typeTargets.length && !reduceMotion) {
    var queue = typeTargets.slice();
    (function next() {
      var el = queue.shift();
      if (!el) return;
      var text = el.getAttribute("data-typewriter");

      (function arm() {
        var r = el.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (r.top < vh - 20 || r.bottom < vh) {
          typewrite(el, text, next);
        } else {
          window.addEventListener("scroll", arm, { passive: true, once: true });
        }
      })();
    })();
  } else {
    typeTargets.forEach(function (el) { el.textContent = el.getAttribute("data-typewriter") || el.textContent; });
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
  }
})();
