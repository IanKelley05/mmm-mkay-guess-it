# Mmm-Mkay? Guess It!

Heads Up: South Park Edition. The interface uses solid construction-paper panels over the supplied `South_Park_Town_Background.png`, loaded with a relative CSS path for GitHub Pages. Setup, countdown, rounds, results, and history use centered responsive containers with equal side margins, independent of the background artwork.

The local Kenny favicon is a square close-up cropped from his existing character portrait, supplied at 16px and 32px plus a 180px Apple touch icon. Rebuild it on Windows with `powershell -File scripts/build-kenny-favicon.ps1`. If the old tab icon persists, hard-refresh and reopen the tab; clear cached images/files if needed, without clearing site data or localStorage (which holds session history).

A South Park character guessing game for two people on a video call. Plain HTML, CSS, and JavaScript; no build step, dependencies, accounts, backend, microphone access, or multiplayer connection.

**Artwork status:** all 48 characters use bundled PNG portraits downloaded from the official South Park Wiki’s Paramount image host. See [IMAGE_SOURCES.md](IMAGE_SOURCES.md) for source URLs and rights information.

## Preview locally

From this folder, with Python installed:

```sh
python -m http.server 8080
```

Open **http://localhost:8080**. Alternatively, run `npm run preview`. Use a local HTTP server rather than opening `index.html` directly: JavaScript modules require HTTP in most browsers. No `npm install` is needed.

## GitHub Pages

Repository: https://github.com/IanKelley05/mmm-mkay-guess-it

Play: https://iankelley05.github.io/mmm-mkay-guess-it/

1. In the repository, open **Settings → Pages**.
2. Choose **Deploy from a branch**, select **main**, and choose **/ (root)**. Save.
3. Push updates to `main`; GitHub Pages automatically publishes the root static files. No custom workflow, dependency installation, or build step is required.
4. Check the repository's **Actions** tab for the Pages build/deployment result. A successful push is separate from a successful Pages deployment; wait for deployment to finish before checking the live URL.

All application paths are relative, including images, favicon, background, and module imports, so repository subdirectories work. `.nojekyll` keeps the site as plain static files. Include the `assets` and `js` folders and `South_Park_Town_Background.png` when publishing. `.gitignore` excludes browser profiles, test artifacts, dependencies, local configuration, credentials, and retired artwork. Session history stays in the player's browser and is never committed.

For a fresh checkout, run `git clone https://github.com/IanKelley05/mmm-mkay-guess-it.git`, enter the resulting folder, and follow the local preview instructions above. To publish an update, review `git diff`, stage the intended files, commit them, and run `git push origin main`. Do not force-push.

## How to play

- Only the describer opens/views the game. Keep the guesser on your existing call; do not share this screen.
- Choose 30, 60 (default), 90, or 120 seconds, or a custom whole number from 10–600. Player names are optional.
- Select **Start Round**. All images load (or resolve to a readable fallback) before the **3–2–1** countdown. The first character appears when the round timer begins.
- Describe the character without saying their name. Use **Correct!** or **Right Arrow** for one point; **Skip** or **Left Arrow** advances without a point.
- Each round shuffles all 48 characters without replacement. The round ends at the deadline or when the deck is exhausted.
- The last ten seconds turn red and receive an explicit label. Timing uses an absolute deadline, including when you change tabs. Answers at or after the deadline are rejected even if the browser delays a rendering callback. A hidden preparation countdown restarts on return so the round doesn’t start unseen.
- Duplicate clicks are ignored. Inputs have a 350 ms guard, and held keyboard shortcuts are ignored until released. Make a separate click/key press for each card.
- Results separate correct, skipped, and unfinished cards. The unfinished card scores no points and is not counted as skipped.
- **Play Again** immediately prepares another round with the same settings and a newly shuffled deck (randomness can coincidentally place the same character first).
- **Switch Roles** swaps the player names and returns to setup so both people can prepare. **Back to Setup** keeps the current roles.

