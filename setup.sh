#!/usr/bin/env bash
# thekiwidev AI system — one-line bootstrap for macOS / Linux / WSL / Git Bash.
#   curl -fsSL https://raw.githubusercontent.com/thekiwidev/ai-system/main/setup.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/thekiwidev/ai-system/main/setup.sh | bash -s -- --owner jane --home .jane --yes
# Reads nothing from your shell except HOME; clones into ~/.<name> (default .thekiwidev, or --home), then runs bin/setup.js.
set -euo pipefail
REPO="${KIWI_REPO:-https://github.com/thekiwidev/ai-system.git}"
command -v git >/dev/null || { echo "setup: git is required"; exit 1; }
command -v node >/dev/null || { echo "setup: Node.js 18+ is required (https://nodejs.org)"; exit 1; }
HOME_NAME=".thekiwidev"
prev=""; for a in "$@"; do [ "$prev" = "--home" ] && HOME_NAME="${a#.}" && HOME_NAME=".$HOME_NAME"; prev="$a"; done
DEST="$HOME/$HOME_NAME"
if [ -e "$DEST" ]; then echo "setup: $DEST already exists — run: node $DEST/bin/setup.js $*"; exit 1; fi
git clone --depth 1 "$REPO" "$DEST"
exec node "$DEST/bin/setup.js" "$@"
