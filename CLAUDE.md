# CLAUDE.md — portfolio hub

This repo is the **canonical, website-agnostic source of truth** for Diogo's projects.
One dataset feeds the GitHub profile README, this repo's README vitrine, and the live
website — so they never drift.

## Golden rules
- ✅ Edit **only** two things: **GitHub repo topics** and **`data/overrides.json`**.
- 🚫 Never hand-edit `data/projects.json`, the generated block between the
  `<!-- PORTFOLIO -->` markers in `README.md`, or the `diogo-costa-silva.github.io`
  repo (it's overwritten on every deploy).
- A project shows up **only** if its repo carries the `portfolio` topic (opt-in).
- `category`/`status` are validated against `data/taxonomy.json`; `tags` are free-form.

## Edit projects (the flow)
```bash
# ADD:    gh repo edit diogo-costa-silva/<repo> --add-topic portfolio
#         + add a "<repo>": {...} entry to data/overrides.json
# EDIT:   change that entry in data/overrides.json
# REMOVE: set "visible": false  OR  gh repo edit … --remove-topic portfolio
npm run sync            # rebuild data/projects.json (+ npm run check to validate)
npm run build:portfolio-readme    # rebuild this repo's README vitrine
```
The weekly Action also does this and opens a PR. To publish to the other surfaces:
`npm run build:webfolio-v1 -- <site>/data/projects.json` and
`node tools/adapter-profile-readme.mjs --write <profile-README>`.

## Docs
- **docs/GUIDE.md** — every workflow + command (start here).
- **docs/DECISIONS.md** — why the architecture is the way it is.
- **docs/SCHEMA.md** — canonical field reference.
- **docs/CONTRIBUTING.md** — curation + taxonomy governance.

## Live deploy chain
`webfolio-v1-vanilla` → `deploy-from-source.yml` → `diogo-costa-silva.github.io` →
Pages → https://diogo-costa-silva.github.io. The `webfolio` (terminal) repo is archived.
