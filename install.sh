#!/bin/bash
# Downloads this project from GitHub and runs its setup. No git or admin rights needed.
# Usage (paste into Terminal):
#   curl -fsSL https://raw.githubusercontent.com/nateware/claude-todo/main/install.sh | bash
set -eo pipefail

DOWNLOAD_URL="https://github.com/nateware/claude-todo/archive/refs/heads/main.tar.gz"
dir="$HOME/claude-todo"

if [ -e "$dir" ]; then
  if [ ! -x "$dir/setup.sh" ]; then
    echo "Error: $dir already exists and is not this project. Rename or move that folder, then run this again."
    exit 1
  fi
  echo "==> $dir already exists. Using it as is (nothing is overwritten)."
else
  echo "==> Downloading the project into $dir"
  tmp=$(mktemp -d "${TMPDIR:-/tmp}/claude-todo.XXXXXX")
  trap 'rm -rf "$tmp"' EXIT   # remove a partial download if anything fails
  chmod 755 "$tmp"
  curl -fsSL "$DOWNLOAD_URL" | tar -xz -C "$tmp" --strip-components 1
  mkdir -p "$(dirname "$dir")"
  mv "$tmp" "$dir"
  trap - EXIT
fi

cd "$dir"
./setup.sh
