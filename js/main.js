/* ==========================================================================
   MIN MÊ PHỤ KIỆN — main.js
   Vanilla ES2023, no build step. Every block guards for the element it
   needs, so this single file works unmodified on the homepage and on
   every blog page.
   ========================================================================== */

/* ---- Theme (light / dark / system), persisted -------------------------- */
(() => {
  const root = document.documentElement;
  const KEY = "mmpk-theme";
  const saved = localStorage.getItem(KEY);
  if (saved) root.setAttribute("data-theme", saved);

  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
  });
})();

/* ---- Sticky header on scroll -------------------------------------------- */
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---- Mobile nav ----------------------------------------------------------- */
(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  const scrim = document.querySelector(".nav-scrim");
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    scrim?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    nav.classList.add("is-open");
    toggle.classList.add("is-open");
    scrim?.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };
  toggle.addEventListener("click", () => (nav.classList.contains("is-open") ? close() : open()));
  scrim?.addEventListener("click", close);
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  window.addEventListener("keydown", (e) => e.key === "Escape" && close());
})();

/* ---- Scroll-reveal via IntersectionObserver ------------------------------ */
(() => {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => io.observe(el));
})();

/* ---- Back to top ----------------------------------------------------------- */
(() => {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("is-visible", window.scrollY > 700),
    { passive: true }
  );
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();

/* ---- Gallery: filter chips + lightbox ------------------------------------- */
(() => {
  const grid = document.querySelector(".masonry");
  if (!grid) return;
  const chips = document.querySelectorAll(".filter-chip");
  const items = grid.querySelectorAll(".masonry-item");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      const cat = chip.dataset.filter;
      items.forEach((item) => {
        const match = cat === "all" || item.dataset.category === cat;
        item.classList.toggle("is-hidden", !match);
      });
    });
  });

  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = lightbox?.querySelector("img");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  let lastFocused = null;
  if (lightbox && lightboxImg) {
    const openLightbox = (img) => {
      lastFocused = document.activeElement;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("is-open");
      lightboxClose?.focus();
    };
    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      lastFocused?.focus();
    };
    grid.addEventListener("click", (e) => {
      const item = e.target.closest(".masonry-item");
      if (!item) return;
      openLightbox(item.querySelector("img"));
    });
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.closest(".lightbox-close")) closeLightbox();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }
})();

/* ---- Testimonial slider ----------------------------------------------------- */
(() => {
  const track = document.querySelector(".review-track");
  if (!track) return;
  const prev = document.querySelector('[data-review-nav="prev"]');
  const next = document.querySelector('[data-review-nav="next"]');
  let index = 0;

  const step = () => {
    const card = track.querySelector(".review-card");
    if (!card) return 0;
    return card.getBoundingClientRect().width + 20;
  };
  const max = () => Math.max(track.children.length - 1, 0);
  const move = (dir) => {
    index = Math.min(Math.max(index + dir, 0), max());
    track.style.transform = `translateX(-${index * step()}px)`;
  };
  next?.addEventListener("click", () => move(1));
  prev?.addEventListener("click", () => move(-1));

  /* debounced resize to avoid excessive layout reads */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      index = Math.min(index, max());
      track.style.transform = `translateX(-${index * step()}px)`;
    }, 120);
  }, { passive: true });
})();

/* ---- Reading progress bar (blog article pages) ----------------------------- */
(() => {
  const bar = document.querySelector(".reading-progress");
  const article = document.querySelector(".article-body");
  if (!bar || !article) return;
  const onScroll = () => {
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    bar.style.width = `${total > 0 ? (scrolled / total) * 100 : 0}%`;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---- Blog search filter ------------------------------------------------------ */
(() => {
  const input = document.querySelector("[data-blog-search]");
  const cards = document.querySelectorAll("[data-post-card]");
  if (!input || !cards.length) return;
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? "" : "none";
    });
  });
})();

/* ---- Cookie notice ------------------------------------------------------------ */
(() => {
  const banner = document.querySelector(".cookie-banner");
  if (!banner) return;
  const KEY = "mmpk-cookie-ack";
  if (!localStorage.getItem(KEY)) {
    setTimeout(() => banner.classList.add("is-visible"), 900);
  }
  banner.querySelector("[data-cookie-accept]")?.addEventListener("click", () => {
    localStorage.setItem(KEY, "1");
    banner.classList.remove("is-visible");
  });
})();

/* ---- Lazy-load native fallback (images already use loading="lazy") --------- */
(() => {
  document.querySelectorAll("img[data-src]").forEach((img) => {
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  });
})();

/* ---- Service worker registration ---------------------------------------------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      /* offline shell is a progressive enhancement — fail silently */
    });
  });
}
