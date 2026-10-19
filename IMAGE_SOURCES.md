# Character artwork and sources

## Kenny favicon

`assets/kenny-favicon-16.png`, `assets/kenny-favicon-32.png`, and `assets/kenny-touch-icon.png` are derived directly from the bundled Kenny portrait documented below. A square crop at x=620, y=145, width=680, height=680 isolates his orange hood and face; the crop is resized to 16, 32, and 180 pixels with transparency preserved. No generated artwork is used. `scripts/build-kenny-favicon.ps1` reproduces this conversion; rights and source attribution remain those of the original portrait.

## Town background

`South_Park_Town_Background.png` was supplied by the user and is used locally, unmodified, as the page background. CSS references `./South_Park_Town_Background.png`, preserving GitHub Pages subdirectory compatibility. Original source URL and license were not supplied; South Park artwork belongs to its respective owners.

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

The table records the exact source page and downloaded image. `assets/portrait-sources.json` also records original legacy URLs, byte sizes, and SHA-256 hashes of the bundled files. Retired SVG name cards are excluded from the public repository; the game renders a readable fallback if a portrait cannot load.

| Character | Local asset | Source page | Downloaded image |
| --- | --- | --- | --- |
| Stan Marsh | `assets/characters/stan-marsh.png` | [Official wiki](https://southpark.cc.com/w/index.php/Stan_Marsh) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/stan-marsh.png) |
| Kyle Broflovski | `assets/characters/kyle-broflovski.png` | [Official wiki](https://southpark.cc.com/w/index.php/Kyle_Broflovski) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/kyle-broflovski.png) |
| Eric Cartman | `assets/characters/eric-cartman.png` | [Official wiki](https://southpark.cc.com/w/index.php/Eric_Cartman) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/eric-cartman.png) |
| Kenny McCormick | `assets/characters/kenny-mccormick.png` | [Official wiki](https://southpark.cc.com/w/index.php/Kenny_McCormick) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/kenny-mccormick.png) |
| Butters Stotch | `assets/characters/butters-stotch.png` | [Official wiki](https://southpark.cc.com/w/index.php/Butters_Stotch) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/butters-stotch.png) |
| Wendy Testaburger | `assets/characters/wendy-testaburger.png` | [Official wiki](https://southpark.cc.com/w/index.php/Wendy_Testaburger) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/wendy-testaburger.png) |
| Randy Marsh | `assets/characters/randy-marsh.png` | [Official wiki](https://southpark.cc.com/w/index.php/Randy_Marsh) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/randy-marsh.png) |
| Sharon Marsh | `assets/characters/sharon-marsh.png` | [Official wiki](https://southpark.cc.com/w/index.php/Sharon_Marsh) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/sharon-marsh.png) |
| Shelly Marsh | `assets/characters/shelly-marsh.png` | [Official wiki](https://southpark.cc.com/w/index.php/Shelley_Marsh) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/shelly-marsh.png) |
| Gerald Broflovski | `assets/characters/gerald-broflovski.png` | [Official wiki](https://southpark.cc.com/w/index.php/Gerald_Broflovski) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/gerald-broflovski.png) |
| Sheila Broflovski | `assets/characters/sheila-broflovski.png` | [Official wiki](https://southpark.cc.com/w/index.php/Sheila_Broflovski) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/sheila-broflovski.png) |
| Ike Broflovski | `assets/characters/ike-broflovski.png` | [Official wiki](https://southpark.cc.com/w/index.php/Ike_Broflovski) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/kindergarten-ike.png) |
| Liane Cartman | `assets/characters/liane-cartman.png` | [Official wiki](https://southpark.cc.com/w/index.php/Liane_Cartman) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/liane-cartman.png) |
| Chef | `assets/characters/chef.png` | [Official wiki](https://southpark.cc.com/w/index.php/Chef) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/chef.png) |
| Mr. Garrison | `assets/characters/mr-garrison.png` | [Official wiki](https://southpark.cc.com/w/index.php/Mr._Garrison) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/school-faculty-mr-garrison-no-mr-hat.png) |
| Mr. Mackey | `assets/characters/mr-mackey.png` | [Official wiki](https://southpark.cc.com/w/index.php/Mr._Mackey) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/mackey.png) |
| Principal Victoria | `assets/characters/principal-victoria.png` | [Official wiki](https://southpark.cc.com/w/index.php/Principal_Victoria) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/principal-victoria.png) |
| PC Principal | `assets/characters/pc-principal.png` | [Official wiki](https://southpark.cc.com/w/index.php/PC_Principal) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/education-pc-principal.png) |
| Tweek Tweak | `assets/characters/tweek-tweak.png` | [Official wiki](https://southpark.cc.com/w/index.php/Tweek_Tweak) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/tweek-tweak.png) |
| Craig Tucker | `assets/characters/craig-tucker.png` | [Official wiki](https://southpark.cc.com/w/index.php/Craig_Tucker) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/craig-tucker.png) |
| Clyde Donovan | `assets/characters/clyde-donovan.png` | [Official wiki](https://southpark.cc.com/w/index.php/Clyde_Donovan) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/clyde-donovan.png) |
| Tolkien Black | `assets/characters/tolkien-black.png` | [Official wiki](https://southpark.cc.com/w/index.php/Tolkien_Black) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/token-black.png) |
| Jimmy Valmer | `assets/characters/jimmy-valmer.png` | [Official wiki](https://southpark.cc.com/w/index.php/Jimmy_Valmer) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/jimmy-valmer.png) |
| Timmy Burch | `assets/characters/timmy-burch.png` | [Official wiki](https://southpark.cc.com/w/index.php/Timmy_Burch) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/timmy-burch.png) |
| Bebe Stevens | `assets/characters/bebe-stevens.png` | [Official wiki](https://southpark.cc.com/w/index.php/Bebe_Stevens) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/bebe-stevens.png) |
| Heidi Turner | `assets/characters/heidi-turner.png` | [Official wiki](https://southpark.cc.com/w/index.php/Heidi_Turner) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/alter-egos/alter-egos-heidi-turner-w-hat.png) |
| Scott Malkinson | `assets/characters/scott-malkinson.png` | [Official wiki](https://southpark.cc.com/w/index.php/Scott_Malkinson) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/scott-malkinson.png) |
| Kevin Stoley | `assets/characters/kevin-stoley.png` | [Official wiki](https://southpark.cc.com/w/index.php/Kevin_Stoley) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/kevin-stoley.png) |
| Red McArthur | `assets/characters/red-mcarthur.png` | [Official wiki](https://southpark.cc.com/w/index.php/Red) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/red.png) |
| Bradley Biggle | `assets/characters/bradley-biggle.png` | [Official wiki](https://southpark.cc.com/w/index.php/Bradley_Biggle) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/bradley-biggle.png) |
| Nathan | `assets/characters/nathan.png` | [Official wiki](https://southpark.cc.com/w/index.php/Nathan) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/alter-egos/other-4th-graders-nathan-casual-outfit.png) |
| Mimsy | `assets/characters/mimsy.png` | [Official wiki](https://southpark.cc.com/w/index.php/Mimsy) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/mimsy.png) |
| Terrance | `assets/characters/terrance.png` | [Official wiki](https://southpark.cc.com/w/index.php/Terrance) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/celebrities/terrance.png) |
| Phillip | `assets/characters/phillip.png` | [Official wiki](https://southpark.cc.com/w/index.php/Phillip) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/celebrities/pillip.png) |
| Terrance Mephesto | `assets/characters/terrance-mephesto.png` | [Official wiki](https://southpark.cc.com/w/index.php/Terrance_Mephesto) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/kids/terrance-mephesto.png) |
| Jimbo Kern | `assets/characters/jimbo-kern.png` | [Official wiki](https://southpark.cc.com/w/index.php/Jimbo_Kern) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/jimbo-kern.png) |
| Ned Gerblansky | `assets/characters/ned-gerblansky.png` | [Official wiki](https://southpark.cc.com/w/index.php/Ned_Gerblansky) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/alter-egos/alter-egos-ned-banged-up.png) |
| Officer Barbrady | `assets/characters/officer-barbrady.png` | [Official wiki](https://southpark.cc.com/w/index.php/Officer_Barbrady) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/barbrady-family-barbrady-unhatted-plain-clothes.png) |
| Sgt. Harrison Yates | `assets/characters/sgt-harrison-yates.png` | [Official wiki](https://southpark.cc.com/w/index.php/Harrison_Yates) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/murphy-mitch-harris.png) |
| Mayor McDaniels | `assets/characters/mayor-mcdaniels.png` | [Official wiki](https://southpark.cc.com/w/index.php/Mayor_McDaniels) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/mayor-mcdaniels.png) |
| Mr. Hankey | `assets/characters/mr-hankey.png` | [Official wiki](https://southpark.cc.com/w/index.php/Mr._Hankey) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/celebrities/mr-hankey.png) |
| Towelie | `assets/characters/towelie.png` | [Official wiki](https://southpark.cc.com/w/index.php/Towelie) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/non-human/towelie.png) |
| Big Gay Al | `assets/characters/big-gay-al.png` | [Official wiki](https://southpark.cc.com/w/index.php/Big_Gay_Al) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/biggayal.png) |
| Mr. Slave | `assets/characters/mr-slave.png` | [Official wiki](https://southpark.cc.com/w/index.php/Mr._Slave) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/mrslave.png) |
| Satan | `assets/characters/satan.png` | [Official wiki](https://southpark.cc.com/w/index.php/Satan) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/non-human/satan.png) |
| Jesus Christ | `assets/characters/jesus-christ.png` | [Official wiki](https://southpark.cc.com/w/index.php/Jesus_Christ) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/celebrities/jesus.png) |
| Tuong Lu Kim | `assets/characters/tuong-lu-kim.png` | [Official wiki](https://southpark.cc.com/w/index.php/Tuong_Lu_Kim) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/adults/city-wok-guy.png) |
| Dr. Alphonse Mephesto | `assets/characters/dr-alphonse-mephesto.png` | [Official wiki](https://southpark.cc.com/w/index.php/Dr._Alphonse_Mephesto) | [PNG](https://images.paramount.tech/path/mgid:file:gsp:entertainment-assets:/sps/shared/characters/groups/mephesto_family_dr_alfonse_mephesto-revised.png) |

## Reproducing downloads

Run `python scripts/download-portraits.py`. It verifies PNG signatures, records failures, and caches successful downloads with hashes in `artifacts/portrait-sources/manifest.json`. Review the images before running `python scripts/connect-portraits.py`, which requires all 48 downloads to have succeeded.
