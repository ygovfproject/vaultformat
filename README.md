# Vault Format Web

The public website for Vault Format, a fixed-format Yu-Gi-Oh! with premade decks. Built with Next.js (App Router) and Material UI, and published as a static site on GitHub Pages.

The site holds **no content of its own**. Decks, card images and texts, covers and the `.json`/`.md` files live on a **file server**: the private admin repo (`dmf_admin`), which also has the admin pages for adding and editing all of it. Every page loads its content from there in the browser, on every visit, so content changes show up right away without rebuilding this site.

## Run locally

1. Start the file server: in `dmf_admin`, `npm run dev -- -p 3002`
2. In this repo, copy `.env.example` to `.env` (it points at `http://localhost:3002/`)
3. Run the site:

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site -> out/
npm run preview    # serve out/ on http://localhost:4173
```

`.env` is not committed. `FILE_SERVER` is built into the site, so restart `npm run dev` (or rebuild) after changing it.

## How pages load

- **Loading screen:** on the first visit a loading screen covers the page (the header stays visible) until its content is in. When moving between pages inside the site the page changes right away, and the screen only fades in if the new page takes longer than 0.15 s to load. Once shown it stays up at least 0.3 s, so it never just flickers.
- **What a page waits for:** only what it needs to show itself.
  - Home page: `philosophy.md`. The hero cards start face-down and flip up as soon as the card list and their images are in; with no decks there are no cards. The boss row and the update note appear when they're loaded.
  - Decks: the deck list. Each tile's tags (Ritual, Fusion, Synchro, Xyz, Link, Spellform: shown when the deck plays 3 or more such cards, or when its boss is one; plus Main engine, listed first, when the boss is a Main Deck monster) fill in as the card texts load; the tag filters appear once all are in.
  - Deck page and Errata: the deck lists. Card images load as they appear; card texts load in the background (a card opened early says "Loading card text…").
- **File server down:** visitors land on the 500 page ("The deck slipped") with a **Try again** button that reloads the page they were on.
- **Deck page address:** `/deck/?d=<deck_id>` (the static site can't have one page per deck, since decks are only known on the file server).

## What the site expects on the file server

| What | Path |
| --- | --- |
| Main page / Rules / Errata intro | `content/philosophy.md`, `content/rulings.md`, `content/errata.md` |
| Decks and updates | `content/decks.json`, `content/updates.json`, `content/updates/<id>.md` |
| Deck lists | `decks/<deck_id>.ydk` |
| Card images and data | `cards/<card_id>.jpg`, `card_texts/<card_id>.json` |
| Deck covers | `covers/<card_id>.jpg`, `covers/crops/<deck>--<card>-<x>-<y>-<size>.jpg` |

The file server must allow other sites to read these files (CORS); `dmf_admin` does. Cards with ids `900000000`-`900009999` are **Vault Format errata**; the Errata page lists every one used in a deck.

Pages with nothing to show yet say so instead of showing an empty page: Decks and Errata with no decks, Errata with no errata cards.

## Content formats

**Home page (`content/philosophy.md`):**

- `# Title` and the text before the first `##`: the hero at the top; `> ...` lines there are the tagline (`<br>` breaks a line)
- each `## Heading`: its own block, laid out by what it holds:
  - with `### Point` headings inside: the points side by side; each gets an icon picked from words in its heading
  - a heading with "boss" in it: the bright band with a row of 6 random decks' boss cards
  - anything else: heading over text
- a closing "Pick a deck" block is added after the last one
- `**bold**`: bold, in the text colour

**Rules (`content/rulings.md`, shown at `/rules/`):**

- `# Title`, an intro, then one `## n. Section` per section (shown in the Contents list)
- rules start with a bold number on its own, `**2.5** ...` (a title goes in its own bold: `**3.3** **The mulligan.**`); the number becomes a link to the rule, and any `§2.5` or `§6` in the text becomes a link to that rule or section
- `Version 1.2` line: shown under the PDF button; add a date to show it there too: `Version 1.2 · 04.11.2026`

**Card data (`card_texts/<card_id>.json`):** shown above the card text in the card panel.

- all cards: `id`, `name`, `type` (`Monster`, `Spell`, `Trap`), `desc` (the card text)
- monsters: `attribute`, one of `level` / `rank` (Xyz) / `linkRating` (Link, shown as `LINK-2`), `typeline` (e.g. `["Reptile", "Tuner", "Effect"]`), `atk`, `def` (a number or `"?"`; Link monsters have no `def`)
- Spells and Traps: `property` (`Normal`, `Continuous`, `Quick-Play`, ...)
- in `desc`, a line of only dashes (`---`) is shown as a divider, e.g. between a Spellform card's spell and monster effects; errata keep their `~Vault Format erratum~` line there

**Update notes (`content/updates/<id>.md`):** `[decks]` becomes the update's decks (small chips, each linking to the deck), `[n]` the number of them.

**Deck boss (`boss` in `decks.json`, optional):** the card id of the deck's boss monster, shown in the home page's boss row and used for the deck's tags. The boss comes only from this field: a deck without it has no boss (the cover card is not used instead).

**Rules PDF:** the Rules page's **Download rules** button turns `rulings.md` into a PDF in the browser, named `Vault_Format_rules_<version>.pdf` from the `Version 1.0` line. Change that line when the rules change.

**New tag and update note:** decks from the **latest** update show **New** for 30 days after its date, and the Main page shows a note about that update for the same 30 days. Neither shows while there's only one update.

## Project layout

| Where | What |
| --- | --- |
| `src/app/` | the routes: `/`, `/decks`, `/deck`, `/errata`, `/rules`, `/updates`, `/server-error` (the 500 page), 404; `/rulings` forwards to `/rules` |
| `src/components/pages/` | each page's loader (fetches from the file server, then renders the view) |
| `src/components/` | views and shared pieces (`LoadingScreen`, `Decor`, `Markdown`, cards, decks) |
| `src/lib/fileServer.ts` | all file server access |
| `src/lib/` | content parsing: decks, updates, deck lists, errata, rules PDF |
| `public/` | site assets only: `back.jpg` (card back), `brand/` (logo), `og/` (link preview images, see `scripts/og/`), `.nojekyll` |

Content folders under `public/` are in `.gitignore`, so card images and texts can't end up in this repo by accident.

## Publish

Push to `master`. The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages. One-time setup:

- **Settings > Pages > Source**: **GitHub Actions**
- **Settings > Secrets and variables > Actions > Variables**: add `FILE_SERVER` with the file server's public URL (the hosted admin repo). With a custom domain, also add `SITE_URL` (the site's full address), which link previews need; otherwise it's worked out from the GitHub Pages address.

The build doesn't contact the file server, so it can't fail because the file server is down. Content changes don't need a rebuild; rebuild only when the site's code changes or `FILE_SERVER` moves.
