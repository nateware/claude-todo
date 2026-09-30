#!/bin/bash
# One-time setup for a new Mac: installs Homebrew and Node.js, then this app's packages.
# Safe to run again; it skips anything already installed.
# Usage (from the project folder):  bash setup.sh
set -e

cd "$(dirname "$0")"

echo "==> Setting up your Mac for this project. This can take 10-15 minutes."

# 1. Homebrew (a tool that installs other tools)
if ! command -v brew >/dev/null 2>&1; then
  echo
  echo "==> Installing Homebrew."
  echo "    When asked for a password, type your Mac login password and press Return."
  echo "    (Nothing appears on screen while you type. That is normal.)"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Make brew available now, and in every new Terminal window
if [ -x /opt/homebrew/bin/brew ]; then
  BREW=/opt/homebrew/bin/brew   # Apple Silicon Macs
else
  BREW=/usr/local/bin/brew      # Intel Macs
fi
eval "$("$BREW" shellenv)"
if ! grep -qs 'brew shellenv' ~/.zprofile; then
  echo "eval \"\$($BREW shellenv)\"" >> ~/.zprofile
fi

# 2. Node.js (includes npm). Also replaces a missing or too-old Node (this app needs 22, 24, or 26+).
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
if [ "$NODE_MAJOR" -lt 22 ] || [ "$NODE_MAJOR" -eq 23 ] || [ "$NODE_MAJOR" -eq 25 ]; then
  echo
  echo "==> Installing Node.js."
  if brew list node >/dev/null 2>&1; then brew upgrade node; else brew install node; fi
  hash -r
fi
echo "==> Using Node.js $(node --version)"

# 3. This app's packages (backend and frontend). SQLite is included; nothing else to install.
echo
echo "==> Installing app packages."
npm install

echo
echo "==> Setup complete. To start the app, run:"
echo
echo "    npm run dev"
echo
echo "    Then open http://localhost:5173 in your browser."
echo "    If you open a new Terminal window first, run this in it:  cd \"$(pwd)\""
