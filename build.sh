#!/usr/bin/env bash
# Regenerate minified CSS/JS bundles referenced by index.html.
# Edit the originals (css/*.css, js/*.js), then run ./build.sh before push.
set -euo pipefail

cd "$(dirname "$0")"

command -v terser >/dev/null || { echo "install terser: npm i -g terser"; exit 1; }
command -v cleancss >/dev/null || { echo "install cleancss: npm i -g clean-css-cli"; exit 1; }

for f in css/*.css; do
    [[ "$f" == *.min.css ]] && continue
    out="${f%.css}.min.css"
    cleancss -o "$out" "$f"
    printf 'CSS %-40s %6dB -> %6dB\n' "$f" "$(wc -c < "$f")" "$(wc -c < "$out")"
done

for f in js/*.js; do
    [[ "$f" == *.min.js ]] && continue
    out="${f%.js}.min.js"
    terser "$f" --compress --mangle -o "$out"
    printf 'JS  %-40s %6dB -> %6dB\n' "$f" "$(wc -c < "$f")" "$(wc -c < "$out")"
done

echo "done. commit both source and .min files."
