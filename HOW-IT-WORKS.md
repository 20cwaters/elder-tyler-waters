# How this website works

A complete reference for the Elder Tyler Waters mission site — what it is, what every file does,
how the weekly automation works, and how to change anything.

`README.md` is the short how-to. This is the full picture.

---

## Contents

1. [What it is](#1-what-it-is)
2. [A week in the life](#2-a-week-in-the-life)
3. [The pages](#3-the-pages)
4. [The data files](#4-the-data-files)
5. [Computed values — what the site works out on its own](#5-computed-values)
6. [The automation](#6-the-automation)
7. [Photos](#7-photos)
8. [The map](#8-the-map)
9. [Publishing](#9-publishing)
10. [Doing it by hand](#10-doing-it-by-hand)
11. [Cookbook](#11-cookbook)
12. [Troubleshooting](#12-troubleshooting)
13. [Setting one up for a different missionary](#13-setting-one-up-for-a-different-missionary)
14. [Gotchas](#14-gotchas)
15. [Credits and licensing](#15-credits-and-licensing)

---

## 1. What it is

A plain static website that follows Tyler through a two years mission in the Brazil Natal
Mission. It holds his weekly emails, his photos, the Portuguese he is learning, and a map of every
area he has served in.

Three things to understand up front:

**There is no build step and no server.** It is HTML, CSS, one JavaScript file, and three data
files. Open `index.html` in a browser and it works, offline, straight off the hard drive. Netlify
serves the repository root exactly as it sits.

**All the content lives in three files.** `data/mission.js`, `data/letters.js` and
`data/photos.js`. They are plain JavaScript that assigns a global object. There is no database, no
CMS, and no admin login. To change what the site says, you edit those files.

**It updates itself.** Mission Control reads Tyler's weekly email, writes it into those data
files, files and optimizes the photos, notices when he has been transferred, commits, and pushes.
Netlify deploys from the push. Nobody touches it.

Current state: **0 letters, 0 photos, 1 area.**

---

## 2. A week in the life

This is the loop the whole project exists to run.

```
P-day             Tyler writes home
     │
     ▼
                  Mission Control picks up the email
     │              · from tyler.waters@missionary.org
     │              · stops if there is nothing newer than the last letter on the site
     ▼
                  It reads the email and pulls out:
                    · the letter (title, date, week number, paragraphs, scripture blocks)
                    · the spiritual thought
                    · any Portuguese he explained
                    · the photo captions at the bottom
     ▼
                  It reads the email for life changes and edits data/mission.js:
                    · a new companion named
                    · a transfer to a new area (closes the old one, opens the new,
                      looks up coordinates)
                    · arrival in the field
     ▼
                  Photos: unzips whatever is in photos/_inbox/, matches each picture to
                  its caption by looking at the image, files them, then runs the optimizer
     ▼
                  node --check on all three data files. If any fails to parse it restores
                  the backup and stops.
     ▼
                  git add -A · git commit · git push origin main
     ▼
                  Netlify sees the push and redeploys. The site is live.
     ▼
                  You get a summary of what changed and what it was unsure about.
```

---

## 3. The pages

Seven pages, all sharing one header, footer and stylesheet. The navigation is built in JavaScript
from a single list in `assets/js/site.js`, so adding a page means adding one line there.

| File | Page | What it shows |
|---|---|---|
| `index.html` | Home | Hero with his name and mission, live counters (days out / days left / % complete) with a progress bar, the current area, the latest letter, recent photos, Portuguese corner, latest spiritual thought |
| `letters.html` | Letters | Every letter in full, newest first. Live search across titles, body text, Portuguese words and photo captions. Filter by location. Each letter shows that week's photos beneath it |
| `thoughts.html` | Spiritual Thoughts | Just the spiritual thought from each letter, pulled out on its own, plus an index of every scripture he has shared |
| `photos.html` | Photos | The full gallery, groupable by week or by place, with his captions and a keyboard-navigable lightbox |
| `map.html` | Where He Is | Google satellite map of his areas with a Street View panel, an area switcher, the current assignment card and a transfer timeline |
| `mission.html` | The Mission | About the mission, the mission boundary picture (`data/boundary.js`), the mission president (`mission.president`), and a plain-English FAQ about missionary life for people who have never known a missionary. The boundary and president are drawn by `assets/js/mission-extras.js` and stay hidden until there is something to show |
| `about.html` | About & Write Him | Facts about him, how to email or post to him, and the full Portuguese glossary |
| `admin.html` | *(unlisted)* | The manual paste-an-email tool. Not in the navigation, `noindex` |

### Supporting files

| File | Role |
|---|---|
| `assets/css/style.css` | The entire stylesheet. Design tokens live in `:root` at the top |
| `assets/js/site.js` | The shared engine — header, footer, date maths, letter rendering, photo grids, lightbox, language-word collection. Exposes everything on `window.MW` |
| `netlify.toml` | Tells Netlify to serve the repo root with no build, plus cache headers |
| `package.json` | Tooling only (the photo optimizer). The site itself has no dependencies |
| `automation/update-playbook.md` | The instructions the weekly update follows |
| `automation/optimize-photos.mjs` | The photo resizer |

---

## 4. The data files

All three are loaded with plain `<script>` tags before `site.js`, in this order: `mission.js`,
`letters.js`, `photos.js`. Each assigns one global.

### `data/mission.js` → `window.MISSION`

The facts about the mission. Six sections:

```js
missionary  firstName, lastName, title, fullName (computed), email,
            portrait, tagline, homeWard, farewellDate
mission     name, shortName, country, language, languageNative,
            presidentName, officeAddress[], mapCenter[lat,lng], mapZoom, boundsHint
dates       mtcStart, manilaMtcStart, fieldStart, release, transferLength
links       googlePhotos
maps        apiKey, defaultZoom, mapType
areas       [ ... ]   ← one entry per place he has served
```

**`dates`** drives every counter on the site:

| Field | Current value | What it does |
|---|---|---|
| `mtcStart` | `2023-10-08` | Day one. The countdown starts here |
| `manilaMtcStart` | `""` | A second MTC, if there is one (the key name is kept from the template). Powers a "days to" counter while it is in the future |
| `fieldStart` | `2023-11-24` | Switches the site from "Week N at the MTC" to the six-week transfer clock |
| `release` | `2025-09-22` | Homecoming. The countdown ends here |
| `transferLength` | `6` | Weeks per transfer |

**`areas`** is the list that drives the map, the timeline and the "right now" card. One object per
place, in order:

```js
{
  name: "Provo MTC",              // pin label and area-tab label
  region: "Provo, Utah, USA",     // grey subtitle
  type: "mtc",                    // "mtc" or "area" — MTC stops are left off the trail line
  start: "2023-10-08",            // arrival
  end: null,                      // null means "still here"
  lat: 40.259166,                 // pin position
  lng: -111.645602,
  zoom: 17,                       // optional, overrides maps.defaultZoom for this area
  companion: "",
  note: "",                       // free text shown on the card
  current: true                   // exactly ONE area may have this
}
```

`current: true` is the important one. It decides the yellow pin, where the map opens, the homepage
hero chip, the "Right now" card and the Where He Is page.

### `data/letters.js` → `window.LETTERS`

An array of letters. Order does not matter — the site sorts by date, newest first.

```js
{
  id: "2023-10-16-first-week",                   // unique; used for #anchors
  title: "First week",                           // the email subject
  date: "2023-10-16",                            // LOCAL send date, not the UTC timestamp
  location: "Provo MTC",                         // where he was when he wrote it
  week: 2,                                       // floor(days since mtcStart / 7) + 1
  albumUrl: "https://photos.app.goo.gl/...",
  body: [ ... ],                                 // see below
  spiritualThought: { title, intro, scriptureRef, scripture },
  tagalog: [ { word, meaning }, ... ],           // Portuguese words (key name kept from the template)
  photos: [ "2023-10-16-1", "2023-10-16-2" ]     // ids from photos.js
}
```

**`body`** is an array of blocks, so scripture can be rendered differently from prose:

```js
{ type: "p",         text: "Olá! This week..." }
{ type: "scripture", ref: "Alma 32:21", text: "21 And now as I said..." }
```

**`spiritualThought`** is what `thoughts.html` is built from. `scripture` holds the verses *or*,
when the thought is a testimony rather than a quotation, that paragraph. `scriptureRef` may be
empty. If a week genuinely has no spiritual content the fields are empty strings — the page skips it.

**`tagalog`** entries (Portuguese words, despite the key name) accumulate into the glossary on the
About page and the Portuguese corner on the homepage. Duplicates across weeks are de-duplicated
automatically.

### `data/photos.js` → `window.PHOTOS`

```js
{
  id: "2023-10-16-1",                  // must match an id in a letter's photos[]
  src: "photos/2023-10-16-1.jpg",      // lowercase .jpg, always
  date: "2023-10-16",
  caption: "His caption, word for word",   // his words, typos intact
  location: "Provo MTC",
  letterId: "2023-10-16-first-week"
}
```

The grid loads `photos/thumbs/<name>.jpg`; the lightbox loads `photos/<name>.jpg`. If a thumbnail
is missing the site falls back to the full image, and if that is missing too it shows a labelled
placeholder tile naming the file it wants. Nothing ever renders broken.

---

## 5. Computed values

Nothing time-related is typed in. `site.js` works it out on every page load from `dates` and
`areas`, which is why the counters are correct every day without anyone updating them.

`MW.status()` returns:

| Field | Meaning |
|---|---|
| `daysOut` / `daysLeft` | Days since `mtcStart` / until `release` |
| `percent` | Progress through the mission |
| `years` / `months` / `days` | The same span broken down |
| `area` | The area with `current: true` |
| `inMtc` | True while the current area is `type: "mtc"` |
| `mtcWeek` | Week number at the MTC |
| `transfer` / `transferWeek` | Transfer number and week within it, once `fieldStart` is set |
| `nextTransfer` | The date the next transfer falls on |
| `untilManila` | Days until `manilaMtcStart` (a second MTC), while it is still in the future |

Other things derived rather than stored: week numbers on letters, the Portuguese glossary, the
scripture index, photo grouping by week or place, the mission length wording on the Mission page,
and "last updated" in the footer.

---

## 6. The automation

### The task

| | |
|---|---|
| **Runs from** | Mission Control, once a week |
| **Reads** | Tyler's emails from `tyler.waters@missionary.org` |
| **Follows** | `automation/update-playbook.md` |
| **Last run** | Not yet — the site is new |

### The playbook

The real instructions live in [`automation/update-playbook.md`](automation/update-playbook.md),
which is read at the start of every run. **That file is the thing to edit if you want to change
its behaviour.** It is written in plain English and covers the guardrails, the extraction rules,
the change detection, the photo handling and the publish step.

### What it changes

- **`data/letters.js`** — adds the new letter at the top
- **`data/photos.js`** — adds that week's photo entries
- **`data/mission.js`** — only when he announces something: a new companion, a transfer, arrival
  in the field, the mission president's name, the office address
- **`photos/`** — files and optimizes the images
- **git** — commits and pushes, which deploys

### The guardrails

These are deliberate and worth knowing, because they explain why it sometimes leaves a field blank
rather than filling it in:

- **It never invents a fact.** Companion names, place names and dates go in only if Tyler states
  them. Anything implied but uncertain is left alone and raised in the report instead. A blank
  companion field is better than a wrong one.
- **It preserves his voice exactly.** Typos, slang, missing apostrophes — all kept. The only edits
  allowed are rejoining hard-wrapped lines into paragraphs and stripping the quote marks around
  pasted scripture.
- **It never deletes or rewrites existing entries.** It only adds.
- **It backs up first.** All three data files are copied to `data/.backup/` with a timestamp before
  any edit. If `node --check` fails afterwards, it restores and stops.
- **It never force-pushes.** If the remote has moved it rebases and retries; if that conflicts it
  stops and reports.
- **If authentication fails it stops** and leaves the commit in place for you to push by hand,
  rather than improvising.

### What it reports

After each run you get a short summary: which letter was added, any Portuguese words, **every
change made to `mission.js` stated plainly**, which photos were filed and how they were matched,
the optimizer's before/after sizes, anything it deliberately left alone, and whether the push
succeeded.

Read the "left alone" line. That is where it tells you it saw something ambiguous.

---

## 7. Photos

### The pipeline

```
his email ──► the pictures land in photos/_inbox/
                       │
                       ▼
              the update unzips, reads each image, and matches it to its caption
                       │
                       ▼
              photos/YYYY-MM-DD-N.jpg        (N = that caption's position in the letter)
                       │
                       ▼
              npm run optimize
                       │
                       ├─► photos/NAME.jpg          1600px, quality 80   (lightbox)
                       └─► photos/thumbs/NAME.jpg    500px, quality 72   (grid)
                       │
                       ▼
              originals moved to photos/_inbox/_filed/   (gitignored, never deleted)
```

### Getting the photos in

Mission Control saves each email's attachments into `photos/_inbox/`, and you can drop extra
pictures there from the dashboard. A zip is fine — it gets unzipped.

**Filenames and order do not matter.** The update opens each image and matches it to the caption
that describes it. Anything genuinely ambiguous falls back to file order and gets flagged.

### The optimizer

```bash
npm run optimize
```

Phone photos arrive at 3–8 MB each. Left alone, the homepage would push over 20 MB to every visitor
and two years of letters would grow the repo toward a gigabyte. The optimizer:

- resizes to a 1600px web version and a 500px thumbnail
- **bakes EXIF rotation into the pixels**, so a photo can never appear sideways in a viewer that
  ignores EXIF tags
- **strips metadata including GPS coordinates** — worth having off a public site full of pictures
  of where someone lives
- keeps untouched originals in `photos/_inbox/_filed/`
- skips anything already done, so it is safe to re-run

It needs the one dev dependency in `package.json`. If you move the project to a new machine, run
`npm install` once.

---

## 8. The map

`map.html` uses the Google Maps JavaScript API for real satellite imagery and Street View. It shows
a satellite map and a live Street View panorama side by side, linked — drag the orange pegman and
the panorama follows.

### The key

The key lives in `data/mission.js` under `maps.apiKey`. Google requires a billing account to issue
one, though a site this size stays inside the free tier and bills nothing.

The key is visible in the page source. That is normal and unavoidable for Google Maps, but it means
it **must** be restricted:

1. Google Cloud console → **Credentials** → your key
2. **Application restrictions → Websites**, and add your Netlify domain plus `http://localhost:*/*`
3. **API restrictions → Restrict key**, and tick only **Maps JavaScript API**

Without that, anyone can lift the key out of the page and run up usage on your billing account.

### Settings

| Setting | Effect |
|---|---|
| `maps.defaultZoom` | How close the map opens. 15 is a neighbourhood, 17 the default, 18 rooftops |
| `maps.mapType` | `hybrid` (satellite + labels), `satellite` (imagery only), `roadmap` |
| An area's `zoom` | Overrides `defaultZoom` for that one area |

### When it fails

The page never shows a dead grey box. Three states are handled:

- **No key** — a notice explaining where to paste one. The rest of the page still works
- **Key rejected** — a panel listing the likely causes in order: billing not enabled, Maps
  JavaScript API not switched on, key mistyped, or the current address missing from the website
  restrictions
- **No Street View coverage** — common in smaller towns. The panel says so and suggests dragging
  the pegman to a nearby road. The satellite view still works everywhere

Note that Google does not reliably call its own `gm_authFailure` callback for a bad key — it quietly
substitutes a static image instead. The page checks whether a real map actually painted and shows
the error panel itself.

---

## 9. Publishing

| | |
|---|---|
| **Repository** | `https://github.com/<github-user>/<repo>` |
| **Host** | Netlify (`https://<site>.netlify.app`), deploying from `main` |
| **Build** | None. `netlify.toml` sets `publish = "."` and an empty build command |

**Anything pushed to `main` is live within a minute or two.** The weekly update pushes on its own.
To publish a change you made by hand:

```bash
git add -A && git commit -m "What changed" && git push
```

### Cache headers

`netlify.toml` sets these deliberately:

- `/photos/*` — cached hard for a year. Photo filenames never change once written, so this is safe
- `/data/*.js` and `/*.html` — `must-revalidate`, never cached. Otherwise people would keep seeing
  last week's letter

### If Netlify is not linked yet

If the site was created by dragging the folder onto Netlify, it is not connected to GitHub and will
not auto-update. Site configuration → Build & deploy → Continuous deployment → **Link repository**,
pick `<github-user>/<repo>`, branch `main`.

---

## 10. Doing it by hand

The automation is the normal path, but nothing stops you editing directly.

### `admin.html` — the paste tool

Open it in a browser, paste an email, and it generates the `letters.js` and `photos.js` snippets for
you to copy in. It finds the album link, splits paragraphs, detects scripture blocks and normalizes
the reference, reads the trailing lines as photo captions, and harvests language words from his
`word (meaning)` pattern.

It is regex-based, so unlike the automation it cannot infer that "my new comp is Elder ..." means
the companion changed. It formats text; it does not understand it. Use it as the fallback when you
want to add a week yourself.

### Editing the data files directly

Perfectly fine. They are plain JavaScript. After editing, sanity-check them:

```bash
node --check data/letters.js
node --check data/photos.js
node --check data/mission.js
```

A missing comma is the usual mistake and `node --check` catches it instantly. The site will render
nothing at all if a data file fails to parse, so run this before pushing.

---

## 11. Cookbook

### He got transferred

In `data/mission.js`, close the old area and open the new one:

```js
// the area he is leaving
{ ..., end: "YYYY-MM-DD", current: false },

// the new one, appended to the end of the list
{
  name: "Area name",
  region: "Natal, Rio Grande do Norte",
  type: "area",
  start: "YYYY-MM-DD",
  end: null,
  lat: -5.795,
  lng: -35.209,
  companion: "",
  note: "",
  current: true
}
```

Coordinates: search the town on Google Maps, right-click the spot, and click the numbers at the top
of the menu to copy them. Sanity-check they land in the mission, around Rio Grande do Norte —
roughly latitude -4.8 to -7.0, longitude -38.6 to -34.9.

The automation does this for you when he announces a transfer.

### He has a new companion

Set `companion` on the area with `current: true`. That one field feeds the homepage chip, the
"Right now" card, the map pin popup and the timeline.

### Fix a typo in a letter

Edit the `text` of the relevant block in `data/letters.js`. Note that **his** typos are kept on
purpose — only fix transcription errors, not his writing.

### Add a photo to an existing letter

Add an entry to `data/photos.js` with the right `letterId`, add its `id` to that letter's `photos`
array, drop the file in `photos/`, and run `npm run optimize`.

### Change the countdown

Edit `dates.mtcStart` or `dates.release` in `data/mission.js`. Everything else follows, including
the "two years" wording on the Mission page.

### Change how the automation behaves

Edit `automation/update-playbook.md`. It is plain English and is read fresh every run.

---

## 12. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Whole site blank | A data file has a syntax error | `node --check data/*.js`, usually a missing comma |
| A photo shows a placeholder tile | The file is not in `photos/` under that exact name | The tile names the file it wants. Add it, run `npm run optimize` |
| Photo works locally, 404s live | Uppercase `.JPG` | Netlify is Linux and case-sensitive. Rename to lowercase |
| Photo is sideways | EXIF orientation not baked in | `npm run optimize` |
| Map shows "Google is not accepting the map key" | Billing, wrong API, or referrer restrictions | Work the checklist on the panel in order |
| Street View panel says no coverage | Google never drove there | Nothing to fix. Drag the pegman to a nearby road |
| No letter appeared this week | There was no new email, or the update did not run | Check Mission Control |
| Counters look wrong | `dates` is wrong | They are computed, never stored. Check `mtcStart` and `release` |
| Push failed in the report | Auth expired | The commit is still there. `git push` by hand |

---

## 13. Setting one up for a different missionary

The site is not hard-coded to one missionary. To stand up another one:

1. **Copy the repo** to a new folder and new GitHub repository.
2. **Rewrite `data/mission.js`** — name, mission, language, dates, the first area (usually the Provo
   MTC), and the Google Photos album link. Keep `maps.apiKey` empty until you have one.
3. **Empty the content.** `data/letters.js` becomes `window.LETTERS = [];` and `data/photos.js`
   becomes `window.PHOTOS = [];`. Delete everything in `photos/` except the folder.
4. **Add a portrait** at `photos/<name>.jpg` and point `missionary.portrait` at it.
5. **Check the copy that is specific to this mission.** `mission.html` has three paragraphs describing
   the mission and FAQ copy about the MTC path. Both need rewriting for a different mission.
6. **Deploy** — new Netlify site linked to the new repository.
7. **Set up the automation** — point Mission Control at the new folder, with the missionary's
   own email address. Update `automation/update-playbook.md` with the name, mission, dates and the
   geographic sanity-check bounds.
8. **Get a Maps key** for the new site, restricted to its domain.

The parts that are genuinely reusable without edits: all seven pages, the stylesheet, `site.js`, the
optimizer, `netlify.toml` and `admin.html`.

The parts that need rewriting per mission: `mission.js`, the regional paragraphs and FAQ in
`mission.html`, and the playbook's context section.

---

## 14. Gotchas

Things worth knowing so they do not bite.

**Netlify is case-sensitive, Windows is not.** `tyler.JPG` works perfectly on your machine and
404s in production. Always lowercase `.jpg`.

**Gmail timestamps are UTC.** An email stamped just after midnight UTC may have been sent the
evening before, local time. Using the UTC date puts letters on the wrong day and throws the week
number off by one.

**Brand yellow fails contrast on white.** The flag yellow `#fedd00` on white is about 1.3:1 — fine
for the progress bar, pins and ornaments, far too low for text. Text uses the darker `#7a6200`
(`--gold-text`), and the flag green used for buttons is darkened to `#00733a` so white text on it
passes.

**The data files must parse or nothing renders.** There is no partial failure mode. One missing
comma blanks the whole site. `node --check` before pushing.

**Only one area may have `current: true`.** Two will confuse the map and the counters.

**`git add -A` sweeps everything.** That is why `brag-output/` and `brag-ad/` are gitignored —
megabytes of video would otherwise land in the public repo automatically.

**Google deprecated the Photos API for this use.** The read scopes were removed on 31 March 2025, so
there is no way to pull his shared album onto the site directly. Self-hosting the photos is not a
workaround, it is the only option — and it is more durable anyway, since the site keeps working if
the album is ever deleted.

---

## 15. Credits and licensing

**Photographs and letters** are Tyler's own. Captions are his words, unedited.

**Fonts** — Sora (headings) and DM Sans (body), both from Google Fonts, both open licensed.

**Map** — Google Maps JavaScript API, satellite imagery and Street View.

**Photo tooling** — [sharp](https://sharp.pixelplumbing.com/), the only dependency.

---

*Last reviewed 12 November 2026 — 0 letters, 0 photos, 1 area. New site, not yet deployed.*
