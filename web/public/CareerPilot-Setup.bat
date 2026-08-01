@echo off
REM ===================================================================
REM  CareerPilot one-click setup + launcher (Windows).
REM  Download this file, then double-click it. It will:
REM    1. Check that Git and Node.js (v18+) are installed
REM    2. Clone CareerPilot into %USERPROFILE%\CareerPilot (first run only)
REM    3. Install dependencies and build the web dashboard (first run only)
REM    4. Start the app and open http://localhost:3000/today in your browser
REM  Everything runs on YOUR machine. No account, no cloud, no data leaves.
REM ===================================================================
setlocal enableextensions enabledelayedexpansion
title CareerPilot Setup

set "REPO=https://github.com/Kunalchandra007/CareerPilot.git"
set "TARGET=%USERPROFILE%\CareerPilot"

echo.
echo   ============================================
echo    CareerPilot - local-first job search
echo   ============================================
echo.

REM --- Git present? -------------------------------------------------
where git >nul 2>nul
if errorlevel 1 (
  echo [CareerPilot] Git is not installed or not on your PATH.
  echo Install it from https://git-scm.com/download/win then run this again.
  echo.
  pause
  exit /b 1
)

REM --- Node present? ------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [CareerPilot] Node.js is not installed or not on your PATH.
  echo Install the LTS version from https://nodejs.org/ then run this again.
  echo.
  pause
  exit /b 1
)

REM --- Node version 18 or newer? -----------------------------------
set "NODEMAJOR="
for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set "NODEMAJOR=%%v"
if defined NODEMAJOR (
  if !NODEMAJOR! LSS 18 (
    echo [CareerPilot] Node 18 or newer is required ^(you have v!NODEMAJOR!^).
    echo Update from https://nodejs.org/ then run this again.
    echo.
    pause
    exit /b 1
  )
)

REM --- Clone on first run, otherwise pull latest -------------------
if not exist "%TARGET%\.git" (
  echo [CareerPilot] Downloading CareerPilot into "%TARGET%" ...
  git clone --depth 1 "%REPO%" "%TARGET%"
  if errorlevel 1 (
    echo [CareerPilot] Clone failed. Check your internet connection and try again.
    echo.
    pause
    exit /b 1
  )
) else (
  echo [CareerPilot] Updating your existing copy ...
  pushd "%TARGET%"
  git pull --ff-only
  popd
)

REM --- Hand off to the in-repo launcher (installs, builds, opens) --
if not exist "%TARGET%\CareerPilot.bat" (
  echo [CareerPilot] Launcher not found in the download. Something went wrong.
  echo.
  pause
  exit /b 1
)

echo [CareerPilot] Starting the app ...
call "%TARGET%\CareerPilot.bat"
