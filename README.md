# Global Studio

Sito e contenuti di **Global Studio**, recording studio a Parma (Piazzale Ravenet 3).
Instagram [@globalstudio.eu](https://www.instagram.com/globalstudio.eu/) · WhatsApp +39 331 872 9602

## Struttura del repository

| Cartella | Contenuto |
|---|---|
| `sito/` | Il sito (HTML/CSS/JS statico). Viene pubblicato su GitHub Pages dal workflow `.github/workflows/pages.yml` |
| `sito/assets/css/style.css` | **Unica fonte dello stile**: colori, font e componenti (variabili in `:root`) |
| `sito/assets/js/main.js` | Header/footer condivisi, animazioni, intro con il globo. Contatti e menu sono in `SITE` e `NAV` in cima al file |
| `sito/assets/js/booking.js` | Calendario prenotazioni: servizi, orari di apertura, giorni chiusi (oggetto `BOOKING`) |
| `apps-script/Code.gs` | Backend Google Apps Script delle prenotazioni |
| `Immagini/` | Originali di foto e video |
| `Video/` | Video finiti (promo social e presentazione per il cliente) |
| `Video/sorgenti/` | Script che generano i video, vedi sotto |

## Identità visiva

**Mood:** notte, neon viola, calore dorato. Un mondo (il globo) che gira intorno alla musica. Tono diretto, giovane, da trap/rap, ma pulito e professionale.

### Colori

| Nome | Valore | Uso |
|---|---|---|
| Sfondo | `#07040f` | Fondo di tutto il sito |
| Sfondo 2 / 3 | `#0e0820` / `#160d30` | Card, pannelli, fasce |
| Testo | `#f4f1fb` | Testo principale |
| Testo attenuato | `#a69cc0` | Paragrafi, etichette |
| Viola | `#7b3cff` | Colore primario, pulsanti, glow |
| Viola chiaro | `#b06bff` | Gradienti, bordi attivi |
| Magenta | `#e040fb` | Secondo estremo del gradiente |
| Oro | `#d6a034` | Logo (globo), pulsante secondario |
| Oro chiaro | `#f2c25b` | Eyebrow, numeri, accenti, parola in evidenza |
| WhatsApp | `#25d366` | Solo bottone WhatsApp |
| Linee | `rgba(255,255,255,.09)` | Bordi sottili |

**Gradiente firma** (testi evidenziati, bordi della card "più scelto"): `linear-gradient(100deg, #b06bff, #e040fb 45%, #f2c25b)`.
**Gradiente pulsante principale:** `linear-gradient(110deg, #7b3cff, #e040fb)`, con ombra viola.
**Pulsante oro:** `linear-gradient(110deg, #d6a034, #f2c25b)` con testo scuro `#1a1205`.

Regola: sfondo sempre scuro, viola e magenta per l'azione, **oro per accenti e invito finale** (es. "Prenota ora"). Non usare altri colori.

### Tipografia

- **Titoli:** *Anton* (Google Fonts), sempre **MAIUSCOLO**, interlinea stretta (`.95`).
- **Testo:** *Space Grotesk* 400/500/600/700.
- **Eyebrow** (piccola etichetta sopra i titoli): Space Grotesk, maiuscolo, spaziatura ampia (`.3em`), oro chiaro, preceduta da una linea di 34px.
- Nei titoli si alternano tre trattamenti per una o due parole: **gradiente** (`.grad`), **solo contorno** (`.outline`, bianco al 75%), **oro** (`.gold`). Esempio: "Un mondo intero *dedicato al tuo suono*".

### Forme ed effetti

- Raggio card 22px; fasce grandi (CTA) 36px; pulsanti e tag a **pillola** (999px).
- Card: fondo bianco al 3-4% con bordo sottile; al passaggio il bordo diventa viola.
- Grana (rumore) leggera su tutto il sito, glow viola dietro logo e pulsanti.
- Anelli concentrici dorati rotanti come motivo decorativo (richiamo del globo).
- Animazioni: comparsa dal basso con `cubic-bezier(.2,.8,.2,1)`, titoli parola per parola, pulsanti "magnetici".
- Foto e video: tono viola/neon (luci della regia), mai filtri caldi aggiuntivi.

### Logo

`sito/assets/img/logo.png` (PNG trasparente): scritta GLOBAL bianca, globo e "STUDIO" oro. Va sempre su fondo scuro, con un leggero glow viola. Non ricolorarlo.

### Parole e testi

Italiano, frasi brevi e dirette. Slogan ricorrenti: **"Il mondo gira qui"**, "Il globo è sempre acceso", "Dall'idea al release", "Passati da qui", "Il prossimo sei tu". Servizi: **Prod · Rec · Mix · Master · Foto · Video · Affitto sale**.

## Contenuti video

Entrambi senza audio, creati in HTML + FFmpeg (nessun software di montaggio):

- `Video/GlobalStudio_Promo_Social_9x16.mp4`: 24 s, 1080x1920, montaggio su griglia a **150 BPM** (drop a 3,2 s), pensato per una base trap.
- `Video/GlobalStudio_Presentazione_Sito.mp4`: 4:26, 1920x1080, giro completo del sito per il cliente.

Per fare nuovi contenuti coerenti: stessi colori e font di sopra, titoli Anton maiuscoli con una parola a gradiente/oro, fondo scuro, logo con glow, chiusura con pulsante oro.

### Rigenerare i video (`Video/sorgenti/`)

Servono Python 3, `playwright` e `imageio-ffmpeg` (`pip install playwright imageio-ffmpeg`), Google Chrome e il sito servito in locale (`python -m http.server 8765` dentro `sito/`).

1. `python tour.py desktop` e `python tour.py mobile`: registrano il sito in tempo reale.
2. `python promo.py render`: genera il promo (scene in `promo/promo.html`).
3. `python walkthrough.py`: monta la presentazione (cartelli in `promo/cards.html`).

Gli script contengono percorsi di lavoro scritti per questo computer (variabile `HERE`, `SITE`, `FFMPEG` in `rec.py`): vanno adattati se cambiano le cartelle.

## Pubblicazione

Ogni push su `main` ripubblica la cartella `sito/` su GitHub Pages.
