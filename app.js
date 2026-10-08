/* ═══════════════════════════════════════════════════════════════
   NATASYA PUTRI PRATAMA — PORTFOLIO · app.js
   Vanilla JS — no dependencies
   ═══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── 1. Theme toggle (persisted) ───────────────────────────── */
  const root = document.documentElement;
  const storedTheme = (() => {
    try { return localStorage.getItem("npp-theme"); } catch { return null; }
  })();
  const initialTheme =
    storedTheme ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  root.setAttribute("data-theme", initialTheme);

  const toggleTheme = () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("npp-theme", next); } catch { /* ignore */ }
  };
  $("#themeToggle")?.addEventListener("click", toggleTheme);
  $("#themeToggleMobile")?.addEventListener("click", toggleTheme);

  /* ─── 2. Header: scrolled state + scroll progress ───────────── */
  const header = $("#header");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 24);

    const docH =
      document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${docH > 0 ? (y / docH) * 100 : 0}%`;

    toTop?.classList.toggle("is-visible", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
  );

  /* ─── 3. Mobile nav ─────────────────────────────────────────── */
  const burger = $("#burger");
  const nav = $("#nav");
  const backdrop = $("#navBackdrop");

  const setNav = (open) => {
    nav?.classList.toggle("is-open", open);
    burger?.classList.toggle("is-open", open);
    backdrop?.classList.toggle("is-open", open);
    burger?.setAttribute("aria-expanded", String(open));
    burger?.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger?.addEventListener("click", () =>
    setNav(!nav.classList.contains("is-open"))
  );
  backdrop?.addEventListener("click", () => setNav(false));
  $$(".nav__link, .nav__cta a").forEach((link) =>
    link.addEventListener("click", () => setNav(false))
  );
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNav(false);
  });

  /* ─── 4. Active nav link on scroll (spy) ────────────────────── */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__link");

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) =>
            a.classList.toggle(
              "is-active",
              a.getAttribute("href") === `#${id}`
            )
          );
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ─── 5. Reveal on scroll ───────────────────────────────────── */
  const revealEls = $$("[data-reveal]");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  }

  /* ─── 6. Animated counters ──────────────────────────────────── */
  const formatNum = (n) =>
    n >= 1000 ? n.toLocaleString("id-ID") : String(n);

  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) {
      el.textContent = formatNum(target) + suffix;
      return;
    }
    const dur = 1600;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = $$(".counter");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      const cObs = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((c) => cObs.observe(c));
    }
  }

  /* ─── 7. Word rotator in hero ───────────────────────────────── */
  const rotator = $("#rotator");
  if (rotator && !prefersReducedMotion) {
    const words = ["alami", "sederhana", "bermakna", "menyenangkan"];
    let i = 0;

    // seed all words
    rotator.innerHTML = words
      .map(
        (w, idx) =>
          `<span class="rotator__word${idx === 0 ? " is-active" : ""}">${w}</span>`
      )
      .join("");
    const wordEls = $$(".rotator__word", rotator);

    setInterval(() => {
      wordEls[i].classList.remove("is-active");
      i = (i + 1) % wordEls.length;
      wordEls[i].classList.add("is-active");
    }, 2400);
  }

  /* ─── 8. Marquee (duplicated for seamless loop) ─────────────── */
  const track = $("#marqueeTrack");
  if (track) {
    const items = [
      "Mobile App Design",
      "Design System",
      "UX Research",
      "Usability Testing",
      "Prototyping",
      "Figma",
      "Wireframing",
      "Dashboards",
      "Interaction Design",
      "Product Thinking",
    ];
    const build = () =>
      items.map((t) => `<span>${t}</span>`).join("");
    track.innerHTML = build() + build(); // duplicate → -50% loop
  }

  /* ─── 9. Case study expand / collapse ───────────────────────── */
  $$(".work__toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.dataset.target);
      if (!panel) return;
      const open = panel.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      const label = $(".work__toggle-text", btn);
      if (label)
        label.textContent = open
          ? "Sembunyikan detail"
          : "Lihat detail case study";
    });
  });

  /* ─── 10. Cursor glow (desktop only) ────────────────────────── */
  const glow = $("#cursorGlow");
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (glow && isFinePointer && !prefersReducedMotion) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = null;

    window.addEventListener(
      "pointermove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { passive: true }
    );

    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      if (Math.abs(x - cx) > 0.5 || Math.abs(y - cy) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    };
  } else if (glow) {
    glow.style.display = "none";
  }

  /* ─── 11. Contact form validation ───────────────────────────── */
  const form = $("#contactForm");
  const status = $("#formStatus");

  const showErr = (name, msg) => {
    const input = form?.elements[name];
    const span = form?.querySelector(`[data-err-for="${name}"]`);
    if (span) span.textContent = msg || "";
    input?.closest(".field")?.classList.toggle("is-invalid", Boolean(msg));
    return !msg;
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!status) return;

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    let ok = true;
    ok = showErr("name", name ? "" : "Nama wajib diisi.") && ok;
    ok =
      showErr(
        "email",
        !email
          ? "Email wajib diisi."
          : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? ""
          : "Format email belum benar."
      ) && ok;
    ok = showErr("message", message.length >= 10 ? "" : "Pesan minimal 10 karakter.") && ok;

    if (!ok) {
      status.textContent = "Mohon lengkapi field yang ditandai.";
      status.className = "form__status is-err";
      return;
    }

    // Simulate async send (no backend on static site)
    const btn = $("#submitBtn");
    btn?.classList.add("is-loading");
    btn && (btn.disabled = true);

    setTimeout(() => {
      btn?.classList.remove("is-loading");
      btn && (btn.disabled = false);
      form.reset();
      status.textContent =
        "Terima kasih! Pesanmu sudah masuk — saya balas dalam 1×24 jam. ✨";
      status.className = "form__status is-ok";
      setTimeout(() => {
        if (status.classList.contains("is-ok")) {
          status.textContent = "";
          status.className = "form__status";
        }
      }, 6000);
    }, 1400);
  });

  // live-clear errors while typing
  ["name", "email", "message"].forEach((n) => {
    form?.elements[n]?.addEventListener("input", () => showErr(n, ""));
  });

  /* ─── 12. Footer year ───────────────────────────────────────── */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ─── 13. Smooth anchor scrolling (respects reduced motion) ─── */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      (parseInt(getComputedStyle(root).getPropertyValue("--header-h")) || 76) -
      12;
    window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    // move focus for a11y
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
})();
