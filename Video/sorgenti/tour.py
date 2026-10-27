"""Guided tour of the site, recorded in real time. Usage: python tour.py desktop|mobile"""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from rec import *

MODE = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "out", MODE)
MOBILE = MODE == "mobile"

# mobile: a soft touch dot instead of the arrow
TOUCH_CSS = """(() => { const s=document.createElement('style'); s.textContent=`#__cur svg{display:none}
#__cur{width:46px;height:46px;margin:-19px 0 0 -21px;border-radius:50%;background:rgba(255,255,255,.28);border:2px solid rgba(255,255,255,.75)}`;
const add = () => document.documentElement.appendChild(s);
document.documentElement ? add() : document.addEventListener('DOMContentLoaded', add); })();"""


class Tour:
    def __init__(self, page, vw, vh):
        self.page, self.vw, self.vh = page, vw, vh
        self.pos = (vw * 0.78, vh * 0.62)

    async def wait(self, s):
        await asyncio.sleep(s)

    async def move(self, to, dur=0.8):
        self.pos = await glide(self.page, self.pos, to, dur)

    async def move_to(self, selector, dur=0.8, dx=0, dy=0):
        x, y = await center_of(self.page, selector)
        await self.move((x + dx, y + dy), dur)

    async def click(self, selector=None, dur=0.8, after=0.0):
        if selector:
            await self.move_to(selector, dur)
            await self.wait(0.15)
        await self.page.mouse.down()
        await self.wait(0.08)
        await self.page.mouse.up()
        await self.wait(after)

    async def rest(self, dur=0.6):
        """Park the cursor out of the way of the content."""
        await self.move((self.vw * (0.5 if MOBILE else 0.9), self.vh * (0.92 if MOBILE else 0.7)), dur)

    async def scroll(self, y, speed=650, mn=1.0, mx=2.6):
        cur = await self.page.evaluate("scrollY")
        d = abs(y - cur)
        if d < 4:
            return cur
        return await scroll_to(self.page, y, max(mn, min(mx, d / speed)))

    async def go(self, selector, offset=None, pause=1.4, **kw):
        off = (90 if not MOBILE else 70) if offset is None else offset
        y = await top_of(self.page, selector, off)
        await self.scroll(y, **kw)
        await self.wait(pause)

    async def walk(self, pause=1.5, start_after=None):
        """Scroll through every remaining section, stopping on each one."""
        vh = self.vh
        secs = await self.page.evaluate(
            "() => [...document.querySelectorAll('main > section, footer')].map(e => [e.getBoundingClientRect().top + scrollY, e.offsetHeight])")
        maxy = await doc_height(self.page)
        stops = []
        for top, h in secs:
            y = top - (90 if not MOBILE else 70)
            stops.append(y)
            k = 1
            while y + k * 0.72 * vh < top + h - vh * 0.75:
                stops.append(y + k * 0.72 * vh)
                k += 1
        stops.append(maxy)
        cur = await self.page.evaluate("scrollY") if start_after is None else start_after
        last = cur
        for y in sorted(min(s, maxy) for s in stops):
            if y <= last + vh * 0.3:
                continue
            await self.scroll(y)
            await self.wait(pause)
            last = y

    async def nav(self, href):
        """Reveal the header by nudging up, then click a nav link."""
        await self.scroll(await self.page.evaluate("scrollY") - 160, mn=0.5)
        await self.wait(0.5)
        await self.click(f".nav-links a[href='{href}']", dur=1.0)
        await self.page.wait_for_url("**/" + href)
        await self.page.wait_for_load_state("load")
        await self.rest(0.4)
        await self.wait(2.0)

    async def menu_to(self, href, link_text=None):
        await self.click(".burger", dur=0.7, after=1.3)
        sel = f".mobile-menu a[href='{href}']" + (f":has-text('{link_text}')" if link_text else "")
        await self.click(sel, dur=0.7)
        await self.page.wait_for_url("**/" + href)
        await self.page.wait_for_load_state("load")
        await self.rest(0.4)
        await self.wait(1.8)


