#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${DB_CONTAINER:-route-control-db}"
DB_USER="${DB_USERNAME:-postgres}"
DB_NAME="${DB_NAME:-route_control}"
KEEP="${BACKUP_KEEP:-14}"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dest="${BACKUP_DIR:-$root/backups}"
mkdir -p "$dest"

out="$dest/${DB_NAME}-$(date +%Y%m%d-%H%M%S).dump"

docker exec -i "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom > "$out.tmp"

# Un dump que no se puede leer no es un respaldo: se valida antes de aceptarlo.
docker exec -i "$CONTAINER" pg_restore --list < "$out.tmp" > /dev/null
mv "$out.tmp" "$out"

# Retención: conservar los $KEEP más recientes.
ls -t "$dest/$DB_NAME"-*.dump 2>/dev/null | tail -n "+$((KEEP + 1))" | while read -r old; do
  rm -- "$old"
done

echo "OK  $out  ($(du -h "$out" | cut -f1))"
