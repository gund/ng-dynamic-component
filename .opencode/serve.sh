#!/usr/bin/env zsh
set -a; source .env.local; set +a;

VERSION="${OC_VERSION:-latest}"
PORT="${OC_PORT:-1234}"
HOSTNAME="${OC_HOSTNAME:-0.0.0.0}"

echo "Starting opencode version ${VERSION} on ${HOSTNAME}:${PORT}..."
npx -y opencode-ai@"$VERSION" serve --port "$PORT" --hostname "$HOSTNAME" "$@"

