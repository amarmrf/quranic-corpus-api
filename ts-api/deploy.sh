#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

SSH_KEY="${SSH_KEY:-../../dev/keys/fasthosts}"
REMOTE_HOST="${REMOTE_HOST:-admin-user@hunna.app}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/qurancorpus.app/services}"

npm ci
npm run test
npm run build
npm run prepare-release

scp -i "${SSH_KEY}" -r release/* "${REMOTE_HOST}:${REMOTE_PATH}"
