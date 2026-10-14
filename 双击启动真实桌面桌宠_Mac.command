#!/usr/bin/env bash
cd "$(dirname "$0")"

echo "============================================================================"
echo "  🟢 CERVIX-3D 真实电脑屏幕透明穿透桌宠启动器 (macOS / Linux)"
echo "  - Cmd/Ctrl + Alt + M : 切换【纯透明穿透桌宠】与【完整建模工坊】"
echo "  - Cmd/Ctrl + Alt + X : 退出桌面桌宠"
echo "============================================================================"

if [ -x "./node_modules/.bin/electron" ]; then
  ./node_modules/.bin/electron electron/main.cjs --overlay
  exit 0
fi

if command -v npx >/dev/null 2>&1; then
  npx --yes electron@35.1.5 electron/main.cjs --overlay
  exit 0
fi

if command -v python3 >/dev/null 2>&1; then
  python3 启动轻量桌面桌宠_Python.py
  exit 0
fi

open "点击开始游戏_CERVIX3D.html"
