"""Read the latest article through the authenticated WeRead channel, preserving source dates."""
import contextlib
from datetime import datetime, timezone
import io
import json
from pathlib import Path
import re
import time
from urllib.parse import unquote

with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
    import requests
    from core.wx.model.weread_mp import MpsWereadMP, extract_mp_content
    collector = MpsWereadMP()
    collector._load_weread_auth()
registry = json.loads(Path('/app/data/enabled-feeds.json').read_text())
output = []
failures = []
for feed in registry:
    try:
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            cover = collector._get_mp_cover(feed['feedId'])
        response = requests.get('https://weread.qq.com/web/mp/content',
            params={'reviewId': cover['reviewId']}, headers=collector._request_headers(), timeout=30)
        response.raise_for_status()
        body = extract_mp_content(response.text)
        if len(body) < 280:
            raise ValueError('article body unavailable')
        # The article's encoded document metadata carries its actual publish_time.
        dates = set(re.findall(r'"publish_time"\s*:\s*(\d{10})', unquote(response.text)))
        date = None
        if len(dates) == 1:
            timestamp = int(next(iter(dates)))
            if 1262304000 <= timestamp <= time.time() + 300:
                date = datetime.fromtimestamp(timestamp, timezone.utc).isoformat()
        from core.wx.model.weread_mp import build_mp_link_from_review_id
        item = {'title': cover['title'], 'url': build_mp_link_from_review_id(cover['reviewId'], feed['feedId']),
                'publishedAt': date, 'bodyHtml': body}
        output.append({'sourceId': feed['sourceId'], 'items': [item]})
        print(feed['sourceId'], 'body OK', 'date verified' if date else 'date unknown; archive only', flush=True)
    except Exception as exc:
        failures.append({'sourceId': feed['sourceId'], 'error': type(exc).__name__})
        print(feed['sourceId'], 'failed', type(exc).__name__, flush=True)
    path = Path('/app/data/snapshot.json')
    path.write_text(json.dumps(output, ensure_ascii=False))
    path.chmod(0o600)
    Path('/app/data/snapshot-failures.json').write_text(json.dumps(failures))
    time.sleep(3)
