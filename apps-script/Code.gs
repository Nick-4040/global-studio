/**
 * Global Studio — backend prenotazioni su Google Calendar.
 * Web app (Esegui come: me, Accesso: chiunque).
 *  GET  ?action=busy  -> { busy: { "AAAA-MM-GG": ["HH:00", ...] } }
 *  POST (JSON, text/plain) -> crea un evento "RICHIESTA" e avvisa via email
 */
const CAL_NAME = "Prenotazioni Global Studio";
const TZ = "Europe/Rome";
const DAYS_AHEAD = 70;

function calendar_() {
  const found = CalendarApp.getCalendarsByName(CAL_NAME);
  return found.length ? found[0] : CalendarApp.createCalendar(CAL_NAME, { timeZone: TZ });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const now = new Date();
  const end = new Date(now.getTime() + DAYS_AHEAD * 86400000);
  const busy = {};
  calendar_().getEvents(now, end).forEach((ev) => {
    // ogni ora toccata dall'evento risulta occupata
    let t = new Date(ev.getStartTime().getTime());
    t.setMinutes(0, 0, 0);
    while (t < ev.getEndTime()) {
      const day = Utilities.formatDate(t, TZ, "yyyy-MM-dd");
      (busy[day] = busy[day] || []).push(Utilities.formatDate(t, TZ, "HH:00"));
      t = new Date(t.getTime() + 3600000);
    }
  });
  return json_({ busy: busy });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const hours = (d.hours || []).slice().sort();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !hours.length || hours.length > 12 ||
        !hours.every((h) => /^\d{2}:00$/.test(h)) || !String(d.name || "").trim()) {
      return json_({ ok: false, error: "invalid" });
    }
    const cal = calendar_();
    const at = (h) => Utilities.parseDate(d.date + " " + h, TZ, "yyyy-MM-dd HH:mm");
    const plusHour = (h) => new Date(at(h).getTime() + 3600000);

    // raggruppa le ore consecutive
    const groups = [];
    hours.forEach((h) => {
      const g = groups[groups.length - 1];
      if (g && +plusHour(g[g.length - 1]) === +at(h)) g.push(h); else groups.push([h]);
    });

    for (const g of groups) {
      if (cal.getEvents(at(g[0]), plusHour(g[g.length - 1])).length) return json_({ ok: false, error: "taken" });
    }

    const clean = (s) => String(s || "").slice(0, 300);
    const description = [
      "Servizio: " + clean(d.service),
      "Nome: " + clean(d.name),
      "Telefono: " + clean(d.phone),
      d.artist ? "Nome d'arte: " + clean(d.artist) : "",
      d.notes ? "Note: " + clean(d.notes) : "",
      "",
      "Per confermare: togli \"RICHIESTA\" dal titolo. Per rifiutare: elimina l'evento (lo slot torna libero).",
    ].filter((l) => l !== "").join("\n");

    groups.forEach((g) => {
      const ev = cal.createEvent("RICHIESTA - " + clean(d.service) + " - " + clean(d.name), at(g[0]), plusHour(g[g.length - 1]), { description: description });
      ev.addPopupReminder(30);
    });

    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      "Nuova prenotazione: " + clean(d.name) + " - " + d.date + " " + hours.join(", "),
      description + "\n\nData: " + d.date + "\nOrari: " + hours.join(", ")
    );
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "server" });
  } finally {
    lock.releaseLock();
  }
}

/** Esegui una volta dall'editor per concedere i permessi e creare il calendario. */
function setup() {
  calendar_();
  MailApp.getRemainingDailyQuota();
}
