/* ==========================================================
   GLOBAL STUDIO — shared layout + animations
   ========================================================== */
const SITE = {
  phone: "+39 331 872 9602",
  whatsapp: "393318729602",
  instagram: "https://www.instagram.com/globalstudio.eu/",
  instagramTagged: "https://www.instagram.com/globalstudio.eu/tagged/",
  address: "Piazzale Ravenet, 3, 43125 Parma PR",
  mapsQuery: "Piazzale Ravenet 3, 43125 Parma",
};

// Contatore visite: nessun cookie, nessun dato personale, solo "pagina + giorno = numero".
const STATS_API = "https://script.google.com/macros/s/AKfycbz1Tvz9faqLXRwfGRJlxcS7cRLvT6FtvrdoIbvomUjEog7cJggkcPt3SZZKebCNnf_K/exec";
(function countVisit() {
  const local = ["localhost", "127.0.0.1", ""].includes(location.hostname);
  if (local || navigator.doNotTrack === "1") return;
  const page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  try {
    fetch(STATS_API, { method: "POST", mode: "no-cors", keepalive: true, body: JSON.stringify({ action: "hit", page }) });
  } catch (e) { /* le statistiche non devono mai rompere il sito */ }
})();

const NAV = [
  ["index.html", "Home"],
  ["servizi.html", "Servizi"],
  ["progetti.html", "Progetti"],
  ["prezzi.html", "Prezzi"],
  ["about.html", "About us"],
  ["lavora-con-noi.html", "Lavora con noi"],
];

