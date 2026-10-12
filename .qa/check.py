import sys, asyncio
from playwright.sync_api import sync_playwright
path = sys.argv[1]; out = sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg = b.new_page(viewport={"width":1280,"height":800})
    errs=[]
    pg.on("console", lambda m: errs.append(f"[{m.type}] {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"[pageerror] {e}"))
    pg.goto("file://"+path, wait_until="load")
    pg.wait_for_timeout(3000)
    # try clicking start button
    btns = pg.locator("button", has_text="开始游戏")
    print("start buttons:", btns.count())
    if btns.count():
        btns.first.click()
        pg.wait_for_timeout(4000)
    pg.screenshot(path=out)
    print("\n".join(errs[:30]) or "NO ERRORS")
    b.close()
