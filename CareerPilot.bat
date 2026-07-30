@echo off
REM ===================================================================
REM  CareerPilot launcher — double-click to open the local dashboard.
REM  First run: installs deps + builds. Later runs: just starts + opens.
REM  No terminal knowledge needed. Runs entirely on your machine.
REM ===================================================================
setlocal enableextensions enabledelayedexpansion
title CareerPilot

cd /d "%~dp0web" || (
  echo [CareerPilot] Could not find the "web" folder next to this launcher.
  echo Make sure CareerPilot.bat stays in the CareerPilot project root.
  pause
  exit /b 1
)

REM --- Node present? -------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [CareerPilot] Node.js is not installed or not on your PATH.
  echo Install the LTS version from https://nodejs.org/ and run this again.
  pause
  exit /b 1
)

REM --- Node version >= 18? ------------------------------------------
for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set NODEMAJOR=%%v
if %NODEMAJOR% LSS 18 (
  echo [CareerPilot] Node 18 or newer is required (you have v%NODEMAJOR%).
  echo Update from https://nodejs.org/ and run this again.
  pause
  exit /b 1
)

REM --- First run: install dependencies ------------------------------
if not exist "node_modules" (
  echo [CareerPilot] First run — installing dependencies. This happens once...
  call npm ci
  if errorlevel 1 (
    echo [CareerPilot] npm ci failed, trying npm install...
    call npm install
    if errorlevel 1 (
      echo [CareerPilot] Dependency install failed. See the messages above.
      pause
      exit /b 1
    )
  )
)

REM --- First run OR source changed since last build: rebuild -------
REM Rebuild when .next is missing, or when any source file under src/,
REM package.json, or next.config.* is newer than .next\BUILD_ID. This is
REM what makes code changes (e.g. after an update) reach the running server.
set "NEEDBUILD="
if not exist ".next\BUILD_ID" set "NEEDBUILD=1"
if not defined NEEDBUILD (
  for /f "delims=" %%S in ('powershell -NoProfile -Command ^
    "$b=(Get-Item '.next\BUILD_ID').LastWriteTimeUtc;" ^
    "$n=Get-ChildItem -Recurse -File src,package.json,next.config.* -ErrorAction SilentlyContinue ^| Where-Object { $_.LastWriteTimeUtc -gt $b } ^| Select-Object -First 1;" ^
    "if ($n) { 'stale' } else { 'fresh' }"') do set "BUILDSTATE=%%S"
  if /I "!BUILDSTATE!"=="stale" set "NEEDBUILD=1"
)
if defined NEEDBUILD (
  echo [CareerPilot] Building the app ^(first run or source changed^). This can take a minute...
  call npm run build
  if errorlevel 1 (
    echo [CareerPilot] Build failed. See the messages above.
    pause
    exit /b 1
  )
)

REM --- Start the server in the background, then open the browser ---
echo [CareerPilot] Starting CareerPilot at http://localhost:3000 ...
start "" /b cmd /c "npm run start"

REM Give the server a moment, then open the dashboard.
timeout /t 4 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo [CareerPilot] CareerPilot is running. Close this window to stop the server.
echo (If you launched via the desktop icon, there is no window — use Task Manager
echo  to stop "node" when you're done, or just leave it running.)

REM Keep the process alive so the server stays up while launched from the .bat.
:loop
timeout /t 3600 /nobreak >nul
goto loop
