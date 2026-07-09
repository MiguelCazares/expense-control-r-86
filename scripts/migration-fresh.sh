#!/usr/bin/env bash
set -euo pipefail

# Borra el esquema y vuelve a aplicar las migraciones.
# El destino sale de NODE_ENV, igual que en app.module.ts y data-source.ts.

usage() { echo "Uso: NODE_ENV=[test] ./scripts/migration-fresh.sh [--yes]" >&2; }

assume_yes=0
for arg in "$@"; do
  case "$arg" in
    --yes|-y) assume_yes=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Opción desconocida: $arg" >&2; usage; exit 2 ;;
  esac
done

if [[ "${NODE_ENV:-}" == "test" ]]; then
  container="${DB_CONTAINER:-route-control-test-db}"
  db="${DB_NAME:-route_control_test}"
else
  container="${DB_CONTAINER:-route-control-db}"
  db="${DB_NAME:-route_control}"
fi
user="${DB_USERNAME:-postgres}"

docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null | grep -qx true \
  || { echo "El contenedor '$container' no está corriendo. Corre: docker compose up -d" >&2; exit 1; }

# Sobre la base real esto destruye datos de verdad; la de test es desechable.
if (( ! assume_yes )) && [[ "${NODE_ENV:-}" != "test" ]]; then
  echo "==> Se va a BORRAR el esquema de '$db' en '$container'."
  [[ -e /dev/tty ]] || { echo "Sin terminal para confirmar. Usa --yes." >&2; exit 1; }
  printf "    Escribe el nombre de la base para confirmar: "
  read -r answer < /dev/tty || { echo; echo "Sin confirmación. Cancelado."; exit 1; }
  [[ "$answer" == "$db" ]] || { echo "No coincide ('$answer' != '$db'). Cancelado."; exit 1; }
fi

echo "==> Borrando esquema de '$db'"
docker exec -i "$container" psql -U "$user" -d "$db" -v ON_ERROR_STOP=1 \
  -qc "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "==> Aplicando migraciones"
pnpm migration:run
