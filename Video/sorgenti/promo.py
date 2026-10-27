"""Render promo.html frame by frame. Usage: python promo.py stills 1.0,3.3,... | python promo.py render"""
import asyncio, base64, os, shutil, subprocess, sys, threading, http.server, functools
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from rec import FFMPEG

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "promo")
OUT = os.path.join(HERE, "out", "promo")
SITE = r"C:\Users\NICOLAS\global-studio\sito\assets"
FPS, DUR = 30, 24.0


def stage_assets():
    a = os.path.join(ROOT, "assets")
    os.makedirs(a, exist_ok=True)
    for f in ["img/logo.png", "img/earth.png", "img/affitto-studio.jpg", "img/shooting.jpg", "img/chill-area.jpg",
              "img/chill-area-2.jpg", "img/globo.jpg", "img/prod-rec-mix-master.jpg", "img/artisti-2.jpg",
              "video/prima-pagina.mp4", "video/artisti.mp4"]:
        shutil.copy(os.path.join(SITE, f), a)
    shutil.copy(os.path.join(HERE, "out", "mobile", "mobile.mp4"), a)


def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    h.log_message = lambda *a: None
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8766), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


async def main():
    stage_assets()
    os.makedirs(OUT, exist_ok=True)
    srv = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        page = await b.new_page(viewport={"width": 1080, "height": 1920})
        page.on("console", lambda m: print("console:", m.text))
        page.on("pageerror", lambda e: print("pageerror:", e))
        await page.goto("http://127.0.0.1:8766/promo.html")
        print(await page.evaluate("init()"))
        if sys.argv[1] == "stills":
            for t in sys.argv[2].split(","):
                data = await page.evaluate(f"frame({float(t)})")
                with open(os.path.join(OUT, f"still_{float(t):05.2f}.jpg"), "wb") as f:
                    f.write(base64.b64decode(data.split(",", 1)[1]))
        else:
            out = os.path.join(OUT, "promo.mp4")
            ff = subprocess.Popen([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg",
                                   "-framerate", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "16",
                                   "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", out],
                                  stdin=subprocess.PIPE)
            n = int(DUR * FPS)
            for i in range(n):
                data = await page.evaluate(f"frame({i / FPS})")
                ff.stdin.write(base64.b64decode(data.split(",", 1)[1]))
                if i % 60 == 0:
                    print(f"frame {i}/{n}", flush=True)
            ff.stdin.close()
            ff.wait()
            print("done", out)
        await b.close()
    srv.shutdown()

asyncio.run(main())
