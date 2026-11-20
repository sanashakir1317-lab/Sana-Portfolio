/* =========================================================
   SANA SHAKIR — MOTION SYSTEM
   Intro sequence · scroll choreography · gallery filters
   immersive media modal · cursor & interaction details
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  if (hasScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Cinematic intro → hero entrance
  --------------------------------------------------------- */
  const intro = $("#intro");
  const introCount = $("#introCount");
  let introDone = false;

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    if (intro) intro.classList.add("is-done");
    document.body.classList.remove("is-loading");
    document.body.classList.add("hero-ready");
    if (hasScrollTrigger) setTimeout(() => window.ScrollTrigger.refresh(), 120);
  }

  if (reduced || !intro) {
    finishIntro();
  } else {
    const start = performance.now();
    const duration = 1750;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      if (introCount) introCount.textContent = String(Math.round(eased * 100)).padStart(2, "0");
      if (p < 1) requestAnimationFrame(tick);
      else finishIntro();
    };
    requestAnimationFrame(tick);

    intro.addEventListener("click", finishIntro);
    window.addEventListener("keydown", finishIntro, { once: true });
    setTimeout(finishIntro, 3400); // hard safety: never trap the visitor
  }

  /* ---------------------------------------------------------
     Header state + scroll progress
  --------------------------------------------------------- */
  const header = $(".site-header");
  const progress = $("#scrollProgress i");
  let tickingScroll = false;

  function onScroll() {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 24);
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (progress) progress.style.width = `${Math.min((y / max) * 100, 100)}%`;
    tickingScroll = false;
  }
  window.addEventListener("scroll", () => {
    if (!tickingScroll) {
      tickingScroll = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------- */
  const menuToggle = $("#menuToggle");
  const siteNav = $("#siteNav");
  if (menuToggle && siteNav) {
    const setMenu = (open) => {
      siteNav.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    };
    menuToggle.addEventListener("click", () => setMenu(!siteNav.classList.contains("is-open")));
    $$("a", siteNav).forEach((link) => link.addEventListener("click", () => setMenu(false)));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---------------------------------------------------------
     Custom cursor (fine pointers only)
  --------------------------------------------------------- */
  if (finePointer && !reduced) {
    const cursor = $("#cursor");
    const dot = cursor ? $(".cursor-dot", cursor) : null;
    const ring = cursor ? $(".cursor-ring", cursor) : null;
    if (cursor && dot && ring) {
      cursor.style.display = "block";
      let mx = window.innerWidth / 2, my = window.innerHeight / 2;
      let rx = mx, ry = my;

      window.addEventListener("pointermove", (event) => {
        mx = event.clientX;
        my = event.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        cursor.classList.add("is-visible");
      }, { passive: true });

      const loop = () => {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      document.addEventListener("pointerover", (event) => {
        const hot = event.target.closest("a, button, .project, .filter-btn, .tool");
        cursor.classList.toggle("is-hot", Boolean(hot));
      });
      document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
    }
  }

  /* ---------------------------------------------------------
     Magnetic buttons + hero pointer depth
  --------------------------------------------------------- */
  if (finePointer && !reduced) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * 0.2;
        const y = (event.clientY - (rect.top + rect.height / 2)) * 0.2;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

    const hero = $("#hero");
    const stage = $("#heroStage");
    if (hero && stage) {
      hero.addEventListener("pointermove", (event) => {
        const r = hero.getBoundingClientRect();
        const nx = (event.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const ny = (event.clientY - (r.top + r.height / 2)) / (r.height / 2);
        stage.style.transform = `rotateX(${(-ny * 5).toFixed(2)}deg) rotateY(${(nx * 7).toFixed(2)}deg)`;
      }, { passive: true });
      hero.addEventListener("pointerleave", () => { stage.style.transform = ""; });
    }
  }

  /* ---------------------------------------------------------
     Reveals: class states via IO + GSAP choreography
  --------------------------------------------------------- */
  const revealEls = $$("[data-reveal]");
  const projects = $$(".project");
  const allRevealTargets = [...revealEls, ...projects];

  const revealAll = () => {
    allRevealTargets.forEach((el) => {
      el.classList.add("is-visible");
      if (el.classList.contains("project")) el.classList.add("is-revealed");
    });
  };

  if (reduced || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("project")) entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -40px 0px" });
    allRevealTargets.forEach((el) => io.observe(el));
  }

  if (hasGSAP && hasScrollTrigger && !reduced) {
    try {
      const gsap = window.gsap;
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 42 },
          { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true } }
        );
      });

      gsap.utils.toArray(".project").forEach((card) => {
        const inner = $(".media-inner", card);
        if (inner) {
          gsap.fromTo(inner,
            { clipPath: "inset(0 0 100% 0)" },
            { clipPath: "inset(0 0 0% 0)", duration: 1.15, ease: "power4.inOut",
              scrollTrigger: { trigger: card, start: "top 94%", once: true } }
          );
        }
        gsap.fromTo(card,
          { autoAlpha: 0, y: 48 },
          { autoAlpha: 1, y: 0, duration: 0.95, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 94%", once: true } }
        );
      });

      // Controlled parallax depth — never competing with pointer depth.
      gsap.to(".hero-stage-wrap", {
        y: -55, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
      });
      gsap.to(".reel-ghost", {
        xPercent: -7, ease: "none",
        scrollTrigger: { trigger: ".reel-frame", start: "top bottom", end: "bottom top", scrub: 1 }
      });
      gsap.to(".about-ghost", {
        yPercent: -12, ease: "none",
        scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: 1 }
      });
      window.ScrollTrigger.refresh();
    } catch (error) {
      if (hasGSAP) {
        window.gsap.set("[data-reveal], .project, .media-inner, .hero-stage-wrap, .reel-ghost, .about-ghost", { clearProps: "all" });
      }
      revealAll();
    }
  }

  /* ---------------------------------------------------------
     Animated filters + sliding indicator
  --------------------------------------------------------- */
  const filters = $("#filters");
  const glider = $("#filterGlider");
  const filterButtons = $$(".filter-btn");

  function moveGlider(button) {
    if (!filters || !glider || !button) return;
    const parent = filters.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    glider.style.width = `${rect.width}px`;
    glider.style.transform = `translateX(${rect.left - parent.left}px)`;
  }
  const activeFilter = () => $(".filter-btn.is-active", filters || document);
  moveGlider(activeFilter());
  window.addEventListener("resize", () => moveGlider(activeFilter()));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => moveGlider(activeFilter()));
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
      moveGlider(button);

      let index = 0;
      projects.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
        if (!show) return;

        // Clear any GSAP state left from an off-screen card, then replay entrance.
        card.style.opacity = "";
        card.style.visibility = "";
        card.style.transform = "";
        card.classList.add("is-revealed");
        const inner = $(".media-inner", card);
        if (inner) inner.style.clipPath = "";

        if (!reduced && card.animate) {
          card.animate(
            [
              { opacity: 0, transform: "translateY(22px) scale(0.98)" },
              { opacity: 1, transform: "none" }
            ],
            { duration: 560, delay: index * 38, easing: "cubic-bezier(0.22,1,0.36,1)" }
          );
        }
        index += 1;
      });
      if (hasScrollTrigger) setTimeout(() => window.ScrollTrigger.refresh(), 80);
    });
  });

  /* ---------------------------------------------------------
     Immersive media modal + live timecode
  --------------------------------------------------------- */
  const modal = $("#mediaModal");
  const modalMedia = $("#modalMedia");
  const modalCategory = $("#modalCategory");
  const modalTitle = $("#modalTitle");
  const modalDescription = $("#modalDescription");
  const modalKicker = $("#modalKicker");
  const modalTC = $("#modalTimecode");
  const modalProgress = $("#modalProgress");
  const modalProgressWrap = $("#modalProgressWrap");
  const reelTC = $("#reelTimecode");
  const reelProgress = $("#reelProgress");
  let lastFocused = null;

  const pad = (n) => String(n).padStart(2, "0");
  function formatTC(seconds) {
    const fps = 24;
    const s = Math.max(0, seconds || 0);
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(Math.floor((s % 1) * fps))}`;
  }

  function resetReelHUD() {
    if (reelTC) reelTC.textContent = "00:00:00:00";
    if (reelProgress) reelProgress.style.width = "0%";
  }

  function openMedia({ type, src, poster, category, title, description }, trigger) {
    if (!modal || !modalMedia) return;
    lastFocused = trigger || document.activeElement;
    modalMedia.innerHTML = "";
    resetReelHUD();
    if (modalProgress) modalProgress.style.width = "0%";
    if (modalTC) modalTC.textContent = "00:00:00:00";

    const isReel = src && src.indexOf("Sana%20Shakir%20reel.mp4") !== -1;

    if (type === "video" && src) {
      const video = document.createElement("video");
      video.className = "modal-video";
      video.setAttribute("controls", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "metadata");
      video.setAttribute("aria-label", title || "Project video");
      if (poster) video.setAttribute("poster", poster);

      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
      video.appendChild(document.createTextNode("Your browser does not support HTML5 video."));
      modalMedia.appendChild(video);

      const sync = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        const tc = formatTC(video.currentTime);
        const pct = `${(video.currentTime / video.duration) * 100}%`;
        if (modalTC) modalTC.textContent = tc;
        if (modalProgress) modalProgress.style.width = pct;
        if (isReel) {
          if (reelTC) reelTC.textContent = tc;
          if (reelProgress) reelProgress.style.width = pct;
        }
      };
      video.addEventListener("timeupdate", sync);
      video.addEventListener("loadedmetadata", sync);
      video.addEventListener("seeked", sync);
    } else if (src) {
      const image = document.createElement("img");
      image.src = src;
      image.alt = title ? `${title} design` : "Project design";
      modalMedia.appendChild(image);
      if (modalCategory) modalCategory.textContent = "DESIGN PREVIEW";
      if (modalTC) modalTC.textContent = "STILL";
      if (modalProgressWrap) modalProgressWrap.style.visibility = "hidden";
    }

    if (modalProgressWrap) {
      modalProgressWrap.style.visibility = type === "video" ? "visible" : "hidden";
    }
    if (modalKicker) modalKicker.textContent = category || "PROJECT";
    if (modalCategory) modalCategory.textContent = type === "video" ? "PROJECT PREVIEW" : "DESIGN PREVIEW";
    if (modalTitle) modalTitle.textContent = title || "Project";
    if (modalDescription) modalDescription.textContent = description || "";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const closeBtn = $(".modal-close", modal);
    if (closeBtn) {
      // Flush the visibility change before focusing so keyboard users land in the dialog.
      void modal.offsetWidth;
      closeBtn.focus({ preventScroll: true });
    }
  }

  function openProject(card, trigger) {
    if (!card) return;
    openMedia({
      type: card.dataset.type,
      src: card.dataset.video || card.dataset.image || "",
      poster: card.dataset.poster || "",
      category: card.dataset.category === "design" ? "GRAPHIC DESIGN" : "VIDEO EDITING",
      title: card.dataset.title || $(".media-name", card)?.textContent || "Project",
      description: card.dataset.description || $(".project-caption p", card)?.textContent || "",
    }, trigger);
  }

  projects.forEach((card) => {
    const trigger = $(".project-media", card);
    if (trigger) trigger.addEventListener("click", () => openProject(card, trigger));
  });

  const showreelButton = $("#showreelButton");
  if (showreelButton) {
    showreelButton.addEventListener("click", () =>
      openMedia({
        type: "video",
        src: "work/video/Sana%20Shakir%20reel.mp4",
        poster: "work/images/thumbs/video-reel.jpg",
        category: "CINEMATIC SHOWREEL",
        title: "Editing Showreel",
        description: "A short selection of my editing work — shorts, ads and documentary footage.",
      }, showreelButton)
    );
  }

  function closeMedia() {
    if (!modal || !modal.classList.contains("is-open")) return;
    const player = $(".modal-video", modalMedia || modal);
    if (player) player.pause();
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    resetReelHUD();
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    modal.setAttribute("aria-hidden", "true");
  }

  if (modal) {
    $$("[data-close-modal]", modal).forEach((el) => el.addEventListener("click", closeMedia));
    modal.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = $$('a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])', modal)
        .filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (modal && modal.classList.contains("is-open")) closeMedia();
    else if (siteNav && siteNav.classList.contains("is-open")) {
      siteNav.classList.remove("is-open");
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      }
    }
  });
})();
