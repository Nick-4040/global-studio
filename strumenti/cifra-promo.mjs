// Genera il blocco cifrato per sito/regalo.html.
// Uso:  node strumenti/cifra-promo.mjs "PAROLA SEGRETA" "CODICE-PROMO"
// Poi copia la riga stampata al posto di "const SCRIGNO = ..." in sito/regalo.html.
// Né la parola né il codice finiscono in chiaro nella pagina: il codice si
// decifra solo nel browser di chi inserisce la parola giusta.
import { webcrypto as crypto } from "node:crypto";

const [parola, codice] = process.argv.slice(2);
if (!parola || !codice) {
  console.error('Uso: node strumenti/cifra-promo.mjs "PAROLA SEGRETA" "CODICE-PROMO"');
  process.exit(1);
}

// Stessa normalizzazione della pagina: maiuscolo, senza accenti né spazi.
const normalizza = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "").toUpperCase();

const ITER = 250000;
const b64 = (buf) => Buffer.from(buf).toString("base64");
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normalizza(parola)), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
);
const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify({ codice })));

console.log(`const SCRIGNO = ${JSON.stringify({ iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) })};`);
