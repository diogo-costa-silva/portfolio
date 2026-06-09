# Changelog

## [1.0.0] - 2026-06-09

Repurposed `portfolio` from a hand-maintained README into the canonical,
website-agnostic portfolio data hub.

### Added
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
