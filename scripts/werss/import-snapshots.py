"""Import latest snapshots one feed at a time; never reactivate paused sources on scheduled runs."""
import json
from pathlib import Path
import subprocess
import sys

root = Path('/opt/displayhot-werss')
rows = json.loads((root / 'data/snapshot.json').read_text())
results = []
for feed in rows:
    path = root / 'one-snapshot.json'
    path.write_text(json.dumps([feed], ensure_ascii=False))
    path.chmod(0o600)
    subprocess.run(['docker', 'cp', str(path), 'aihot-api-1:/tmp/werss-snapshot.json'], check=True, capture_output=True)
    subprocess.run(['docker', 'exec', '-u', 'root', 'aihot-api-1', 'chown', 'node:node', '/tmp/werss-snapshot.json'], check=True, capture_output=True)
    command = ['docker', 'exec', 'aihot-api-1', 'node', '/app/scripts/import-werss.ts', '/tmp/werss-snapshot.json']
    if '--activate' in sys.argv:
        command.append('--activate')
    result = subprocess.run(command, capture_output=True, text=True, timeout=90)
    results.append({'sourceId': feed['sourceId'], 'ok': result.returncode == 0})
    print(feed['sourceId'], 'import OK' if result.returncode == 0 else 'import FAILED', result.stdout.strip(), flush=True)
    (root / 'import-results.json').write_text(json.dumps(results))
if any(not result['ok'] for result in results):
    sys.exit(1)
