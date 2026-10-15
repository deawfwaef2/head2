@echo off
setlocal DisableDelayedExpansion
title CERVIX-3D Native Desktop Pet
pushd "%~dp0" >nul 2>&1
if errorlevel 1 goto bad_folder
set "ROOT=%CD%"
echo [CERVIX-3D] Starting the actual OS desktop pet overlay.
echo [INFO] No Node.js or npm installation is required.
echo.
if not exist "%ROOT%\electron\main.cjs" goto missing_files
if not exist "%ROOT%\*_CERVIX3D.html" goto missing_files
if "%LOCALAPPDATA%"=="" goto missing_cache
set "RUNTIME_ROOT=%LOCALAPPDATA%\CERVIX3D\Electron35"
set "RUNTIME=%RUNTIME_ROOT%\win32-x64"
set "EXE=%RUNTIME%\electron.exe"
if exist "%EXE%" goto run_app
where curl.exe >nul 2>&1
if errorlevel 1 goto missing_tools
where powershell.exe >nul 2>&1
if errorlevel 1 goto missing_tools
if not exist "%RUNTIME_ROOT%" mkdir "%RUNTIME_ROOT%"
if errorlevel 1 goto access_failed
set "ZIP=%RUNTIME_ROOT%\electron-v35.1.5-win32-x64.zip"
set "CERVIX_ELECTRON_ZIP=%ZIP%"
set "STAGE=%RUNTIME_ROOT%\win32-x64.staging"
set "CERVIX_ELECTRON_STAGE=%STAGE%"
if exist "%ZIP%" goto check_zip
echo [SETUP] Downloading the Electron 35 desktop runtime, about 120 MB.
echo [SETUP] First source: public mirror. A GitHub release is the fallback.
curl.exe -fL --retry 2 --connect-timeout 25 --max-time 1200 -o "%ZIP%.part" "https://npmmirror.com/mirrors/electron/35.1.5/electron-v35.1.5-win32-x64.zip"
if errorlevel 1 goto github_download
move /y "%ZIP%.part" "%ZIP%" >nul
if errorlevel 1 goto download_failed
goto check_zip
:github_download
echo [SETUP] Mirror unavailable, trying the official GitHub release...
if exist "%ZIP%.part" del /q "%ZIP%.part" >nul 2>&1
curl.exe -fL --retry 2 --connect-timeout 25 --max-time 1200 -o "%ZIP%.part" "https://github.com/electron/electron/releases/download/v35.1.5/electron-v35.1.5-win32-x64.zip"
if errorlevel 1 goto download_failed
move /y "%ZIP%.part" "%ZIP%" >nul
if errorlevel 1 goto download_failed
:check_zip
echo [VERIFY] Checking against the official Electron SHA-256...
powershell.exe -NoProfile -NonInteractive -Command "$h=(Get-FileHash -LiteralPath $env:CERVIX_ELECTRON_ZIP -Algorithm SHA256).Hash.ToLowerInvariant(); if ($h -ne 'd96947bb5111db344d5acedd9ce7bc2eb0c7d28992bf6307d0efeee2589c4ba2') { Write-Host ('Unexpected archive hash: ' + $h); exit 2 }"
if errorlevel 1 goto bad_checksum
if exist "%STAGE%" rmdir /s /q "%STAGE%"
if exist "%STAGE%" goto access_failed
mkdir "%STAGE%"
if errorlevel 1 goto access_failed
echo [SETUP] Extracting the verified desktop runtime...
powershell.exe -NoProfile -NonInteractive -Command "$ErrorActionPreference='Stop'; Expand-Archive -LiteralPath $env:CERVIX_ELECTRON_ZIP -DestinationPath $env:CERVIX_ELECTRON_STAGE -Force; if (-not (Test-Path -LiteralPath (Join-Path $env:CERVIX_ELECTRON_STAGE 'electron.exe'))) { exit 2 }"
if errorlevel 1 goto extract_failed
if exist "%RUNTIME%" rmdir /s /q "%RUNTIME%"
if exist "%RUNTIME%" goto access_failed
move "%STAGE%" "%RUNTIME%" >nul
if errorlevel 1 goto extract_failed
if not exist "%EXE%" goto extract_failed
:run_app
echo [RUN] Launching the transparent desktop overlay. Minimize this console if desired.
echo [KEYS] Ctrl+Alt+M switches pet/manager. Ctrl+Alt+X exits.
echo.
"%EXE%" "%ROOT%\electron\main.cjs" --overlay
if errorlevel 1 goto run_failed
popd
endlocal
exit /b 0
:bad_folder
echo [ERROR 1] Extract the full repository ZIP before starting this BAT.
goto fail
:missing_files
echo [ERROR 2] Missing project files. This BAT needs the electron folder and the game HTML.
goto fail
:missing_cache
echo [ERROR 3] LOCALAPPDATA is missing on this Windows account.
goto fail
:missing_tools
echo [ERROR 4] This requires Windows 10 or 11 with curl.exe and PowerShell.
goto fail
:access_failed
echo [ERROR 5] Cannot write to the local runtime folder. Close other running copies.
goto fail
:download_failed
echo [ERROR 6] Both download sources failed. Check network or retry on another connection.
goto fail
:bad_checksum
echo [ERROR 7] Archive integrity check failed. Removing the untrusted file.
if exist "%ZIP%" del /q "%ZIP%" >nul 2>&1
goto fail
:extract_failed
echo [ERROR 8] Could not extract Electron. Check disk space and antivirus settings.
goto fail
:run_failed
echo [ERROR 9] Electron failed at runtime. Send the error shown above.
goto fail
:fail
echo.
echo Press any key to close this window.
pause >nul
popd >nul 2>&1
endlocal
exit /b 1
