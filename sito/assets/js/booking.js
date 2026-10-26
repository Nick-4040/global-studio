/* ==========================================================
   GLOBAL STUDIO — booking calendar
   Edit BOOKING to change services, opening hours and blocked slots.
   ========================================================== */
const BOOKING = {
  whatsapp: "393318729602",
  api: "https://script.google.com/macros/s/AKfycbz1Tvz9faqLXRwfGRJlxcS7cRLvT6FtvrdoIbvomUjEog7cJggkcPt3SZZKebCNnf_K/exec", // URL dell'app web Google Apps Script (vuoto = solo WhatsApp)
  daysAhead: 60,   // how far in the future people can book
  minNoticeHours: 2, // no bookings starting sooner than this
  services: [
    { id: "rec", name: "Sessione Rec", note: "con fonico" },
    { id: "mix", name: "Mix & Master", note: "in presenza" },
    { id: "prod", name: "Produzione", note: "beat / arrangiamento" },
    { id: "foto", name: "Shooting foto/video", note: "sala posa" },
    { id: "sala-rec", name: "Affitto sala rec", note: "senza fonico" },
    { id: "sala-foto", name: "Affitto sala foto", note: "a ore" },
  ],
  // 0 = domenica ... 6 = sabato → [prima ora, ultima ora di inizio]; null = chiuso
  hours: {
    0: null,
    1: [10, 21],
    2: [10, 21],
    3: [10, 21],
    4: [10, 21],
    5: [10, 22],
    6: [11, 20],
  },
  // Orari già occupati, formato "AAAA-MM-GG": ["HH:00", ...]. Esempio:
  busy: {
    // "2026-11-03": ["15:00", "16:00"],
  },
  closedDates: [
    // "2026-12-25",
  ],
};

// Orari occupati: dal calendario Google se BOOKING.api è impostato, altrimenti da BOOKING.busy.
async function loadBusy() {
  if (!BOOKING.api) return BOOKING.busy;
  try {
    const r = await fetch(`${BOOKING.api}?action=busy&t=${Date.now()}`);
    return (await r.json()).busy || {};
  } catch (e) {
    return BOOKING.busy;
  }
}

