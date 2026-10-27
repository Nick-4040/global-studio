"""Real-time capture of a Playwright page through CDP screencast + helpers for a guided tour."""
import asyncio, base64, math, os, subprocess

FFMPEG = r"C:\Users\NICOLAS\AppData\Roaming\Python\Python312\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
BASE = "http://127.0.0.1:8765/"

# visible cursor + click ripple (headless screencast has no OS cursor)
CURSOR_JS = r"""
(() => {
  const mk = () => {
    if (document.getElementById('__cur')) return;
    const c = document.createElement('div');
    c.id = '__cur';
    c.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6-3.6 6.4z" fill="#fff" stroke="#120826" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, {position:'fixed', left:0, top:0, zIndex:2147483647, pointerEvents:'none',
      transform:'translate(-200px,-200px)', filter:'drop-shadow(0 2px 6px rgba(0,0,0,.6))', transition:'opacity .3s'});
    document.documentElement.appendChild(c);
    addEventListener('mousemove', e => c.style.transform = `translate(${e.clientX-4}px,${e.clientY-2}px)`, true);
    addEventListener('mousedown', e => {
      const r = document.createElement('div');
      Object.assign(r.style, {position:'fixed', left:e.clientX-22+'px', top:e.clientY-22+'px', width:'44px', height:'44px',
        borderRadius:'50%', border:'2px solid #f2c25b', zIndex:2147483646, pointerEvents:'none',
        transition:'transform .5s ease-out, opacity .5s ease-out', transform:'scale(.3)', opacity:1});
      document.documentElement.appendChild(r);
      requestAnimationFrame(() => requestAnimationFrame(() => { r.style.transform = 'scale(1.4)'; r.style.opacity = 0; }));
      setTimeout(() => r.remove(), 600);
    }, true);
  };
  if (document.documentElement) mk(); else addEventListener('DOMContentLoaded', mk);
  document.addEventListener('DOMContentLoaded', mk);
})();
"""

HIDE_CURSOR_JS = "(() => { const s=document.createElement('style'); s.textContent='#__cur{display:none!important}'; document.documentElement.appendChild(s); })();"


class Recorder:
    def __init__(self, page, outdir, w, h, quality=92):
        self.page, self.outdir, self.w, self.h, self.q = page, outdir, w, h, quality
        os.makedirs(outdir, exist_ok=True)
        self.frames = []  # (timestamp, path)
        self.cdp = None

    async def start(self):
        self.cdp = await self.page.context.new_cdp_session(self.page)
        self.cdp.on("Page.screencastFrame", self._on_frame)
        await self.cdp.send("Page.startScreencast", {
            "format": "jpeg", "quality": self.q, "maxWidth": self.w, "maxHeight": self.h, "everyNthFrame": 1})

    def _on_frame(self, p):
        path = os.path.join(self.outdir, f"{len(self.frames):06d}.jpg")
        with open(path, "wb") as f:
            f.write(base64.b64decode(p["data"]))
        self.frames.append((p["metadata"]["timestamp"], path))
        asyncio.ensure_future(self.cdp.send("Page.screencastFrameAck", {"sessionId": p["sessionId"]}))

    async def stop(self):
        await self.cdp.send("Page.stopScreencast")

    def encode(self, out, fps=30, crf=18, tail=0.5, vf=None):
        """Turn the timestamped frames into a constant-frame-rate mp4."""
        fr = self.frames
        lst = os.path.join(self.outdir, "list.txt")
        with open(lst, "w") as f:
            for i, (ts, path) in enumerate(fr):
                d = (fr[i + 1][0] - ts) if i + 1 < len(fr) else tail
                f.write(f"file '{os.path.basename(path)}'\nduration {max(d, 0.001):.4f}\n")
            f.write(f"file '{os.path.basename(fr[-1][1])}'\n")
        filt = f"fps={fps},scale={self.w}:{self.h}:flags=lanczos,format=yuv420p" + (f",{vf}" if vf else "")
        subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                        "-vf", filt, "-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-movflags", "+faststart", out],
                       check=True)
        span = fr[-1][0] - fr[0][0]
        return len(fr), span


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * t)


async def glide(page, pos, to, dur=0.8):
    """Smoothly move the mouse from pos to `to` (real time)."""
    x0, y0 = pos
    x1, y1 = to
    n = max(2, int(dur * 60))
    for i in range(1, n + 1):
        e = ease(i / n)
        await page.mouse.move(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e)
        await asyncio.sleep(dur / n)
    return (x1, y1)


SCROLL_JS = """
async ([y, dur]) => {
  const y0 = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  y = Math.max(0, Math.min(max, y));
  const t0 = performance.now();
  await new Promise(res => {
    const step = now => {
      const p = Math.min(1, (now - t0) / (dur * 1000));
      const e = p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3) / 2;
      window.scrollTo({top: y0 + (y - y0) * e, behavior: 'instant'});
      p < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  });
  return scrollY;
}
"""


async def scroll_to(page, y, dur):
    return await page.evaluate(SCROLL_JS, [y, dur])


async def doc_height(page):
    return await page.evaluate("document.documentElement.scrollHeight - innerHeight")


async def top_of(page, selector, offset=0):
    return await page.evaluate(
        "([s, o]) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY - o : null; }",
        [selector, offset])


async def center_of(page, selector):
    b = await page.locator(selector).first.bounding_box()
    return (b["x"] + b["width"] / 2, b["y"] + b["height"] / 2)
