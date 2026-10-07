#!/usr/bin/env sh
set -eu

case "${1:-}" in
  runtime|command-center|mcp) ;;
  *) echo "Expected runtime, command-center, or mcp" >&2; exit 2 ;;
esac

# Free services have no pre-deploy command. Migrations serialize using the
# existing database advisory lock; company initialization is idempotent.
npm run db:migrate -- --apply
node deploy/render/initialize-company.mjs

case "${1:-}" in
  runtime)
    export PORT="${PORT:-10000}"
    exec npm start
    ;;
  command-center)
    : "${RENDER_EXTERNAL_HOSTNAME:?Render public hostname is required}"
    export SAM_COMMAND_CENTER_PORT="${PORT:-10000}"
    export SAM_COMMAND_CENTER_HOST=0.0.0.0
    export SAM_COMMAND_CENTER_ALLOWED_HOSTS="$RENDER_EXTERNAL_HOSTNAME"
    export SAM_COMMAND_CENTER_ALLOWED_ORIGINS="https://$RENDER_EXTERNAL_HOSTNAME"
    exec npm run start:command-center
    ;;
  mcp)
    : "${RENDER_EXTERNAL_HOSTNAME:?Render public hostname is required}"
    export SAM_MCP_PORT="${PORT:-10000}"
    export SAM_MCP_HOST=0.0.0.0
    export SAM_MCP_ALLOWED_HOSTS="$RENDER_EXTERNAL_HOSTNAME"
    exec npm run start:mcp
    ;;
  *)
    echo 'Expected runtime, command-center, or mcp' >&2
    exit 2
    ;;
esac
