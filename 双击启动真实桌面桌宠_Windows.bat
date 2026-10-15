@echo off
setlocal DisableDelayedExpansion
title CERVIX-3D Desktop Pet
pushd "%~dp0" >nul 2>&1
if errorlevel 1 goto bad_folder
set "ROOT=%CD%"
echo [CERVIX-3D] Native desktop pet launcher.
echo [INFO] First run needs Node.js and internet to install Electron.
echo.
if not exist "%ROOT%\electron\main.cjs" goto missing_files
if not exist "%ROOT%\*_CERVIX3D.html" goto missing_files
where node.exe >nul 2>&1
if errorlevel 1 goto no_node
if exist "%ROOT%\node_modules\.bin\electron.cmd" if exist "%ROOT%\node_modules\electron\dist\electron.exe" goto run_app
where npm.cmd >nul 2>&1
if errorlevel 1 goto no_node
echo [SETUP] Installing Electron desktop runtime. Please wait...
call npm.cmd install --no-save --no-audit --no-fund --package-lock=false electron@35.1.5
if errorlevel 1 goto install_failed
if not exist "%ROOT%\node_modules\.bin\electron.cmd" goto install_failed
if not exist "%ROOT%\node_modules\electron\dist\electron.exe" goto install_failed
:run_app
echo [RUN] Starting transparent desktop pet. Keep or minimize this console.
echo [KEYS] Ctrl+Alt+M switches pet/manager. Ctrl+Alt+X exits.
echo.
call "%ROOT%\node_modules\.bin\electron.cmd" "%ROOT%\electron\main.cjs" --overlay
if errorlevel 1 goto run_failed
popd
endlocal
exit /b 0
:bad_folder
echo [ERROR 1] Cannot open the extracted project folder.
goto fail
:missing_files
echo [ERROR 2] Project files missing. Extract the FULL repository ZIP.
echo [ERROR 2] Keep this BAT, the electron folder and the HTML together.
goto fail
:no_node
echo [ERROR 3] Node.js or npm not found. Install Node.js LTS and retry.
echo [HELP] https://nodejs.org/en/download
goto fail
:install_failed
echo [ERROR 4] Electron installation failed. Check internet, disk space and permissions.
echo [HELP] Copy the last 10 lines above to report this problem.
goto fail
:run_failed
echo [ERROR 5] Electron stopped unexpectedly. Copy the last 10 lines above.
goto fail
:fail
echo.
echo Press any key to close this window.
pause >nul
popd >nul 2>&1
endlocal
exit /b 1
