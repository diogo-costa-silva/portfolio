# Changelog

## [1.3.0] - 2026-06-09

Added a public **roadmap / wishlist** of ideas Diogo plans to build but hasn't
started yet (no repo).

### Added
- `data/roadmap.json` — second hand-edited, authored-and-canonical file (beside
  `overrides.json`): public ideas with `slug`/`title`/`problem`/`category`/`status`
  + optional `why`/`tags`/`horizon`/`target`/`link`/`weight`/`featured`/`visible`.
- `roadmapStatus` (`idea`/`planned`/`building`) and `horizon` (`next`/`later`/`someday`)
  vocabularies in `taxonomy.json`, kept separate from the project `status` enum.
- Roadmap validation in `npm run check`/`npm run sync` (slug regex, no dup slugs,
  required title/problem/category, vocab checks) + a **graduation warning** when a
  roadmap slug matches a live `portfolio` repo.
- `🔭 Roadmap — What's next` section in this repo's README (`build:portfolio-readme`),
  grouped by horizon with a status badge and no dead links.
- *Currently exploring: …* line on the profile README from `featured` ideas
  (`build:profile-readme`).
- Separate top-level `roadmap` array emitted into the live-site JSON
  (`build:webfolio-v1`), rendered as a follow-up by `webfolio-v1-vanilla`.

### Changed
- `docs/GUIDE.md` §4i + `docs/SCHEMA.md` document the roadmap workflow, fields, and
  the idea→project graduation flow (same slug = continuous identity).

## [1.2.0] - 2026-06-09

### Added
- `docs/DECISIONS.md` — decision record (the *why* behind the architecture).

### Changed
- Renamed `build:*` scripts to name their target: `build:v1`→`build:webfolio-v1`,
  `build:readme`→`build:portfolio-readme`, `build:profile`→`build:profile-readme`.
- Refined project overrides (taglines, tags, 5 featured) from the real repo READMEs.
- Canonicalized tag synonyms (`streamlit-webapp`→`streamlit`, `genai-chatbot`→`chatbot`).

## [1.1.0] - 2026-06-09

Made the `portfolio` repo a recruiter-facing GitHub vitrine, generated from the same
canonical data as the website and profile.

### Added
- `tools/adapter-portfolio-readme.mjs` — generates this repo's README showcase
  (featured + all projects by theme) between `<!-- PORTFOLIO -->` markers.
- `tools/lib.mjs` — shared rendering helpers for the README adapters.
- `npm run build:profile-readme` — featured table for the profile README.

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
