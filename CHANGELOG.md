# Changelog

## [1.2.0] - 2026-06-09

### Added
- `docs/DECISIONS.md` — decision record (the *why* behind the architecture).

### Changed
- Refined project overrides (taglines, tags, 5 featured) from the real repo READMEs.
- Canonicalized tag synonyms (`streamlit-webapp`→`streamlit`, `genai-chatbot`→`chatbot`).

## [1.1.0] - 2026-06-09

Made the `portfolio` repo a recruiter-facing GitHub vitrine, generated from the same
canonical data as the website and profile.

### Added
- `tools/adapter-portfolio-readme.mjs` — generates this repo's README showcase
  (featured + all projects by theme) between `<!-- PORTFOLIO -->` markers.
- `tools/lib.mjs` — shared rendering helpers for the README adapters.
- `npm run build:profile` — featured table for the profile README.

### Changed
- `README.md` is now the generated GitHub vitrine (was the system doc; system docs
  live in `GUIDE.md`/`SCHEMA.md`/`CONTRIBUTING.md`).
- `adapter-profile-readme.mjs` now emits the **featured** subset + links (not the full list).
- Engine relocated to `tools/` (`scripts/` + `adapters/` merged) for a cleaner repo root.
- Docs (`GUIDE`, `SCHEMA`, `CONTRIBUTING`) moved to `docs/` — root now holds only the
  showcase README + data/tools/docs.
- `sync.yml` now also rebuilds the README showcase and includes it in the PR.

## [1.0.0] - 2026-06-09

Repurposed `portfolio` from a hand-maintained README into the canonical,
website-agnostic portfolio data hub.

### Added
- `GUIDE.md` — complete operating guide (all workflows + commands).
- Tag audit mode (`npm run tags`) to surface synonym noise.
- `scripts/sync.mjs` — zero-dependency engine that merges GitHub repo metadata
  (repos with the `portfolio` topic) with `data/overrides.json` into the canonical
  `data/projects.json`. Modes: default, `--candidates`, `--check`.
- `data/taxonomy.json` — closed controlled vocabularies (category, status) with
  display metadata and category precedence.
- `data/overrides.json` — hand-authored enrichment, seeded for 8 real projects.
- `adapters/to-v1-vanilla.mjs` — canonical → live-site schema.
- `adapters/to-profile-readme.mjs` — canonical → Markdown tables grouped by theme.
- `SCHEMA.md` — schema.org-aligned field reference.
- `CONTRIBUTING.md` — curation workflow + taxonomy governance rules.
- `.github/workflows/sync.yml` — weekly + manual sync that opens a PR.

### Changed
- `README.md` rewritten to document the hub (was a stale, hand-edited project list
  with broken links).

### Removed
- Old hand-maintained project tables (rotted: broken links, duplicated descriptions).
