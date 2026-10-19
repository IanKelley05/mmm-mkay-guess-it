"""Connect a fully downloaded and visually reviewed portrait manifest."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
rows = json.loads((root / 'artifacts/portrait-sources/manifest.json').read_text())
assert len(rows) == 48 and all('error' not in r for r in rows)
for row in rows:
    row['imageStatus'] = 'portrait'
characters = [{k: r[k] for k in ['id', 'name', 'image']} | {'imageStatus': 'portrait'} for r in rows]
(root / 'js/characters.js').write_text('// Local portraits; source records are in IMAGE_SOURCES.md.\nexport const characters = ' + json.dumps(characters, indent=2) + ';\n', encoding='utf-8')
(root / 'assets/portrait-sources.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')
text = '''# Character artwork and sources

## Current asset status

**Original character portraits bundled: 48 of 48. Missing portraits: 0 of 48.**

Downloaded October 19, 2026 from Paramount's image CDN, using portrait paths published on the official South Park Wiki. All 48 PNGs were decoded and visually reviewed. The game uses local files for gameplay and results, without runtime requests to the source sites. The previous SVG name cards remain available in the asset directory but are no longer selected by the deck.

## Download retry

The first test requested `https://southparkstudios.mtvnimages.com/shared/characters/kids/stan-marsh.png` with curl and failed with the exact error:

```text
curl: (6) Could not resolve host: southparkstudios.mtvnimages.com
```

An outside-sandbox retry returned the same error. The official wiki Main page links the replacement host at `https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/`. Stan's portrait downloaded there with HTTP 200, Content-Type `image/png`, and 1,050,606 bytes. Each remaining path was extracted from its wiki page, not guessed. Python HTTPS downloads succeeded. Additional diagnostics: Windows curl returned `SEC_E_NO_CREDENTIALS (0x8009030e)` for Fandom and Wikipedia; Python requests to those sites returned HTTP 403.

## Attribution and rights

Source publisher: official South Park Wiki / Paramount. South Park artwork and characters belong to their respective owners (South Park / Comedy Central / Paramount); individual image artist credits and a redistribution license were not supplied by these source pages. These are copyrighted show portraits, not project-created or openly licensed artwork. No permission or endorsement is claimed. This is an unofficial fan game.

Mr. Garrison uses the teacher portrait explicitly linked on his page. Ned uses the injured portrait currently featured on his page. The wiki calls Shelly “Shelley Marsh” and Red “Red”; the game's existing names and IDs are retained.

## Per-character sources

The table records the exact source page and downloaded image. `assets/portrait-sources.json` also records original legacy URLs, byte sizes, and SHA-256 hashes of the bundled files.

| Character | Local asset | Source page | Downloaded image |
| --- | --- | --- | --- |
'''
for r in rows:
    text += f"| {r['name']} | `{r['image']}` | [Official wiki]({r['page']}) | [PNG]({r['url']}) |\n"
text += '\n## Reproducing downloads\n\nRun `python scripts/download-portraits.py`. It verifies PNG signatures, records failures, and caches successful downloads with hashes in `artifacts/portrait-sources/manifest.json`. Review the images before running `python scripts/connect-portraits.py`, which requires all 48 downloads to have succeeded.\n'
(root / 'IMAGE_SOURCES.md').write_text(text, encoding='utf-8')
readme = root / 'README.md'
s = readme.read_text(encoding='utf-8')
s = s.replace(next(line for line in s.splitlines() if line.startswith('**Artwork status:**')), '**Artwork status:** all 48 characters use bundled PNG portraits downloaded from the official South Park Wiki’s Paramount image host. See [IMAGE_SOURCES.md](IMAGE_SOURCES.md) for source URLs and rights information.')
s = s.replace('`assets/characters/`: 48 labeled fallback name cards.', '`assets/characters/`: 48 PNG portraits plus the original SVG fallback name cards.')
s = s.replace('- **48 original character portraits are missing**; all are explicitly labeled name cards, as documented below.\n', '')
readme.write_text(s, encoding='utf-8')
index = root / 'index.html'
s = index.read_text(encoding='utf-8').replace('This edition includes labeled name cards for all 48 characters. Original portraits could not be downloaded in the build environment. You can still play using the names; see IMAGE_SOURCES.md to add portraits.', 'All 48 characters have locally bundled portraits. This is an unofficial fan game; South Park artwork belongs to its respective owners. See IMAGE_SOURCES.md for artwork sources.')
index.write_text(s, encoding='utf-8')
