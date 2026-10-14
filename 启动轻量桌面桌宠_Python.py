#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CERVIX-3D 轻量级原生透明桌面桌宠启动器 (Python pywebview / WebView2 / WebKit)
===========================================================================
无需安装庞大的 Node.js / Electron，直接调用系统自带的 Edge WebView2 (Windows)
或 WebKit (macOS) 创建无边框、全透明、置顶悬浮的 3D 桌面桌宠窗口！

使用方法：
  1. pip install pywebview
  2. python 启动轻量桌面桌宠_Python.py
"""

import os
import sys
import pathlib

try:
    import webview
except ImportError:
    print("正在自动安装轻量透明窗口依赖 pywebview ...")
    os.system(f'"{sys.executable}" -m pip install pywebview')
    import webview


INJECT_TRANSPARENT_DESKTOP_PET_JS = r"""
(function() {
  try {
    document.body.classList.remove('bg-mode-os', 'bg-mode-void');
    document.body.classList.add('bg-mode-transparent');
    var osIcons = document.getElementById('os-desktop-icons');
    if (osIcons) osIcons.style.display = 'none';
    var startOverlay = document.getElementById('start-game-overlay');
    if (startOverlay) startOverlay.classList.add('hidden');
    var sw = document.getElementById('software-window');
    if (sw) sw.classList.add('window-hidden');
    var floorSelect = document.getElementById('sel-floor-style');
    if (floorSelect) {
      floorSelect.value = 'none';
      floorSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    var gridSelect = document.getElementById('sel-box-grid-mode');
    if (gridSelect) {
      gridSelect.value = 'hidden';
      gridSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } catch (e) {
    console.warn('Transparent init warning:', e);
  }
})();
"""


def main():
    root_dir = pathlib.Path(__file__).resolve().parent
    html_file = root_dir / "点击开始游戏_CERVIX3D.html"
    if not html_file.exists():
        print(f"未找到 {html_file}，请确保脚本与 点击开始游戏_CERVIX3D.html 位于同一目录。")
        sys.exit(1)

    window = webview.create_window(
        title="CERVIX-3D 真实桌面桌宠",
        url=html_file.as_uri(),
        frameless=True,
        easy_drag=False,
        transparent=True,
        on_top=True,
        maximized=True,
    )

    def on_loaded():
        window.evaluate_js(INJECT_TRANSPARENT_DESKTOP_PET_JS)

    window.events.loaded += on_loaded
    webview.start(debug=False)


if __name__ == "__main__":
    main()