(function () {
  const root = document.getElementById("booking");
  if (!root) return;

  const MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const DOW = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const pad = (n) => String(n).padStart(2, "0");
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDay = new Date(today);
  lastDay.setDate(lastDay.getDate() + BOOKING.daysAhead);

  let busy = {};
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedSlots = new Set();

  const el = {
    services: root.querySelector(".service-pick"),
    title: root.querySelector(".cal-head strong"),
    prev: root.querySelector(".cal-prev"),
    next: root.querySelector(".cal-next"),
    grid: root.querySelector(".cal-grid"),
    slots: root.querySelector(".slots-wrap"),
    dayLabel: root.querySelector(".day-label"),
    summary: root.querySelector(".summary"),
    form: root.querySelector("form"),
    msg: root.querySelector(".form-msg"),
  };

  el.services.innerHTML = BOOKING.services
    .map((s, i) => `<label><input type="radio" name="service" value="${s.id}" ${i === 0 ? "checked" : ""}>${s.name}<small>${s.note}</small></label>`)
    .join("");
  el.services.addEventListener("change", renderSummary);

  const currentService = () => {
    const id = root.querySelector('input[name="service"]:checked').value;
    return BOOKING.services.find((s) => s.id === id);
  };

  function slotsFor(date) {
    const range = BOOKING.hours[date.getDay()];
    if (!range || BOOKING.closedDates.includes(key(date))) return [];
    const taken = busy[key(date)] || [];
    const now = new Date();
    const out = [];
    for (let h = range[0]; h <= range[1]; h++) {
      const start = new Date(date);
      start.setHours(h, 0, 0, 0);
      const label = `${pad(h)}:00`;
      const tooSoon = start - now < BOOKING.minNoticeHours * 3600 * 1000;
      out.push({ label, free: !taken.includes(label) && !tooSoon });
    }
    return out;
  }

  function dayAvailable(date) {
    return date >= today && date <= lastDay && slotsFor(date).some((s) => s.free);
  }

  function renderCalendar() {
    el.title.textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    el.prev.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    el.next.disabled = new Date(view.getFullYear(), view.getMonth() + 1, 1) > lastDay;

    const first = (view.getDay() + 6) % 7; // monday-first
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let html = DOW.map((d) => `<div class="cal-dow">${d}</div>`).join("");
    for (let i = 0; i < first; i++) html += `<span class="cal-day empty"></span>`;
    for (let d = 1; d <= days; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const cls = ["cal-day"];
      if (+date === +today) cls.push("today");
      if (selectedDate && +date === +selectedDate) cls.push("selected");
      html += `<button type="button" class="${cls.join(" ")}" data-day="${d}" ${dayAvailable(date) ? "" : "disabled"}>${d}</button>`;
    }
    el.grid.innerHTML = html;
  }

  function renderSlots() {
    if (!selectedDate) {
      el.dayLabel.textContent = "Seleziona un giorno";
      el.slots.innerHTML = `<div class="slots-empty">Scegli una data dal calendario per vedere gli orari liberi.</div>`;
      return;
    }
    const label = selectedDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
    el.dayLabel.textContent = label[0].toUpperCase() + label.slice(1);
    const slots = slotsFor(selectedDate);
    el.slots.innerHTML = `<div class="slots">${slots
      .map((s) => `<button type="button" class="slot ${selectedSlots.has(s.label) ? "selected" : ""}" data-slot="${s.label}" ${s.free ? "" : "disabled"}>${s.label}</button>`)
      .join("")}</div>`;
  }

  function renderSummary() {
    const service = currentService();
    if (!selectedDate || !selectedSlots.size) {
      el.summary.innerHTML = `Servizio: <b>${service.name}</b><br>Seleziona giorno e uno o più orari.`;
      return;
    }
    const hours = [...selectedSlots].sort();
    el.summary.innerHTML = `Servizio: <b>${service.name}</b><br>Data: <b>${selectedDate.toLocaleDateString("it-IT")}</b><br>Orari: <b>${hours.join(", ")}</b> (${hours.length} ${hours.length === 1 ? "ora" : "ore"})`;
  }

  el.prev.addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    renderCalendar();
  });
  el.next.addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    renderCalendar();
  });
  el.grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day]");
    if (!btn || btn.disabled) return;
    selectedDate = new Date(view.getFullYear(), view.getMonth(), +btn.dataset.day);
    selectedSlots.clear();
    renderCalendar();
    renderSlots();
    renderSummary();
  });
  el.slots.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-slot]");
    if (!btn || btn.disabled) return;
    const s = btn.dataset.slot;
    selectedSlots.has(s) ? selectedSlots.delete(s) : selectedSlots.add(s);
    btn.classList.toggle("selected");
    renderSummary();
  });

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = el.form.elements;
    const err = (t) => { el.msg.className = "form-msg err"; el.msg.textContent = t; };
    if (!selectedDate || !selectedSlots.size) return err("Scegli una data e almeno un orario.");
    if (!f.name.value.trim()) return err("Inserisci il tuo nome.");
    if (!/^[+\d\s]{8,}$/.test(f.phone.value.trim())) return err("Inserisci un numero di telefono valido.");

    const service = currentService();
    const hours = [...selectedSlots].sort();
    const text = [
      "*Nuova richiesta di prenotazione — Global Studio*",
      `Servizio: ${service.name}`,
      `Data: ${selectedDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`,
      `Orari: ${hours.join(", ")} (${hours.length}h)`,
      `Nome: ${f.name.value.trim()}`,
      `Telefono: ${f.phone.value.trim()}`,
      f.artist.value.trim() ? `Nome d'arte: ${f.artist.value.trim()}` : null,
      f.notes.value.trim() ? `Note: ${f.notes.value.trim()}` : null,
    ].filter(Boolean).join("\n");

    const openWhatsApp = () => {
      window.open(`https://wa.me/${BOOKING.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
      el.msg.className = "form-msg ok";
      el.msg.textContent = "Si è aperto WhatsApp con la richiesta: premi invio e ti confermiamo a breve!";
    };
    if (!BOOKING.api) return openWhatsApp();

    const btn = el.form.querySelector("button[type=submit]");
    btn.disabled = true;
    el.msg.className = "form-msg";
    el.msg.textContent = "Invio in corso...";
    const payload = {
      service: service.name,
      date: key(selectedDate),
      hours,
      name: f.name.value.trim(),
      phone: f.phone.value.trim(),
      artist: f.artist.value.trim(),
      notes: f.notes.value.trim(),
    };
    fetch(BOOKING.api, { method: "POST", body: JSON.stringify(payload) })
      .then((r) => r.json())
      .then(async (res) => {
        if (res.ok) {
          el.msg.className = "form-msg ok";
          el.msg.textContent = "Richiesta inviata! Gli orari scelti sono già bloccati: ti confermiamo a breve.";
          selectedSlots.clear();
          el.form.reset();
        } else if (res.error === "taken") {
          err("Questo orario è appena stato prenotato da qualcun altro. Scegline un altro.");
          selectedSlots.clear();
        } else {
          throw new Error(res.error);
        }
        busy = await loadBusy();
        renderCalendar(); renderSlots(); renderSummary();
      })
      .catch(openWhatsApp)
      .finally(() => (btn.disabled = false));
  });

  loadBusy().then((b) => {
    busy = b || {};
    renderCalendar();
    renderSlots();
    renderSummary();
  });
})();
