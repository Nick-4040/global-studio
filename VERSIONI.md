# Versioni e backup del sito

Ogni tag `backup/...` è un punto a cui si può tornare. Per vedere una versione vecchia: `git switch --detach <tag>`. Per annullare un push già fatto: `git revert <hash>`. Elenco dei tag: `git tag -l -n1`.

| Tag | Commit | Data | Cosa cambia rispetto al tag precedente |
|---|---|---|---|
| `backup/2026-10-28-1217` | ef4c4ff | 28/10/2026 12:17 | Primo punto di riferimento: pagina riservata con card VIP per Apple Wallet. |
| `backup/2026-10-28-2059` | fa106de | 28/10/2026 20:59 | Bottone Google Wallet (tolta la nota su iPhone); marketplace claude-skills nelle impostazioni; immagini in WebP; pagina 404; antispam sulle prenotazioni; contatore visite senza cookie. |
| `backup/2026-10-29-0840` | ca3d566 | 29/10/2026 08:40 | Privacy: font locali, mappa attivata al clic, privacy e cookie policy. |
| `backup/2026-10-29-1706` | e58ae3f | 29/10/2026 17:06 | Mappa con anteprima statica che al primo tocco diventa interattiva (tolto il pulsante Apri su Google Maps); Progetti con gli artisti passati da qui; About con Dave come fondatore. |
| `backup/2026-10-29-1737` | f24d86b | 29/10/2026 17:37 | Progetti con artisti in collage e foto scelte; gallery con foto di dettagli al posto delle stanze; About senza la sezione del fondatore. |
| `backup/2026-10-29-1842` | fe46d04 | 29/10/2026 18:42 | Gallery a nastro con due file che scorrono di lato, card Instagram ferma al centro; video di presentazione nella gallery e come sfondo di Chi siamo. |
| `backup/2026-10-31-0934` | 212beed | 31/10/2026 09:34 | Video come sfondi di About e Progetti; video degli artisti nell'intro di Progetti; card Instagram che apre il profilo; nome dell'artista corretto in Tiara (non Chiaraa). |

I tag sono stati creati a partire dalla data del commit, non da quella in cui sono stati messi. Le note complete stanno anche nei messaggi dei tag: `git show backup/<nome>`.
