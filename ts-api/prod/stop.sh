#!/bin/bash
set -euo pipefail

pkill -f "node .*dist/main.js" >/dev/null 2>&1 || true