const ICONS = {
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46m8.06-17.53A11.33 11.33 0 0 0 12.05.63C5.77.63.65 5.74.65 12.03c0 2.01.52 3.97 1.52 5.7L.55 23.63l6.04-1.58a11.4 11.4 0 0 0 5.45 1.39h.01c6.28 0 11.4-5.11 11.4-11.4 0-3.04-1.19-5.9-3.34-8.06"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  arrow: '<svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

const waLink = (text) =>
  `https://wa.me/${SITE.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;

/* ---------- header / footer injection ---------- */
function buildLayout() {
  const page = document.body.dataset.page || "index.html";

  const header = document.getElementById("site-header");
  if (header) {
    const links = NAV.map(
      ([href, label]) => `<li><a href="${href}" class="${href === page ? "active" : ""}">${label}</a></li>`
    ).join("");
    header.className = "site-header";
    header.innerHTML = `
      <div class="container nav">
        <a href="index.html" class="nav-logo" aria-label="Global Studio home"><img src="assets/img/logo.png" alt="Global Studio"></a>
        <ul class="nav-links">${links}</ul>
        <a href="prenota.html" class="btn btn-primary nav-cta magnetic">Prenota ora</a>
        <button class="burger" aria-label="Apri menu"><span></span><span></span><span></span></button>
      </div>`;
    const mobile = document.createElement("nav");
    mobile.className = "mobile-menu";
    mobile.innerHTML =
      NAV.map(([href, label]) => `<a href="${href}" class="${href === page ? "active" : ""}">${label}</a>`).join("") +
      `<a href="prenota.html" class="${page === "prenota.html" ? "active" : ""}" style="color:var(--gold-2)">Prenota ora →</a>`;
    document.body.appendChild(mobile);
    header.querySelector(".burger").addEventListener("click", () => {
      document.body.classList.toggle("menu-open");
    });
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`;
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <div class="reveal">
            <img src="assets/img/logo.png" alt="Global Studio" class="footer-logo">
            <p class="lead">Recording studio, sala posa e produzione a Parma. Passa a trovarci: il globo è sempre acceso.</p>
            <ul class="contact-list">
              <li><a href="${SITE.instagram}" target="_blank" rel="noopener">
                <span class="ci ig">${ICONS.ig}</span>
                <span><small>Instagram</small>@globalstudio.eu</span></a></li>
              <li><a href="${waLink("Ciao Global Studio! Vorrei informazioni.")}" target="_blank" rel="noopener">
                <span class="ci wa">${ICONS.wa}</span>
                <span><small>WhatsApp</small>${SITE.phone}</span></a></li>
              <li><a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE.mapsQuery)}" target="_blank" rel="noopener">
                <span class="ci map">${ICONS.pin}</span>
                <span><small>Dove siamo</small>${SITE.address}</span></a></li>
            </ul>
          </div>
          <a class="map-wrap map-static reveal" data-reveal="zoom" href="${mapsUrl}" target="_blank" rel="noopener noreferrer" aria-label="Apri la posizione su Google Maps">
            <!-- immagine statica: nessuna richiesta a Google finché non si clicca -->
            <img src="assets/img/mappa.webp" alt="Mappa: ${SITE.address}" loading="lazy">
            <span class="map-attrib">Dati mappa ©2026 Google</span>
            <span class="map-cta">Apri su Google Maps</span>
          </a>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Global Studio — Parma · <a href="privacy.html">Privacy policy</a> · <a href="privacy.html#cookie">Cookie policy</a></span>
          <span>Prod · Rec · Mix · Master · Foto · Video</span>
        </div>
      </div>
      <div class="footer-big">Global Studio</div>`;
  }

  const wa = document.createElement("a");
  wa.className = "wa-float";
  wa.href = waLink("Ciao Global Studio! Vorrei informazioni.");
  wa.target = "_blank";
  wa.rel = "noopener";
  wa.setAttribute("aria-label", "Scrivici su WhatsApp");
  wa.innerHTML = `${ICONS.wa}<span class="wa-text">Scrivici ora</span>`;
  document.body.appendChild(wa);

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.prepend(glow);
  window.addEventListener("pointermove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}

/* ---------- header hide/show on scroll ---------- */
function headerScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    header.classList.toggle("hide", y > last && y > 400 && !document.body.classList.contains("menu-open"));
    last = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- reveal on scroll ---------- */
function splitWords() {
  document.querySelectorAll(".split-words").forEach((el) => {
    // gradient text must sit on each word, or it breaks once words are inline-blocks
    const walk = (node, grad) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
            const w = document.createElement("span");
            w.className = "w";
            w.innerHTML = `<span${grad ? ' class="grad"' : ""}>${part}</span>`;
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          const isGrad = child.classList.contains("grad");
          if (isGrad) child.classList.remove("grad");
          walk(child, grad || isGrad);
        }
      });
    };
    walk(el);
    el.querySelectorAll(".w > span").forEach((s, i) => (s.style.transitionDelay = `${i * 0.07}s`));
  });
}

function reveals() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal, .split-words, .step, [data-count]").forEach((el) => io.observe(el));

  document.querySelectorAll("[data-stagger]").forEach((group) => {
    [...group.children].forEach((c, i) => {
      c.classList.add("reveal");
      c.style.transitionDelay = `${i * 0.12}s`;
      io.observe(c);
    });
  });
}

/* ---------- counters ---------- */
function counters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 1800);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  });
  document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));
}

/* ---------- scroll-driven effects (parallax + video grow) ---------- */
function scrollFx() {
  const parallax = [...document.querySelectorAll("[data-parallax]")];
  const frames = [];
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax);
      const offset = (r.top + r.height / 2 - vh / 2) * speed;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    frames.forEach((f) => {
      const r = f.parentElement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / vh));
      f.style.transform = `scale(${0.86 + 0.14 * p})`;
      f.style.borderRadius = `${40 - 24 * p}px`;
    });
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) requestAnimationFrame(update), (ticking = true);
  }, { passive: true });
  update();
}

/* ---------- cards: spotlight + tilt, magnetic buttons ---------- */
function interactions() {
  if (matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      if (card.classList.contains("tilt")) {
        const rx = ((y / r.height) - 0.5) * -8, ry = ((x / r.width) - 0.5) * 8;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  });
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
  });
}

/* ---------- lightbox for galleries ---------- */
function lightbox() {
  const items = document.querySelectorAll("[data-lightbox] img");
  if (!items.length) return;
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = "<img alt=''>";
  document.body.appendChild(box);
  items.forEach((img) =>
    img.addEventListener("click", () => {
      box.querySelector("img").src = img.src;
      box.classList.add("open");
    })
  );
  box.addEventListener("click", () => box.classList.remove("open"));
  document.addEventListener("keydown", (e) => e.key === "Escape" && box.classList.remove("open"));
}

/* ---------- tabs (pricing) ---------- */
function tabs() {
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    root.querySelectorAll("[data-tab]").forEach((tab) =>
      tab.addEventListener("click", () => {
        root.querySelectorAll("[data-tab]").forEach((t) => t.classList.toggle("active", t === tab));
        root.querySelectorAll("[data-panel]").forEach((p) =>
          p.classList.toggle("active", p.dataset.panel === tab.dataset.tab)
        );
      })
    );
  });
}

/* ---------- video sound toggle ---------- */
function videoSound() {
  document.querySelectorAll(".video-sound").forEach((btn) => {
    const video = btn.closest(".video-frame, .media").querySelector("video");
    const render = () =>
      (btn.innerHTML = video.muted
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6M17 9l6 6"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>');
    btn.addEventListener("click", () => {
      video.muted = !video.muted;
      render();
    });
    render();
  });
}

/* ---------- page transitions ---------- */
function pageTransitions() {
  const wipe = document.createElement("div");
  wipe.className = "page-wipe cover";
  document.body.appendChild(wipe);
  requestAnimationFrame(() => requestAnimationFrame(() => wipe.classList.replace("cover", "out")));

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!href || !href.endsWith(".html")) return;
    e.preventDefault();
    wipe.className = "page-wipe in";
    requestAnimationFrame(() => requestAnimationFrame(() => (wipe.className = "page-wipe cover")));
    setTimeout(() => (location.href = href), 650);
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) wipe.className = "page-wipe out";
  });
}

/* ---------- hero starfield (home) ---------- */
function heroStars() {
  const canvas = document.querySelector(".hero-bg canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, stars;
  const resize = () => {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 * devicePixelRatio + 0.2,
      s: Math.random() * 0.25 + 0.05, p: Math.random() * Math.PI * 2,
    }));
  };
  resize();
  window.addEventListener("resize", resize);
  let mx = 0, my = 0;
  window.addEventListener("pointermove", (e) => {
    mx = (e.clientX / innerWidth - 0.5) * 30;
    my = (e.clientY / innerHeight - 0.5) * 30;
  });
  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    stars.forEach((s) => {
      s.y -= s.s;
      if (s.y < 0) s.y = h;
      const a = 0.4 + 0.6 * Math.abs(Math.sin(t / 900 + s.p));
      ctx.fillStyle = `rgba(230, 215, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x + mx * s.r, s.y + my * s.r, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

/* ==========================================================
   INTRO — the Earth from space, zooming in until impact
   ========================================================== */
/* hero video starts only once the intro is over */
function playHeroVideo() {
  const v = document.querySelector(".hero-bg video");
  if (v) v.play().catch(() => {});
}

function intro() {
  const el = document.getElementById("intro");
  if (!el) return playHeroVideo();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.remove();
    return playHeroVideo();
  }
  document.body.classList.add("locked");

  const canvas = el.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const hud = el.querySelector(".intro-hud");
  const flash = el.querySelector(".flash");
  const earth = new Image();
  earth.src = "assets/img/earth.webp";

  const DPR = Math.min(devicePixelRatio || 1, 2);
  let W, H;
  const resize = () => {
    W = canvas.width = innerWidth * DPR;
    H = canvas.height = innerHeight * DPR;
  };
  resize();
  window.addEventListener("resize", resize);

  // 3D starfield flying toward the camera
  const stars = Array.from({ length: 900 }, () => ({
    x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random(),
  }));

  const DURATION = 5000;
  let start = null, finished = false, raf;

  const finish = () => {
    if (finished) return;
    finished = true;
    el.classList.add("done");
    document.body.classList.remove("locked");
    playHeroVideo();
    setTimeout(() => { cancelAnimationFrame(raf); el.remove(); }, 1200);
  };
  el.querySelector(".intro-skip").addEventListener("click", finish);

  const frame = (now) => {
    if (start === null) start = now;
    const t = Math.min(1, (now - start) / DURATION);
    const cx = W / 2, cy = H / 2;
    const minDim = Math.min(W, H);

    // accelerating approach: slow drift, then a violent rush
    const approach = t < 0.35 ? t * 0.25 : 0.0875 + Math.pow((t - 0.35) / 0.65, 3.2) * 0.9125;
    const radius = minDim * 0.09 * Math.pow(70, approach);
    const shake = t > 0.7 ? (t - 0.7) * 40 * DPR : 0;
    const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    // nebula
    const neb = ctx.createRadialGradient(cx * 0.6, cy * 0.5, 0, cx * 0.6, cy * 0.5, minDim);
    neb.addColorStop(0, "rgba(90, 40, 200, 0.18)");
    neb.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, W, H);

    // stars streak harder as we accelerate
    const speed = 0.0015 + Math.pow(t, 3) * 0.05;
    stars.forEach((s) => {
      const pz = s.z;
      s.z -= speed;
      if (s.z <= 0.01) { s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; s.z = 1; return; }
      const x = cx + (s.x / s.z) * minDim * 0.5 + sx;
      const y = cy + (s.y / s.z) * minDim * 0.5 + sy;
      const px = cx + (s.x / pz) * minDim * 0.5 + sx;
      const py = cy + (s.y / pz) * minDim * 0.5 + sy;
      const a = Math.min(1, (1 - s.z) * 1.4);
      ctx.strokeStyle = `rgba(220, 205, 255, ${a})`;
      ctx.lineWidth = (1 - s.z) * 2.2 * DPR;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // atmosphere glow
    const gx = cx + sx, gy = cy + sy;
    const glow = ctx.createRadialGradient(gx, gy, radius * 0.9, gx, gy, radius * 1.45);
    glow.addColorStop(0, "rgba(160, 110, 255, 0.55)");
    glow.addColorStop(0.4, "rgba(123, 60, 255, 0.2)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(gx, gy, radius * 1.45, 0, Math.PI * 2);
    ctx.fill();

    // planet
    if (earth.complete && earth.naturalWidth) {
      // horizontal spin: sample a seamless (mirrored) map through a sphere projection
      const CROP = 560, STRIPS = 120, spin = t * 14;
      ctx.save();
      ctx.beginPath();
      ctx.arc(gx, gy, radius, 0, Math.PI * 2);
      ctx.clip();
      for (let i = 0; i < STRIPS; i++) {
        const u0 = (i / STRIPS) * 2 - 1, u1 = ((i + 1) / STRIPS) * 2 - 1;
        const l0 = Math.asin(u0) + spin, l1 = Math.asin(u1) + spin;
        // map position in [0, 2*CROP): second half is the mirrored crop
        let m0 = ((l0 / Math.PI) * CROP) % (2 * CROP); if (m0 < 0) m0 += 2 * CROP;
        const mw = ((l1 - l0) / Math.PI) * CROP;
        const src = (m) => (m < CROP ? m : 2 * CROP - m);
        let sx = src(m0 + mw / 2) - Math.abs(mw) / 2;
        sx = Math.max(0, Math.min(CROP - Math.abs(mw), sx));
        ctx.drawImage(earth, 170 + sx, 170, Math.max(1, Math.abs(mw)), CROP,
          gx + u0 * radius, gy - radius, (u1 - u0) * radius + 0.6, radius * 2);
      }
      ctx.restore();
      // terminator shadow for a 3D look
      const shade = ctx.createRadialGradient(gx - radius * 0.35, gy - radius * 0.35, radius * 0.2, gx, gy, radius);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(0.75, "rgba(0,0,0,0.15)");
      shade.addColorStop(1, "rgba(10,0,30,0.65)");
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(gx, gy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    hud.style.opacity = t < 0.6 ? Math.min(1, t * 5) : Math.max(0, 1 - (t - 0.6) * 6);
    flash.style.opacity = t > 0.82 ? Math.min(1, (t - 0.82) / 0.14) : 0;

    if (t >= 1) return finish();
    raf = requestAnimationFrame(frame);
  };

  const begin = () => (raf = requestAnimationFrame(frame));
  if (earth.complete) begin();
  else {
    earth.onload = begin;
    earth.onerror = begin;
  }
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  buildLayout();
  intro();
  headerScroll();
  splitWords();
  reveals();
  counters();
  scrollFx();
  interactions();
  lightbox();
  tabs();
  videoSound();
  heroStars();
  pageTransitions();
});
