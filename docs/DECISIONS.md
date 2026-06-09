# Decision Record

The essential decisions behind this portfolio system, and *why*. `GUIDE.md` covers
*how to use it*; this covers *why it is the way it is*. Read before changing the
architecture.

Context: the goal is that everything public on my GitHub that's worth showing is the
same portfolio across my GitHub profile, a personal website, and any future website —
one source of truth, minimal maintenance.

---

### D1 — Canonical source of truth is website-agnostic data, not a README
`data/projects.json` (structured data) is the source of truth. A README is a
*rendering*, not a source — Markdown can't feed a React site. **Why:** lets one dataset
feed today's site, the profile, and any future webfolio (different stack) without
drift. Field names align with schema.org so future sites can emit JSON-LD for free.

### D2 — Combined hub (data + tooling in one `portfolio` repo), `data/` kept split-ready
The `portfolio` repo holds the canonical data, the generator (`tools/`), and the
generated showcase README. **Why:** data and tooling share one lifecycle (every data
update is a tooling run). Splitting would add cross-repo PAT plumbing — the most
rot-prone part — for no current benefit (YAGNI). `data/` is kept self-contained so a
future split is a 10-min `git filter-repo` if a real need appears.

### D3 — Curation is opt-in via the GitHub topic `portfolio`
A repo appears only if it carries the `portfolio` topic. **Why:** explicit control over
what's shown ("o que faz sentido"), and per-repo metadata (topics, homepage) that the
sync needs. Hand-maintained allow-lists rot.

### D4 — Repo-per-project; theme is a field (`category`), never a repo boundary
Each substantial project is its own repo; drills go to a sandbox or are skipped.
Grouping by theme is a `category` field, not a monorepo. **Why:** repos give pins,
URLs, topics, homepage, stars — a monorepo folder gives none, and the sync maps a card
1:1 to a repo. Theme is a rendering concern.

### D5 — `overrides.json` is the only hand-edited file; everything else is derived
Narrative/curation (title, tagline, category, featured, weight) lives in
`overrides.json`, keyed by repo slug. The rest comes from GitHub. **Why:** one place to
edit; the machine fills the rest; no duplicated truth.

### D6 — Every index is generated, never hand-written
The website JSON, the `portfolio` README vitrine, and the profile featured block are
all generated from the canonical data. **Why:** the old hand-written `portfolio` README
rotted (broken links, duplicated descriptions). Generation kills drift permanently.

### D7 — Automation opens a PR, it does not auto-commit
The weekly Action regenerates data + README and opens a PR for review. **Why:**
keep a human in the loop exactly where the machine is weak (curation/narrative);
automate the mechanical rest.

### D8 — Zero runtime dependencies
The engine uses Node's built-ins (fetch, fs) only. **Why:** no `npm install`, no
supply-chain surface, durable over years of low-touch maintenance.

### D9 — Controlled vocab for `category`/`status`; free-form `tags` with an alias map
`category`/`status` are validated against `taxonomy.json` (sync fails on unknowns);
`tags` are free-form (overrides + topics + language) canonicalized via `TAG_ALIASES`.
**Why:** consistent grouping where it matters, flexibility for tech tags, no silent typos.

### D10 — Docs in `docs/`, README is the generated recruiter vitrine
System docs (GUIDE/SCHEMA/CONTRIBUTING/DECISIONS) live in `docs/`; the root README is
the generated showcase. **Why:** the `portfolio` repo is pinned and is the profile's
"All projects" target — its README must be a vitrine for recruiters, not a system doc.

### D11 — Roadmap (unstarted ideas) is a separate hand-authored canonical file, not a project status
Ideas I plan to build but haven't started (no repo yet) live in `data/roadmap.json`, a
second hand-edited file alongside `overrides.json`. It is itself the source of truth —
there's no GitHub repo to sync from, so the file is authored, not generated; `sync`/`check`
validate it but never overwrite it. This is the deliberate exception to D5 and D6. **Why:**
building a full input→output pipeline for a 6-item hand list is YAGNI when the idea *is* the
input. `roadmapStatus` (idea/planned/building) and `horizon` (next/later/someday) are
separate vocabs in `taxonomy.json`, kept apart from the project `status` enum so a roadmap
state can never leak into a real project. `projects.json` is untouched — ideas never enter
the canonical list; each surface opts in to rendering roadmap (README vitrine section,
profile "Currently exploring" line, a top-level `roadmap` array for the live site), so there
is zero leak. **Graduation:** when an idea ships you create the repo (named = the idea's slug),
add the `portfolio` topic + an overrides entry; `sync` then warns that a live repo matches a
roadmap slug → you delete the item. The stable slug gives one continuous idea→built identity.

---

## System map

```
GitHub repos (topic: portfolio) + data/overrides.json
        └── tools/sync.mjs ──▶ data/projects.json (canonical)
                                   └── tools/adapter-* ──▶ README vitrine
                                                        ──▶ profile README featured
                                                        ──▶ webfolio-v1-vanilla (live site)
data/roadmap.json (authored, canonical) ──▶ validated by sync, never generated; each surface opts in
```

- **Live deploy chain:** `webfolio-v1-vanilla` → its `deploy-from-source.yml` → copies
  into `diogo-costa-silva.github.io` → `static.yml` → GitHub Pages →
  https://diogo-costa-silva.github.io. Never hand-edit `.github.io`.
- **`webfolio` (terminal redesign) is archived** — it had no deploy and caused naming
  confusion. The live source is `webfolio-v1-vanilla`.

## Manual-only (no API)

Pinning repos on the GitHub profile has no API — set the 6 pins in the UI.
