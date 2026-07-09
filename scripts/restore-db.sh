#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Uso: ./scripts/restore-db.sh <archivo.dump> [--test] [--yes] [--force-real]

  <archivo.dump>  Respaldo generado por scripts/backup-db.sh
  --test          Restaurar sobre la base de TEST en vez de la real
  --yes           No pedir confirmación. Sobre la base real exige además --force-real.
  --force-real    Autoriza el modo no interactivo sobre la base real.

El restore BORRA la base destino antes de escribir. Antes de hacerlo:
  1. valida que el dump se pueda leer,
  2. lo restaura en una base desechable para probar que aplica limpio,
  3. guarda un respaldo del estado actual por si hay que volver atrás.
EOF
}

dump="" ; use_test=0 ; assume_yes=0 ; force_real=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --test) use_test=1 ;;
    --yes|-y) assume_yes=1 ;;
    --force-real) force_real=1 ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "Opción desconocida: $1" >&2; usage >&2; exit 2 ;;
    *) [[ -n "$dump" ]] && { echo "Sólo se admite un dump" >&2; exit 2; }; dump="$1" ;;
  esac
  shift
done

[[ -n "$dump" ]] || { usage >&2; exit 2; }
[[ -f "$dump" ]] || { echo "No existe el archivo: $dump" >&2; exit 1; }

if (( use_test )); then
  container="${DB_TEST_CONTAINER:-route-control-test-db}"
  db="${DB_TEST_NAME:-route_control_test}"
else
  container="${DB_CONTAINER:-route-control-db}"
  db="${DB_NAME:-route_control}"
fi
user="${DB_USERNAME:-postgres}"
scratch_db="restore_check_$$"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dest="${BACKUP_DIR:-$root/backups}"

# --yes por sí solo no autoriza destruir la base real: hace falta decirlo dos veces.
if (( assume_yes && ! use_test && ! force_real )); then
  echo "Negado: --yes no basta para borrar la base real '$db'." >&2
  echo "        Añade --force-real si de verdad es lo que quieres." >&2
  exit 2
fi

psql_() { docker exec -i "$container" psql -U "$user" -v ON_ERROR_STOP=1 "$@"; }

docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null | grep -qx true \
  || { echo "El contenedor '$container' no está corriendo. Corre: docker compose up -d" >&2; exit 1; }

# 1. El dump tiene que ser legible antes de que nos acerquemos a la base real.
echo "==> Validando el dump"
docker exec -i "$container" pg_restore --list < "$dump" > /dev/null \
  || { echo "El dump está corrupto o no es formato custom. Se aborta." >&2; exit 1; }
tables=$(docker exec -i "$container" pg_restore --list < "$dump" | grep -c 'TABLE DATA' || true)
echo "    $dump  ($(du -h "$dump" | cut -f1), $tables tablas con datos)"

# 2. Restaurarlo en una base desechable prueba que aplica limpio, sin arriesgar nada.
#    Va en el MISMO contenedor destino: así no depende de que el de test esté arriba.
echo "==> Probando el restore en una base desechable"
cleanup() { docker exec -i "$container" psql -U "$user" -qc "DROP DATABASE IF EXISTS $scratch_db WITH (FORCE);" >/dev/null 2>&1 || true; }
trap cleanup EXIT
psql_ -qc "DROP DATABASE IF EXISTS $scratch_db WITH (FORCE);" >/dev/null
psql_ -qc "CREATE DATABASE $scratch_db;" >/dev/null
docker exec -i "$container" pg_restore -U "$user" -d "$scratch_db" --no-owner --exit-on-error < "$dump" \
  || { echo "El dump no aplica limpio. NO se tocó '$db'." >&2; exit 1; }
psql_ -d "$scratch_db" -c \
  "SELECT relname AS tabla, n_live_tup AS filas_aprox FROM pg_stat_user_tables ORDER BY relname;"
cleanup; trap - EXIT

# 3. ¿Hay alguien conectado? Casi siempre es la API con su pool abierto.
conns=$(psql_ -tAc \
  "SELECT count(*) FROM pg_stat_activity WHERE datname='$db' AND pid <> pg_backend_pid();")
if (( conns > 0 )); then
  echo "!!  Hay $conns conexión(es) abiertas a '$db' — probablemente la API."
  echo "    Detenla antes de continuar, o se cerrarán a la fuerza."
fi

echo
echo "==> Se va a BORRAR la base '$db' en '$container' y reemplazarla por:"
echo "    $dump"
if (( ! assume_yes )); then
  [[ -e /dev/tty ]] || { echo "Sin terminal para confirmar. Usa --yes (y --force-real si aplica)." >&2; exit 1; }
  printf "    Escribe el nombre de la base para confirmar: "
  read -r answer < /dev/tty || { echo; echo "Sin confirmación. Cancelado."; exit 1; }
  [[ "$answer" == "$db" ]] || { echo "No coincide ('$answer' != '$db'). Cancelado."; exit 1; }
fi

# 4. Una red de seguridad: si el dump resulta ser el equivocado, hay vuelta atrás.
mkdir -p "$dest"
safety="$dest/pre-restore-${db}-$(date +%Y%m%d-%H%M%S).dump"
if docker exec -i "$container" pg_dump -U "$user" -d "$db" --format=custom > "$safety.tmp" 2>/dev/null; then
  mv "$safety.tmp" "$safety"
  echo "==> Estado actual guardado en $safety"
else
  rm -f "$safety.tmp"
  echo "==> '$db' no existe o está vacía; no hay estado que guardar"
fi

echo "==> Restaurando"
psql_ -qc "DROP DATABASE IF EXISTS $db WITH (FORCE);" >/dev/null
psql_ -qc "CREATE DATABASE $db;" >/dev/null
docker exec -i "$container" pg_restore -U "$user" -d "$db" --no-owner --exit-on-error < "$dump"

echo "==> Listo. Contenido de '$db':"
psql_ -d "$db" -c \
  "SELECT relname AS tabla, n_live_tup AS filas_aprox FROM pg_stat_user_tables ORDER BY relname;"
echo "(filas_aprox es un estimado de Postgres; usa count(*) si necesitas exactitud)"
