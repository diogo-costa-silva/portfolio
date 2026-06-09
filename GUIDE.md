# Portfolio System — Complete Operating Guide

Everything you need to use and maintain this system long-term. If you read one file,
read this one. (Field-level details live in [SCHEMA.md](SCHEMA.md); rules in
[CONTRIBUTING.md](CONTRIBUTING.md).)

---

## 1. Mental model (read once)

The portfolio is **one dataset, many surfaces**. You curate on GitHub + one JSON file;
everything else is generated.

```
        YOU EDIT                          GENERATED (never hand-edit)
 ┌────────────────────┐
 │ GitHub repo topics │──┐
 │  (topic: portfolio)│  │   scripts/sync.mjs        ┌─────────────────────────┐
 ├────────────────────┤  ├──────────────────────────▶│ data/projects.json      │
 │ data/overrides.json│──┘   (merge + validate)      │ = canonical source      │
 └────────────────────┘                              └───────────┬─────────────┘
                                                    adapters/     │
                            ┌───────────────────────────┬─────────┴──────────────┐
                            ▼                           ▼                         ▼
                   webfolio-v1-vanilla          profile README            future webfolios
                   (live site, auto-deploys)    (diogo-costa-silva)       (fetch raw JSON)
```

**Golden rules**
1. ✅ You edit **only** two things: **GitHub repo topics** and **`data/overrides.json`**.
2. 🚫 Never hand-edit `data/projects.json`, the `repo.*` block, or `diogo-costa-silva.github.io` (it's overwritten on every deploy).
3. A project appears **only** if its repo has the `portfolio` topic (opt-in curation).
4. `category` is controlled vocab (validated). `tags` are free-form (keep them clean — see §7).

---

## 2. Setup / prerequisites (one-time per machine)

```bash
node --version          # need >= 18 (you have 24)
gh auth status          # must be logged in as diogo-costa-silva
cd ~/Projects/portfolio # the hub repo
```
No `npm install` needed — the engine has zero dependencies.

---

## 3. Command cheat-sheet

| Command | What it does |
|---|---|
| `npm run candidates` | List every public repo + whether it would be included |
| `npm run sync` | Regenerate `data/projects.json` from GitHub + overrides |
| `npm run check` | Validate overrides/taxonomy **without writing** |
| `npm run tags` | Audit all distinct tags + counts (spot synonyms) |
| `npm run build:v1 -- <site>/data/projects.json` | Adapt canonical → live-site schema |
| `npm run build:readme` | Print profile README tables (stdout) |
| `node adapters/to-profile-readme.mjs --write <README.md>` | Inject tables into a README |

Raw engine flags: `node scripts/sync.mjs [--candidates\|--tags\|--check]`.

---

## 4. Core workflows

### 4a. Add a new project ⭐ (the main one)

```bash
# 1. Tag the repo (opt-in). Add real tech topics too — they feed tags + GitHub search.
gh repo edit diogo-costa-silva/<repo> --add-topic portfolio
gh repo edit diogo-costa-silva/<repo> --add-topic python --add-topic streamlit

# 2. (recommended) set the repo's About + homepage on GitHub — they become tagline + demo
gh repo edit diogo-costa-silva/<repo> --description "One line" --homepage "https://demo-url"

# 3. Enrich in data/overrides.json, keyed by repo name:
#    { "<repo>": { "title": "...", "tagline": "...", "description": "...",
#                  "category": "data-analytics", "tags": ["python"], "featured": false, "weight": 0 } }

# 4. Generate + validate
npm run sync
npm run check
```
If you tag a repo but forget the override, `sync` flags it *needs enrichment* and
excludes it until you add the entry.

### 4b. Edit an existing project
Edit its entry in `data/overrides.json` → `npm run sync`. That's it. Override fields
always win over GitHub-derived ones (e.g. set `"demo"` to override the repo homepage).

### 4c. Hide or remove a project
- **Hide** (keep repo public, drop from site): set `"visible": false` in the override.
- **Remove** entirely: `gh repo edit diogo-costa-silva/<repo> --remove-topic portfolio`.
- Either way → `npm run sync`.

### 4d. Project with no public repo (manual entry)
Add an override with a custom slug and `"source": "manual"`, plus its own `links`/`media`:
```json
"my-talk-2026": {
  "source": "manual", "title": "Conf Talk", "tagline": "...", "category": "data-analytics",
  "tags": ["talk"], "links": { "repo": null, "demo": "https://slides..." }, "image": "..."
}
```

### 4e. Feature / reorder
- `"featured": true` → the surface can highlight it.
- `"weight": <n>` → sort within its category (higher first). Ties break by repo update date.

### 4f. Add a new category (governance)
Only when it's a recurring **delivery type** with ≥3 expected projects that fits nowhere.
Otherwise use a tag. Edit `data/taxonomy.json` (`categories` + `categoryPrecedence`),
document it in CONTRIBUTING.md, then `npm run sync`. Picking a category → choose by
**what the project delivers**, not its tech (tech → tags).

### 4g. Clean up tags
```bash
npm run tags          # see all distinct tags + counts
```
Spot synonyms (e.g. `streamlit-webapp` vs `streamlit`). Fix either by editing the
project's `tags` in overrides, or add a global rule to `TAG_ALIASES` in
`scripts/sync.mjs` (e.g. `"streamlit-webapp": "streamlit"`), then `npm run sync`.

### 4h. Renaming a repo
The `slug` = repo name. If you rename the repo on GitHub, rename its key in
`overrides.json` to match, or the override silently stops applying. `npm run check`
will flag the orphaned-by-rename repo as *needs enrichment*.

---

## 5. Publishing workflows

### 5a. Publish to the live site (manual — recommended to start)
The live site is `webfolio-v1-vanilla` → auto-deploys to `.github.io` → Pages.
```bash
# clone the site once if you haven't:
#   git clone https://github.com/diogo-costa-silva/webfolio-v1-vanilla ~/Projects/webfolio-v1-vanilla
npm run build:v1 -- ~/Projects/webfolio-v1-vanilla/data/projects.json
cd ~/Projects/webfolio-v1-vanilla
git checkout -b update-projects && git add data/projects.json
git commit -m "chore: update projects from portfolio hub" && git push -u origin update-projects
# open a PR; on merge to main, deploy-from-source.yml publishes to Pages automatically.
```
Never edit `diogo-costa-silva.github.io` directly — it's the deploy target.

### 5b. Update the GitHub profile README
One-time: add these two markers in `diogo-costa-silva/README.md` where the project
list should go:
```html
<!-- PORTFOLIO:START -->
<!-- PORTFOLIO:END -->
```
Then regenerate anytime:
```bash
node adapters/to-profile-readme.mjs --write ~/Projects/diogo-costa-silva/README.md
```

### 5c. Automated weekly sync (the hub's own Action)
`.github/workflows/sync.yml` runs Mondays 06:00 UTC (and on manual dispatch). It
regenerates `data/projects.json` and **opens a PR** if anything changed — you review
and merge. Trigger manually:
```bash
gh workflow run "Sync portfolio"
```
It reads public repos with the default token. To also read private repos/topics
reliably, create a fine-grained PAT (read-only `contents`+`metadata`) and add it as
the repo secret `PORTFOLIO_PAT`:
```bash
gh secret set PORTFOLIO_PAT --repo diogo-costa-silva/portfolio
```

---

## 6. End-to-end example: "I built a new project today"

```bash
# you just pushed github.com/diogo-costa-silva/crime-map (a Leaflet crime heatmap)
gh repo edit diogo-costa-silva/crime-map --add-topic portfolio --add-topic react --add-topic leaflet
gh repo edit diogo-costa-silva/crime-map --homepage "https://crime-map.vercel.app"

# add to data/overrides.json:
#   "crime-map": { "title": "Crime Map", "tagline": "Heatmap of city crime",
#                  "description": "...", "category": "web", "tags": ["react","leaflet"],
#                  "featured": true, "weight": 7 }

cd ~/Projects/portfolio
npm run sync && npm run check                 # canonical updated + valid
npm run build:v1 -- ~/Projects/webfolio-v1-vanilla/data/projects.json   # → live site
node adapters/to-profile-readme.mjs --write ~/Projects/diogo-costa-silva/README.md   # → profile
# commit/push each repo; sites auto-deploy. Done.
```

---

## 7. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Repo doesn't appear after sync | Missing `portfolio` topic → `gh repo edit … --add-topic portfolio`. Check with `npm run candidates`. |
| `⚠ … needs enrichment` | Repo tagged but no `overrides.json` entry → add one. |
| `✖ unknown category "x"` | Category not in `taxonomy.json` → fix typo or add per §4f. |
| `✖ unknown status` | Use `wip\|active\|completed\|archived`. |
| `✖ No auth` | `gh auth login`, or set `GITHUB_TOKEN`. |
| Override seems ignored | Key must equal the repo name exactly (case-sensitive). See §4h. |
| Tags look messy | `npm run tags` → alias or trim (see §4g). |
| Live site unchanged after merge | Check `webfolio-v1-vanilla` Actions tab; the deploy chain is v1-vanilla → .github.io → Pages. |

---

## 8. Long-term maintenance (quarterly habit)

1. `npm run candidates` — anything new worth tagging? Anything to retire?
2. `npm run tags` — canonicalize new synonyms.
3. Review `featured`/`weight` so the best work stays on top.
4. Promote substantial sub-projects out of collection repos into their own repos
   (then tag + enrich) — never fake a card without a repo behind it.
5. Rotate `PORTFOLIO_PAT` if you set an expiry.
6. Keep `taxonomy.json` small — resist adding categories (use tags) unless §4f is met.

---

## 9. File map

| Path | Role | Edit by hand? |
|---|---|---|
| `data/overrides.json` | Authored enrichment/curation | ✅ yes (the main one) |
| `data/taxonomy.json` | Controlled vocabularies | ✅ rarely (governance) |
| `data/projects.json` | Canonical generated dataset | 🚫 never |
| `scripts/sync.mjs` | Merge engine (+ `TAG_ALIASES`) | ⚙ only for tag aliases/logic |
| `adapters/*.mjs` | Canonical → each surface | ⚙ only when adding a surface |
| `.github/workflows/sync.yml` | Weekly auto-sync → PR | ⚙ rarely |
| `SCHEMA.md` / `CONTRIBUTING.md` / `GUIDE.md` | Docs | ✅ keep current |
