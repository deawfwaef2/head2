@echo off
chcp 65001 >nul
title CERVIX-3D 真实电脑屏幕透明穿透桌宠启动器
cd /d "%~dp0"

echo ============================================================================
echo   🟢 CERVIX-3D 真实电脑桌面透明穿透桌宠 (Real OS Desktop Pet Launcher)
echo ============================================================================
echo   [快捷键提示]
echo   - Ctrl + Alt + M : 随时在【纯屏幕透明穿透桌宠】与【完整建模工坊窗口】之间切换
echo   - Ctrl + Alt + X : 紧急退出桌面桌宠
echo   - 右上角悬浮胶囊 : 可一键切换【🌌纯人头透明穿透 / 🪵显示3D书架】、开关标牌或展开工坊
echo ============================================================================
echo.

if exist "node_modules\.bin\electron.cmd" (
    echo [1/1] 检测到本地 Electron 原生透明桌宠引擎，正在启动【真实透明穿透桌宠模式】...
    start "" "node_modules\.bin\electron.cmd" electron/main.cjs --overlay
    exit /b 0
)

where npx >nul 2>nul
if %errorlevel%==0 (
    echo [1/2] 检测到 Node.js 环境，正在通过 Electron 启动无边框透明穿透桌宠...
    echo       (首次运行若未安装 electron 会自动拉取缓存，请稍候)
    npx --yes electron@35.1.5 electron/main.cjs --overlay
    exit /b 0
)

where python >nul 2>nul
if %errorlevel%==0 (
    echo [备选方案] 未检测到 Node.js，正在尝试使用 Python WebView2 轻量透明桌宠启动器...
    python 启动轻量桌面桌宠_Python.py
    exit /b 0
)

echo [提示] 未检测到 Node.js 或 Python 环境，正在以系统 Edge/Chrome 独立无地址栏应用窗口启动...
echo 如需开启【100%% 透明背景 + 鼠标点击穿透到底层桌面】，请安装 Node.js 后再次双击本脚本！
start msedge --app="%~dp0点击开始游戏_CERVIX3D.html"
