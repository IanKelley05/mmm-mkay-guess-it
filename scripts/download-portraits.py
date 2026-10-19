"""Download official wiki portraits through Paramount's current image host."""
import concurrent.futures
import hashlib
import html
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'artifacts' / 'portrait-sources'
CACHE.mkdir(parents=True, exist_ok=True)
characters = json.loads((ROOT / 'js/characters.js').read_text().split('export const characters = ')[1].rstrip(';\n'))
overrides = {'sgt-harrison-yates': 'Harrison Yates', 'shelly-marsh': 'Shelley Marsh', 'red-mcarthur': 'Red'}
previous = {r['id']: r for r in json.loads((CACHE / 'manifest.json').read_text())} if (CACHE / 'manifest.json').exists() else {}
preferred = {'mr-garrison': 'shared/characters/adults/school-faculty-mr-garrison-no-mr-hat.png'}

def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30) as response:
        return response.read()

def download(c):
    if c['id'] in previous and 'error' not in previous[c['id']] and (c['id'] not in preferred or previous[c['id']]['url'].endswith(preferred[c['id']])):
        row = previous[c['id']]
        if (ROOT / row['image']).exists() and hashlib.sha256((ROOT / row['image']).read_bytes()).hexdigest() == row['sha256']:
            return row
    page = 'https://southpark.cc.com/w/index.php/' + urllib.parse.quote(overrides.get(c['id'], c['name']).replace(' ', '_'))
    try:
        source = fetch(page).decode('utf-8')
        (CACHE / (c['id'] + '.html')).write_text(source, encoding='utf-8')
        pattern = re.escape(preferred[c['id']]) if c['id'] in preferred else r'shared/characters/[^\s"<>?]+'
        match = re.search(r'https?://southparkstudios\.mtvnimages\.com/(' + pattern + ')', source)
        if not match:
            raise ValueError('No character portrait link found')
        original = html.unescape(match.group(0))
        url = 'https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/' + html.unescape(match.group(1))
        data = fetch(url)
        if not data.startswith(b'\x89PNG\r\n\x1a\n'):
            raise ValueError('Response is not a PNG')
        path = 'assets/characters/' + c['id'] + '.png'
        (ROOT / path).write_bytes(data)
        result = dict(c, image=path, imageStatus='portrait', page=page, original=original, url=url, bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        print('OK', c['name'], len(data), flush=True)
        return result
    except Exception as error:
        print('FAIL', c['name'], str(error), flush=True)
        return dict(c, page=page, error=str(error))

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(download, characters))
(CACHE / 'manifest.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
print('Downloaded', sum('error' not in row for row in results), 'of', len(results))
