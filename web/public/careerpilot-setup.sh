#!/usr/bin/env bash
# ===================================================================
#  CareerPilot one-click setup + launcher (macOS / Linux).
#  Download this file, then run:  bash careerpilot-setup.sh
#  It will:
#    1. Check that git and Node.js (v18+) are installed
#    2. Clone CareerPilot into ~/CareerPilot (first run only)
#    3. Install dependencies and build the web dashboard (first run only)
#    4. Start the app and open http://localhost:3000/today in your browser
#  Everything runs on YOUR machine. No account, no cloud, no data leaves.
# ===================================================================
set -euo pipefail

REPO="https://github.com/Kunalchandra007/CareerPilot.git"
TARGET="$HOME/CareerPilot"

echo
echo "  ============================================"
echo "   CareerPilot - local-first job search"
echo "  ============================================"
echo

# --- git present? -------------------------------------------------
if ! command -v git >/dev/null 2>&1; then
  echo "[CareerPilot] git is not installed."
  echo "  macOS:  xcode-select --install"
  echo "  Linux:  sudo apt install git   (or your distro's package manager)"
  exit 1
fi

# --- node present? ------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "[CareerPilot] Node.js is not installed."
  echo "  Install the LTS version from https://nodejs.org/ then run this again."
  exit 1
fi

# --- node version 18+? -------------------------------------------
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "[CareerPilot] Node 18 or newer is required (you have v$NODE_MAJOR)."
  echo "  Update from https://nodejs.org/ then run this again."
  exit 1
fi

# --- clone on first run, otherwise pull latest -------------------
if [ ! -d "$TARGET/.git" ]; then
  echo "[CareerPilot] Downloading CareerPilot into \"$TARGET\" ..."
  git clone --depth 1 "$REPO" "$TARGET"
else
  echo "[CareerPilot] Updating your existing copy ..."
  git -C "$TARGET" pull --ff-only || true
fi

cd "$TARGET/web"

# --- first run: install dependencies ----------------------------
if [ ! -d "node_modules" ]; then
  echo "[CareerPilot] First run - installing dependencies. This happens once..."
  npm ci || npm install
fi

# --- build if needed --------------------------------------------
if [ ! -f ".next/BUILD_ID" ]; then
  echo "[CareerPilot] Building the app. This can take a minute..."
  npm run build
fi

# --- start the server, open the browser -------------------------
echo "[CareerPilot] Starting CareerPilot at http://localhost:3000 ..."
npm run start >/tmp/careerpilot.log 2>&1 &
SERVER_PID=$!

# give it a moment, then open /today (the app; / is the marketing page)
sleep 4
URL="http://localhost:3000/today"
if command -v open >/dev/null 2>&1; then open "$URL"        # macOS
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"  # Linux
else echo "[CareerPilot] Open $URL in your browser."; fi

echo
echo "[CareerPilot] CareerPilot is running (server PID $SERVER_PID)."
echo "[CareerPilot] Press Ctrl+C to stop, or run: kill $SERVER_PID"
wait $SERVER_PID
