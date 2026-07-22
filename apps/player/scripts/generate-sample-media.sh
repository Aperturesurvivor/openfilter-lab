#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT_DIR/public/media/openfilter-test-reel.mp4"

mkdir -p "$(dirname "$OUT")"

ffmpeg -y \
  -f lavfi -i "testsrc2=size=1280x720:rate=30:duration=30" \
  -f lavfi -i "sine=frequency=440:duration=30" \
  -shortest \
  -c:v libx264 -pix_fmt yuv420p -preset veryfast \
  -c:a aac -b:a 128k \
  "$OUT"

echo "Generated $OUT"
