import sys
from playwright.sync_api import sync_playwright
path=sys.argv[1]; out=sys.argv[2]
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"])
    pg=b.new_page(viewport={"width":1400,"height":900})
    errs=[]
    pg.on("console", lambda m: errs.append(f"[{m.type}] {m.text}") if m.type in ("error",) else None)
    pg.on("pageerror", lambda e: errs.append(f"[pageerror] {e}"))
    pg.goto("file://"+path, wait_until="load"); pg.wait_for_timeout(2000)
    pg.locator("button", has_text="开始游戏").first.click(); pg.wait_for_timeout(2500)
    pg.locator("button", has_text="展开 CERVIX-3D").first.click(timeout=5000); pg.wait_for_timeout(1200)
    pg.locator('button.nav-tab[data-tab="studio"]').first.click(timeout=5000); pg.wait_for_timeout(1500)
    pg.locator('#btn-mh-bob').first.click(timeout=8000); pg.wait_for_timeout(9000)
    print('status:', pg.locator('#custom-model-status').text_content())
    pg.screenshot(path=out)
    print("\n".join(errs[:20]) or "NO ERRORS")
    b.close()