Settings and the latest 100 round summaries are saved in this browser’s `localStorage` under `snow-day-v1`. History records the guesser, describer, selected duration, score, skips, and completion date. Compare scores at equal durations. **Clear history** removes summaries and keeps settings. History does not sync between devices or origins. If browser storage is unavailable, the game continues in memory and displays a notice.

## Edit the character deck

Edit **[js/characters.js](js/characters.js)**. Each entry has a unique stable `id`, display `name`, relative `image` path, and `imageStatus` (`fallback` for a name card, `portrait` for an actual portrait).

```js
{
  "id": "stan-marsh",
  "name": "Stan Marsh",
  "image": "assets/characters/stan-marsh.png",
  "imageStatus": "portrait"
}
```

Place the matching image in `assets/characters/` and update that record. Use a transparent PNG/WebP or appropriate SVG; the UI uses `object-fit: contain` to avoid cropping. Keep IDs stable and case-sensitive paths accurate. Add source URL, creator/rightsholder, license/permission information, and any required attribution to `IMAGE_SOURCES.md`. Do not assume publicly viewable images are freely licensed. For missing artwork, retain the existing labeled SVG or a readable equivalent. Failed or slow image requests receive a named fallback after at most eight seconds, before the countdown starts.

To add a character, add one record and a local image. Counts, shuffling, preloading, exhaustion, and results use the collection automatically. Update the asset test’s expected count when intentionally changing deck size. The application never requests remote image URLs by default.

## Code map

- `index.html`: setup, countdown, gameplay, results, and history markup.
- `styles.css`: responsive town background, construction-paper panels, game controls, focus states, and reduced-motion rules. All visuals and fonts are local/system supplied.
- `js/characters.js`: editable character collection.
- `js/core.js`: shuffle, validation, deadline-based round state, role swap, and storage helpers.
- `js/app.js`: rendering, preloading, input handling, and screen transitions.
- `assets/characters/`: 48 PNG portraits. The original local SVG name cards are retired and excluded from publishing; failed image loads still receive a readable fallback in the game.
- `tests/core.test.js`: dependency-free logic and asset tests.
- `scripts/browser-check.mjs`: actual Chrome browser smoke test via DevTools, with screenshots.

## Verification

With Node.js 22 or newer:

```sh
npm test
```

The 11 tests cover duration boundaries, bundled assets, shuffle integrity, scoring, duplicate-input guards, exact deadline rejection, background elapsed time, full deck exhaustion, new rounds, role swaps, persistence, corrupt data, and unavailable storage.

For browser checks, first start the local server, then launch a separate Chrome instance with a **temporary profile** and `--remote-debugging-port=9222`. For example, in PowerShell:

```powershell
& 'C:/Program Files/Google/Chrome/Application/chrome.exe' --headless=new --disable-gpu --no-first-run --remote-debugging-port=9222 "--user-data-dir=$PWD/.browser-profile" about:blank
```

In a second terminal:

```sh
node scripts/browser-check.mjs
```

This test clears localStorage on the test origin/profile, accelerates its own clock, exercises controls using clicks and browser keyboard events, and writes screenshots to ignored `artifacts/`. It checks invalid custom input, preloading/countdown, both scoring controls, held keys, double clicks, expiry, unfinished cards, replay, role swapping, all 48 cards, history after reload, clear history, mobile overflow, and runtime exceptions. `TEST_URL` can point it at a different local project path.

Verified during implementation: all 11 tests passed and the Chrome smoke test passed; desktop and mobile screenshots were inspected. The restricted build environment required Chrome’s `--in-process-gpu --no-sandbox` flags for this isolated local-only browser check. Those flags are not application requirements and should not be used for normal browsing.

## Limitations

- A sleeping/hidden browser cannot repaint until it resumes, but the deadline and input checks prevent extra points or time on return.
- History is local to the browser and retains only the latest 100 rounds; refresh abandons an active round without saving a partial score.
- Tested in Chromium. No physical-device or Safari/Firefox verification was performed.

This is an unofficial fan game. South Park and its characters belong to their respective owners. No affiliation or endorsement is implied.
