#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${DB_HOST:-bideo.shop}"
DB_PORT="${PSQL_PORT:?PSQL_PORT is required}"
DB_NAME="${PSQL_DATABASE:?PSQL_DATABASE is required}"
DB_USER="${PSQL_USERNAME:?PSQL_USERNAME is required}"
DB_PASSWORD="${PSQL_PASSWORD:?PSQL_PASSWORD is required}"
SQL_DIR="${SQL_DIR:-/home/ubuntu/bideo/src/main/resources/sql}"

run_psql() {
  docker run --rm \
    --add-host=bideo.shop:172.31.37.54 \
    -v "${SQL_DIR}:/sql" \
    -e PGPASSWORD="${DB_PASSWORD}" \
    postgres:16 \
    psql -v ON_ERROR_STOP=1 \
      -h "${DB_HOST}" \
      -p "${DB_PORT}" \
      -U "${DB_USER}" \
      -d "${DB_NAME}" \
      "$@"
}

run_psql -f /sql/ensure_database_schema.sql
