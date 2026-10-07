#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${SAM_PRODUCTION_ENV_FILE:-deploy/production/.env.production}"
COMPOSE_FILE="deploy/production/docker-compose.live.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing production env file: $ENV_FILE" >&2
  exit 2
fi

echo "[1/7] Validate compose"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config >/dev/null

echo "[2/7] Build application images"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --pull sam sam-mcp sam-command-center migrate

echo "[3/7] Start database"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d postgres

echo "[4/7] Apply migrations"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm migrate

echo "[5/7] Start SAM services"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d sam sam-mcp sam-command-center

echo "[6/7] Wait for health"
i=0
while [ "$i" -lt 60 ]; do
  sam_id="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps -q sam)"
  cc_id="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps -q sam-command-center)"
  mcp_id="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps -q sam-mcp)"
  sam_state="$(docker inspect --format='{{json .State.Health.Status}}' "$sam_id" 2>/dev/null || true)"
  cc_state="$(docker inspect --format='{{json .State.Health.Status}}' "$cc_id" 2>/dev/null || true)"
  mcp_state="$(docker inspect --format='{{json .State.Health.Status}}' "$mcp_id" 2>/dev/null || true)"
  if [ "$sam_state" = '"healthy"' ] && [ "$cc_state" = '"healthy"' ] && [ "$mcp_state" = '"healthy"' ]; then
    break
  fi
  i=$((i+1))
  sleep 2
done

if [ "$i" -ge 60 ]; then
  echo "SAM services did not become healthy" >&2
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
  exit 3
fi

echo "[7/7] Start TLS ingress"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d caddy
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

echo "DEPLOYMENT STARTUP PASS"
echo "Next: run npm run live:acceptance from a trusted operator host against the public HTTPS endpoints."
