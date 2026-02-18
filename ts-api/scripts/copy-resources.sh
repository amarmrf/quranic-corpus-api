#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${PROJECT_DIR}/../src/main/resources"
TARGET_DIR="${PROJECT_DIR}/resources"

if [ ! -d "${SOURCE_DIR}" ]; then
  if [ -d "${TARGET_DIR}" ]; then
    echo "Resource source directory not found: ${SOURCE_DIR}. Using existing ${TARGET_DIR}."
    exit 0
  fi

  echo "Resource source directory not found: ${SOURCE_DIR}" >&2
  exit 1
fi

rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"
cp -R "${SOURCE_DIR}/." "${TARGET_DIR}/"