async def book(t, n_slots=2):
    p = t.page
    await t.page.wait_for_selector(".cal-day:not(:disabled):not(.empty)")
    await t.go(".service-pick", offset=110 if not MOBILE else 80, pause=0.6)
    await t.click(".service-pick label:nth-child(3)", after=0.7)
    if MOBILE:
        await t.go(".cal-head", offset=80, pause=0.4)
    # a day a few days ahead, so that all afternoon slots are free
    days = p.locator(".cal-day:not(:disabled):not(.empty)")
    await t.click_loc(days.nth(min(3, await days.count() - 1)), after=1.0)
    if MOBILE:
        await t.go(".slots", offset=150, pause=0.4)
    slots = p.locator(".slot:not(:disabled)")
    n = await slots.count()
    for i in range(n_slots):
        await t.click_loc(slots.nth(min(n - 1, n // 2 + i)), dur=0.5, after=0.4)
    await t.wait(0.6)
    await t.go(".summary", offset=t.vh * 0.45, pause=2.5)


async def click_loc(self, loc, dur=0.8, after=0.0):
    b = await loc.bounding_box()
    await self.move((b["x"] + b["width"] / 2, b["y"] + b["height"] / 2), dur)
    await self.wait(0.15)
    await self.click(after=after)
Tour.click_loc = click_loc


async def desktop(t):
    p = t.page
    await p.goto(BASE + "index.html")
    await t.wait(6.6)                                   # globe intro
    await t.wait(1.6)
    await t.move_to(".hero-actions .btn-primary", 1.2)  # magnetic button
    await t.move_to(".hero-actions .btn-primary", 0.5, dx=18, dy=6)
    await t.wait(0.8)
    await t.move_to(".hero-actions .btn:not(.btn-primary)", 0.7)
    await t.wait(0.8)
    await t.rest()
    await t.go(".stats", offset=t.vh * 0.35, pause=2.2)
    await t.walk()
    # back up to the service cards for a hover pass
    await t.go(".svc-grid", offset=t.vh * 0.12, pause=0.4, speed=2200)
    for i in (1, 2, 3):
        await t.move_to(f".svc-card:nth-child({i})", 0.7)
        await t.wait(0.9)
    await t.rest()
    await t.nav("servizi.html")
    await t.walk()
    await t.nav("progetti.html")
    await t.go(".video-stage", offset=60, pause=3.0)
    await t.walk()
    await t.nav("prezzi.html")
    await t.go(".price-tabs", offset=110, pause=1.4)
    await t.move_to(".price-card.featured", 0.9)
    await t.wait(1.2)
    for tab in ("foto", "sale", "musica"):
        await t.click(f".price-tab[data-tab='{tab}']", dur=0.8, after=2.0)
    await t.rest()
    await t.walk()
    await t.nav("about.html")
    await t.walk()
    await t.nav("lavora-con-noi.html")
    await t.go(".jobs", offset=120, pause=0.6)
    for i in (1, 2, 3):
        await t.move_to(f".job:nth-child({i}) h3", 0.6)
        await t.wait(0.6)
    await t.click(".job:nth-child(2) h3", dur=0.5, after=2.2)  # pre-fills the role and jumps to the form
    await t.rest()
    await t.walk()
    # booking via the header CTA
    await t.scroll(await p.evaluate("scrollY") - 160, mn=0.5)
    await t.wait(0.5)
    await t.click(".nav-cta", dur=1.0)
    await p.wait_for_url("**/prenota.html")
    await p.wait_for_load_state("load")
    await t.rest(0.4)
    await t.wait(2.2)
    await book(t)
    await t.rest()
    await t.walk()
    await t.wait(1.0)


async def mobile(t):
    p = t.page
    await p.goto(BASE + "index.html")
    await t.wait(6.6)
    await t.wait(1.5)
    for sel in (".stats", "section.section:nth-of-type(3)", "section.section:nth-of-type(4)",
                "section.section:nth-of-type(5)", ".svc-grid"):
        await t.go(sel, pause=1.1, speed=900)
    await t.scroll(0, mn=1.4, mx=1.6)
    await t.wait(0.6)
    await t.menu_to("prezzi.html")
    await t.go(".price-tabs", offset=90, pause=0.8)
    for tab in ("foto", "sale"):
        await t.click(f".price-tab[data-tab='{tab}']", dur=0.6, after=1.6)
    await t.scroll(0, mn=0.8)
    await t.menu_to("prenota.html", "Prenota")
    await book(t)
    await t.wait(1.0)


async def main():
    vw, vh, dpr, out_w, out_h = (390, 844, 2, 780, 1688) if MOBILE else (1600, 900, 1.2, 1920, 1080)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(channel="chrome", headless=True, args=["--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": vw, "height": vh}, device_scale_factor=dpr,
                                  is_mobile=MOBILE, has_touch=MOBILE, locale="it-IT")
        await ctx.add_init_script(CURSOR_JS)
        if MOBILE:
            await ctx.add_init_script(TOUCH_CSS)
        page = await ctx.new_page()
        t = Tour(page, vw, vh)
        r = Recorder(page, os.path.join(OUT, "frames"), out_w, out_h)
        await r.start()
        await (mobile(t) if MOBILE else desktop(t))
        await r.stop()
        n, span = r.encode(os.path.join(OUT, f"{MODE}.mp4"))
        print(MODE, "frames", n, "seconds", round(span, 1), "fps", round(n / span, 1))
        await b.close()

asyncio.run(main())
