#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

if [ ! -d node_modules ]; then
  npm ci --omit=dev --no-audit --no-fund
fi

pkill -f "node .*dist/main.js" >/dev/null 2>&1 || true

NODE_ENV=production nohup node dist/main.js >/dev/null 2>&1 &
