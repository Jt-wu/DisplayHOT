#!/bin/sh
set -eu
exec 9>/run/displayhot-werss.lock
flock -n 9 || exit 0
root=/opt/displayhot-werss
docker cp "$root/snapshot-werss.py" displayhot-werss:/tmp/snapshot-werss.py
docker exec -e PYTHONPATH=/app displayhot-werss /app/env_x86_64/bin/python3 /tmp/snapshot-werss.py
docker cp "$root/import-werss.ts" aihot-api-1:/app/scripts/import-werss.ts
docker exec -u root aihot-api-1 chown node:node /app/scripts/import-werss.ts
python3 "$root/import-snapshots.py"
