#!/usr/bin/env sh
set -eu

case "${1:-}" in
  runtime|command-center|mcp) ;;
  *) echo "Expected runtime, command-center, or mcp" >&2; exit 2 ;;
esac

# Schema, company identity and restricted principals are provisioned separately.
# Runtime startup never obtains operator authority or reruns legacy migrations.
# Both application entrypoints perform read-only production admission.

case "${1:-}" in
  runtime)
    export PORT="${PORT:-10000}"
    # Keep the signal handler in the container's foreground process. npm/tsx
    # wrappers can leave the old worker ticking during a rolling replacement.
    exec node --import tsx apps/runtime/src/main.ts
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
    exec node --import tsx apps/mcp/src/main.ts
    ;;
  *)
    echo 'Expected runtime, command-center, or mcp' >&2
    exit 2
    ;;
esac
