#!/bin/sh
# Registra en fuentes.json todas las fuentes (.ttf .otf .woff) de esta carpeta.
cd "$(dirname "$0")" || exit 1
{
  printf '['
  first=1
  for f in *.ttf *.otf *.woff *.TTF *.OTF *.WOFF; do
    [ -f "$f" ] || continue
    [ "$first" -eq 1 ] || printf ','
    first=0
    printf '"%s"' "$f"
  done
  printf ']\n'
} > fuentes.json
echo "Fuentes registradas en fuentes.json:"
cat fuentes.json
