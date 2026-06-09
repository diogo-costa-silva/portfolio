# Portfolio Hub

Canonical, **website-agnostic source of truth** for my projects. One dataset feeds
every surface — the live site, future sites, and my GitHub profile README — so they
never drift out of sync.

## How it works

```
GitHub repos (topic: portfolio)        data/overrides.json (hand-authored)
        └──────────── scripts/sync.mjs (merge) ────────────┘
                              ▼
                  data/projects.json   ← canonical source of truth
                              ▼  adapters/
        ┌─────────────────────┼──────────────────────┐
   webfolio-v1-vanilla   profile README          future webfolios
   (live site)           (diogo-costa-silva)     (fetch the raw JSON)
```

- **Curation is opt-in:** a repo appears only if it carries the `portfolio` topic.
- **Enrichment** (narrative, theme, featured) lives in `data/overrides.json` — the
  only file edited by hand. Everything else is pulled from GitHub.
- **Generation** is automated weekly via `.github/workflows/sync.yml`, which opens a
  PR for review.

## Commands

```bash
npm run candidates   # list public repos + whether they'd be included
npm run sync         # regenerate data/projects.json
npm run check        # validate without writing
npm run build:v1 -- <site>/data/projects.json   # adapt to the live site schema
npm run build:readme                            # print profile README tables
```

## Docs

- **[GUIDE.md](GUIDE.md)** — complete operating guide: every workflow + command. Start here.
- **[SCHEMA.md](SCHEMA.md)** — canonical field reference (schema.org-aligned).
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — how to add/curate projects + taxonomy governance.
- **[data/taxonomy.json](data/taxonomy.json)** — controlled vocabularies (category, status).
