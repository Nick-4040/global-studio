"""Assemble the client walkthrough: title card, desktop tour, mobile tour in a phone mockup, end card."""
import asyncio, functools, http.server, os, re, subprocess, sys, threading
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from rec import FFMPEG

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "promo")
OUT = os.path.join(HERE, "out", "walk")
DESK = os.path.join(HERE, "out", "desktop", "desktop.mp4")
MOB = os.path.join(HERE, "out", "mobile", "mobile.mp4")
XF = 0.8  # crossfade length


def duration(path):
    err = subprocess.run([FFMPEG, "-hide_banner", "-i", path], capture_output=True, text=True).stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


async def cards():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8767), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        page = await b.new_page(viewport={"width": 1920, "height": 1080})
        for c in ("title", "mbg", "mframe", "end"):
            await page.goto(f"http://127.0.0.1:8767/cards.html?{c}#{c}")
            await page.evaluate("document.fonts.ready")
            await page.wait_for_timeout(300)
            await page.screenshot(path=os.path.join(OUT, f"{c}.png"), omit_background=(c == "mframe"))
        await b.close()
    srv.shutdown()


def assemble():
    d1, d2 = duration(DESK), duration(MOB)
    t_title, t_end = 4.0, 5.0
    norm = "fps=30,scale=out_range=tv:out_color_matrix=bt709,format=yuv420p,settb=AVTB,setsar=1"
    g = [
        f"[0:v]{norm}[a]",
        f"[1:v]scale=1920:1080,{norm}[b]",
        f"[3:v]scale=426:922:flags=lanczos[ms]",
        f"[2:v][ms]overlay=1200:79:shortest=1[m1]",
        f"[m1][4:v]overlay=0:0,{norm}[c]",
        f"[5:v]{norm}[d]",
        f"[a][b]xfade=transition=fade:duration={XF}:offset={t_title - XF}[ab]",
        f"[ab][c]xfade=transition=fade:duration={XF}:offset={t_title + d1 - 2 * XF}[abc]",
        f"[abc][d]xfade=transition=fade:duration={XF}:offset={t_title + d1 + d2 - 3 * XF},fade=t=out:st={t_title + d1 + d2 + t_end - 3 * XF - 1.0}:d=1.0[v]",
    ]
    out = os.path.join(OUT, "walkthrough.mp4")
    cmd = [FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
           "-loop", "1", "-framerate", "30", "-t", str(t_title), "-i", os.path.join(OUT, "title.png"),
           "-i", DESK,
           "-loop", "1", "-framerate", "30", "-t", str(d2), "-i", os.path.join(OUT, "mbg.png"),
           "-i", MOB,
           "-loop", "1", "-framerate", "30", "-t", str(d2), "-i", os.path.join(OUT, "mframe.png"),
           "-loop", "1", "-framerate", "30", "-t", str(t_end), "-i", os.path.join(OUT, "end.png"),
           "-filter_complex", ";".join(g), "-map", "[v]", "-an",
           "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
           "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
           "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    print("done", out, round(duration(out), 1), "s")


os.makedirs(OUT, exist_ok=True)
asyncio.run(cards())
assemble()
