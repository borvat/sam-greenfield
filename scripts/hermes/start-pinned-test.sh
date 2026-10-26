#!/bin/sh
set -eu
/opt/hermes/.venv/bin/python /opt/data/sam-hermes-model-lock.py
exec /opt/hermes/docker/entrypoint-dispatch.sh gateway run
