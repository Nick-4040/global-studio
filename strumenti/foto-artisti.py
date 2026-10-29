"""Converte le foto di un artista in WebP per la pagina "Passati da qui".

Uso:
    python strumenti/foto-artisti.py <slug> <foto1.jpg> [foto2.jpg ...]

Esempio:
    python strumenti/foto-artisti.py bello-figo Download/bello/*.jpg

Le foto finiscono in sito/assets/img/artisti/<slug>/01.webp, 02.webp, ...
nell'ordine dato: la prima e' la copertina. Il lato lungo viene ridotto
a 1600 px, la rotazione EXIF applicata e i metadati (GPS ecc.) tolti.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

LATO_MAX = 1600
QUALITA = 80
DEST = Path(__file__).resolve().parent.parent / "sito" / "assets" / "img" / "artisti"


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    slug, foto = sys.argv[1], sys.argv[2:]
    cartella = DEST / slug
    cartella.mkdir(parents=True, exist_ok=True)
    for vecchia in cartella.glob("*.webp"):
        vecchia.unlink()
    for i, src in enumerate(foto, 1):
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        im.thumbnail((LATO_MAX, LATO_MAX), Image.LANCZOS)
        out = cartella / f"{i:02d}.webp"
        im.save(out, "WEBP", quality=QUALITA, method=6)
        print(f"{out.relative_to(DEST.parents[3]).as_posix()}  {im.size[0]}x{im.size[1]}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
