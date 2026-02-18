#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
RELEASE_DIR="${PROJECT_DIR}/release"

rm -rf "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}"

cp -R "${PROJECT_DIR}/dist" "${RELEASE_DIR}/dist"
cp -R "${PROJECT_DIR}/resources" "${RELEASE_DIR}/resources"
cp "${PROJECT_DIR}/package.json" "${RELEASE_DIR}/package.json"
cp "${PROJECT_DIR}/package-lock.json" "${RELEASE_DIR}/package-lock.json"
cp "${PROJECT_DIR}/prod/"* "${RELEASE_DIR}/"
