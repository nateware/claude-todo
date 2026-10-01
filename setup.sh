#!/bin/bash
# One-time setup: installs Node.js if needed, then this app's packages. Never needs sudo.
#   - Node.js already installed and new enough: uses it.
#   - Homebrew installed: installs Node.js with Homebrew.
#   - Otherwise: downloads Node.js from nodejs.org into ~/.local/node (no admin rights needed).
# Safe to run again.
# Usage (from the project folder):  ./setup.sh
#   ./setup.sh --start   also starts the app and opens it in the browser
set -e

cd "$(dirname "$0")"

NODE_LTS=24                    # Node.js major version to download when there is no Homebrew
NODE_HOME="$HOME/.local/node"
# shellcheck disable=SC2016  # $HOME and $PATH should expand in each new Terminal, not now
NODE_PATH_LINE='export PATH="$HOME/.local/node/bin:$PATH"'
# shellcheck disable=SC2016
LOCAL_BIN_LINE='export PATH="$HOME/.local/bin:$PATH"'   # where per-user tools such as Claude Code install

# Add a line to ~/.zshrc once, so new Terminal tabs and windows can find installed tools
add_to_zshrc() {
  grep -qsF "$1" "$HOME/.zshrc" || echo "$1" >> "$HOME/.zshrc"
}

# This app needs Node.js 22.22.2+, 24.15+, or 26+
node_ok() {
  node -e '
    const [a, b, c] = process.versions.node.split(".").map(Number);
    const ok = (a === 22 && (b > 22 || (b === 22 && c >= 2))) || (a === 24 && b >= 15) || a >= 26;
    process.exit(ok ? 0 : 1);
  ' 2>/dev/null
}

install_node_download() {
  local arch base sums file tmp
  case "$(uname -m)" in arm64) arch=arm64 ;; *) arch=x64 ;; esac
  base="https://nodejs.org/dist/latest-v$NODE_LTS.x"
  sums=$(curl -fsSL "$base/SHASUMS256.txt")
  file=$(echo "$sums" | grep -o "node-v[0-9.]*-darwin-$arch\.tar\.gz" | head -1)

  echo "==> Downloading $file"
  tmp=$(mktemp -d "${TMPDIR:-/tmp}/node-setup.XXXXXX")
  curl -fL --progress-bar "$base/$file" -o "$tmp/$file"
  (cd "$tmp" && echo "$sums" | grep " $file\$" | shasum -a 256 -c -s -)

  rm -rf "$NODE_HOME"
  mkdir -p "$NODE_HOME"
  tar -xzf "$tmp/$file" -C "$NODE_HOME" --strip-components 1
  rm -rf "$tmp"
}

echo "==> Setting up this project. This can take a few minutes."

# Homebrew (optional): use it if it is installed
BREW=$(command -v brew || true)
for b in /opt/homebrew/bin/brew /usr/local/bin/brew; do
  [ -z "$BREW" ] && [ -x "$b" ] && BREW=$b
done
if [ -n "$BREW" ]; then
  eval "$("$BREW" shellenv)"
  add_to_zshrc "eval \"\$($BREW shellenv)\""
fi

# Per-user tools folder (~/.local/bin)
export PATH="$HOME/.local/bin:$PATH"
add_to_zshrc "$LOCAL_BIN_LINE"

# Node.js downloaded by an earlier run of this script
if [ -x "$NODE_HOME/bin/node" ]; then
  export PATH="$NODE_HOME/bin:$PATH"
  add_to_zshrc "$NODE_PATH_LINE"
fi

# Node.js (includes npm)
if ! node_ok; then
  echo
  if [ -n "$BREW" ]; then
    echo "==> Installing Node.js with Homebrew."
    if "$BREW" list node >/dev/null 2>&1; then "$BREW" upgrade node; else "$BREW" install node; fi
  else
    echo "==> Installing Node.js $NODE_LTS into $NODE_HOME"
    install_node_download
    export PATH="$NODE_HOME/bin:$PATH"
    add_to_zshrc "$NODE_PATH_LINE"
  fi
  hash -r
fi
if ! node_ok; then
  echo "Error: could not set up a supported Node.js (found: $(node --version 2>/dev/null || echo none))."
  exit 1
fi
echo "==> Using Node.js $(node --version) from $(command -v node)"

# This app's packages (backend and frontend). SQLite is included; nothing else to install.
echo
echo "==> Installing app packages."
npm install --no-fund --loglevel=error   # show only real errors; warnings here alarm beginners

APP_URL="http://localhost:5173"

if [ "$1" = "--start" ]; then
  echo
  echo "==> Setup complete. Starting the app; your browser will open when it is ready."
  echo "    To stop the app, press Control+C in this window."
  echo "    To start it again later, open a new Terminal tab (Cmd+T) and run:"
  echo
  echo "cd \"$(pwd)\""
  echo "npm run dev"
  echo
  # Open the browser once the app answers (gives up after 60 seconds)
  (
    for _ in $(seq 60); do
      if curl -s -o /dev/null "$APP_URL"; then open "$APP_URL"; exit; fi
      sleep 1
    done
  ) &
  # Run the app in this window. Use the keyboard as input, since this script may arrive through curl.
  if (exec < /dev/tty) 2>/dev/null; then exec npm run dev < /dev/tty; else exec npm run dev; fi
fi

echo
echo "==> Setup complete. To start the app, open a new Terminal tab (Cmd+T) and run:"
echo
echo "cd \"$(pwd)\""
echo "npm run dev"
echo
echo "Then open $APP_URL in your browser."
