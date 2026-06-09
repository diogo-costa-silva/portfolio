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

## Surfaces (renderers)

The same canonical data feeds every surface via adapters — never duplicate it:

| Surface | Command |
|---|---|
| this repo's README (GitHub vitrine) | `npm run build:readme` |
| webfolio-v1-vanilla (live site) | `npm run build:v1 -- <site>/data/projects.json` |
| profile README (diogo-costa-silva) | `node tools/adapter-profile-readme.mjs --write <README.md>` |

The profile README needs the markers `<!-- PORTFOLIO:START -->` /
`<!-- PORTFOLIO:END -->` where the tables should be injected.
