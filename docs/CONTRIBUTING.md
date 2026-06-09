# Contributing / Maintenance

This repo is the canonical hub for the portfolio. The data is **generated** — you
never hand-edit `data/projects.json`. You edit repos on GitHub and `overrides.json`.

## Add a project to the portfolio

1. **Tag the repo** on GitHub with the `portfolio` topic (opt-in inclusion):
   ```bash
   gh repo edit diogo-costa-silva/<repo> --add-topic portfolio
   ```
   Add real ecosystem tech topics too (`python`, `react`, `streamlit`, …) — they
   feed `tags` **and** GitHub discoverability.
2. **Enrich** it in `data/overrides.json`, keyed by the repo name (= `slug`):
   ```json
   "<repo>": {
     "title": "Nice Title",
     "tagline": "One line of what it does",
     "description": "A short paragraph.",
     "category": "data-analytics",
     "tags": ["python", "pandas"],
     "featured": false,
     "weight": 0
   }
   ```
   `category` is **required** and must exist in `taxonomy.json`.
3. **Generate**:
   ```bash
   npm run sync          # rebuild data/projects.json
   npm run check         # validate without writing
   ```

`npm run candidates` lists every public repo and whether it would be included.

## Remove / hide a project

- Drop it from the site but keep the repo public → set `"visible": false` in the override.
- Remove it entirely → `gh repo edit <repo> --remove-topic portfolio`.

## Project without a public repo (manual entry)

Add an override with `"source": "manual"` and a custom slug; provide its own
`links`/`media`. It is included without any GitHub repo behind it.

## Choosing a `category`

Pick by **what the project delivers**, not the tech it uses (tech → `tags`).
A Streamlit app serving an ML model is `machine-learning`; `streamlit` is a tag.

**Overlap tie-breaker** (most specific value wins), per `taxonomy.json#categoryPrecedence`:
`ai-apps > machine-learning > data-engineering > data-analytics > backend > web > devops > automation`

## Governance: adding a new `category`

A new category is justified **only** when it is a recurring *delivery type* with
**≥3 expected projects** that does not fit any existing category. Otherwise use a
`tag`. This keeps the taxonomy small and stable. Edit `data/taxonomy.json`
(`categories` + `categoryPrecedence`) and document the addition here.

## Roadmap curation

`data/roadmap.json` is hand-authored — public ideas with no repo yet (schema in
`SCHEMA.md`). Curate it tightly:

- **Keep it short** — 3–6 items. A roadmap of 20 ideas signals nothing; a roadmap of
  four signals judgment.
- **Frame by the `problem`**, not a cool name. Every item earns its place by the pain
  it solves; `title` is secondary.
- **Never attach a dead link.** `link` is for an issue/discussion that *describes* the
  idea — never a demo/repo URL that 404s. No link is better than a broken one.
- **Use horizons, not dates.** Reach for `horizon` (`next`/`later`/`someday`); use
  `target` only as a soft, literal hint (e.g. `"Q3 2026"`), never a hard deadline.
- **Feature sparingly.** Mark only **1–3** items `featured` — those surface on the
  profile README "Currently exploring" line.

### Graduating an idea

When an idea becomes real (you start building it), graduate it off the roadmap:

1. Create the repo **named exactly the `slug`**.
2. `gh repo edit diogo-costa-silva/<slug> --add-topic portfolio` and add its
   `overrides.json` entry (see "Add a project" above).
3. Remove the item from `data/roadmap.json`.

`npm run sync` **warns** when a roadmap `slug` matches a live `portfolio` repo — that
warning is your reminder to finish the move.

### Governance: roadmap vocabularies

`roadmapStatus` and `horizon` are controlled vocabularies in `taxonomy.json`, kept
separate from the project `status` enum. Treat them like `categories`: add a value
**only** when an existing one genuinely can't carry the meaning, and document it here.

## Surfaces (renderers)

The same canonical data feeds every surface via adapters — never duplicate it:

| Surface | Command |
|---|---|
| this repo's README (GitHub vitrine) | `npm run build:portfolio-readme` |
| webfolio-v1-vanilla (live site) | `npm run build:webfolio-v1 -- <site>/data/projects.json` |
| profile README (diogo-costa-silva) | `node tools/adapter-profile-readme.mjs --write <README.md>` |

The profile README needs the markers `<!-- PORTFOLIO:START -->` /
`<!-- PORTFOLIO:END -->` where the tables should be injected.
