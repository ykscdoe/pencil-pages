#!/usr/bin/env bash
set -euo pipefail

MAX_WIDTH=600
QUALITY=90

cd "$(dirname "$0")"

if ! command -v cwebp &>/dev/null && ! command -v magick &>/dev/null && ! command -v convert &>/dev/null; then
  echo "error: install cwebp (brew install webp) or ImageMagick" >&2
  exit 1
fi

image_width() {
  sips -g pixelWidth "$1" 2>/dev/null | awk '/pixelWidth:/{print $2}'
}

to_webp() {
  local src="$1" dest="$2"

  if command -v cwebp &>/dev/null; then
    local width
    width=$(image_width "$src")
    if [ "$width" -gt "$MAX_WIDTH" ]; then
      cwebp -q "$QUALITY" -resize "$MAX_WIDTH" 0 "$src" -o "$dest" &>/dev/null
    else
      cwebp -q "$QUALITY" "$src" -o "$dest" &>/dev/null
    fi
  elif command -v magick &>/dev/null; then
    magick "$src" -resize "${MAX_WIDTH}x>" -quality "$QUALITY" "$dest"
  else
    convert "$src" -resize "${MAX_WIDTH}x>" -quality "$QUALITY" "$dest"
  fi
}

for src in *.png; do
  [ -f "$src" ] || continue
  dest="${src%.png}.webp"
  to_webp "$src" "$dest"
  rm "$src"
  echo "$dest"
done
