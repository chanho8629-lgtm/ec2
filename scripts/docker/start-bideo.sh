#!/bin/sh
set -eu

export FASTAPI_BASE_URL="${FASTAPI_BASE_URL:-http://127.0.0.1:8000}"

cd /app/fastapi/basic
/opt/bideo-ai/bin/uvicorn main:app --host 127.0.0.1 --port 8000 &
FASTAPI_PID="$!"

cd /app
java -jar app.jar &
SPRING_PID="$!"

shutdown() {
  kill "$SPRING_PID" 2>/dev/null || true
  kill "$FASTAPI_PID" 2>/dev/null || true
}

trap shutdown INT TERM EXIT
wait "$SPRING_PID"
