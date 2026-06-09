# Canonical Project Schema

`data/projects.json` is the **website-agnostic source of truth** for every showcased
project. It is **generated** by `tools/sync.mjs` from two inputs:

1. **GitHub repos** carrying the `portfolio` topic (auto-derived fields).
2. **`data/overrides.json`** — the only file edited by hand (authored fields).

Any consumer (the v1-vanilla site, a future React site, the profile README, a CV)
reads this same file. Field names align with [schema.org](https://schema.org)
`SoftwareSourceCode` / `CreativeWork` so a renderer can emit JSON-LD for free.

## Field reference

| Field | Type | Required | Origin | schema.org | Allowed / format |
|---|---|---|---|---|---|
| `slug` | string | ✅ | derived (repo name) | `identifier` | `^[a-z0-9][a-z0-9-]*$` |
| `title` | string | ✅ | authored (fallback repo name) | `name` | — |
| `tagline` | string | ✅ | authored / repo description | `alternativeHeadline` | one line |
| `description` | string | ✅ | authored / repo description | `description` | markdown ok |
| `highlight` | string\|null | — | authored | `award` | impact one-liner |
| `category` | enum | ✅ | authored | `applicationCategory` | one of `taxonomy.json#categories` |
| `tags` | string[] | ✅ | derived (topics+language) + authored | `keywords` | lowercase |
| `status` | enum | ✅ | authored / auto | `creativeWorkStatus` | one of `taxonomy.json#status` |
| `featured` | boolean | ✅ | authored | — | curation |
| `weight` | number | ✅ | authored | `position` | sort within category (desc) |
| `visible` | boolean | ✅ | authored | — | kill switch |
| `source` | enum | ✅ | derived | — | `github` \| `manual` |
| `links.repo` | string\|null | ✅ | derived | `codeRepository` | URL |
| `links.demo` | string\|null | — | derived (homepage) / authored | `url` | URL |
| `links.docs` | string\|null | — | authored | `documentation` | URL |
| `media.image` | string | ✅ | authored / GitHub OG image | `image` | URL |
| `media.thumbnail` | string\|null | — | authored | `thumbnailUrl` | URL |
| `repo.language` | string\|null | — | derived | `programmingLanguage` | — |
| `repo.stars` | number | — | derived | — | — |
| `repo.license` | string\|null | — | derived | `license` | SPDX id |
| `repo.createdAt` | ISO date | — | derived | `dateCreated` | — |
| `repo.updatedAt` | ISO date | — | derived | `dateModified` | — |
| `repo.topics` | string[] | — | derived | — | raw audit |

> `repo.*` is a read-only mirror of GitHub — **never hand-edit it**. To override a
> derived value (e.g. a custom demo URL), set the authored field in `overrides.json`.

## Derived vs authored

- **Derived (auto):** `slug`, `links.repo`, `links.demo`, `tags` (from topics+language),
  `source`, and the whole `repo` block.
- **Authored (`overrides.json`, per slug):** `title`, `tagline`, `description`,
  `highlight`, `category`, `featured`, `weight`, `visible`, extra `tags`,
  `image`, `demo`, `docs`. Override always wins over derived.

## Validation (enforced by `sync.mjs`)

- `slug` must match the regex.
- `category` and `status` must exist in `taxonomy.json` (blocking error otherwise).
- A repo tagged `portfolio` with **no** override entry → flagged *needs enrichment*
  and excluded until enriched.
- Sort order: `category.order` → `weight` desc → `repo.updatedAt` desc.

## Controlled vocabularies

See `data/taxonomy.json`. To change them, follow the governance rules in
`CONTRIBUTING.md`.

## Roadmap items (`data/roadmap.json`)

`data/roadmap.json` holds **public ideas** Diogo plans to build but hasn't started —
there is no repo yet. Unlike `projects.json`, this file is **authored-and-canonical**:
nothing is derived from GitHub, every field is hand-written. It is opt-in to render
(surfaces choose to show it) and **never leaks into `projects.json`** — the two are
separate datasets. Shape: `{ "$comment": …, "items": [ {item} ] }`. Items are
intentionally **not** bound to schema.org (a roadmap idea isn't a published work).

### Field reference

| Field | Type | Required | Allowed / format |
|---|---|---|---|
| `slug` | string | ✅ | `^[a-z0-9][a-z0-9-]*$`; **stable**; must not collide with a live `portfolio` repo (sync warns when it does = graduation signal) |
| `title` | string | ✅ | — |
| `problem` | string | ✅ | the pain it solves — the headline field that signals judgment |
| `why` | string\|null | — | motivation / who it's for, one line |
| `category` | enum | ✅ | one of `taxonomy.json#categories` (same vocab as projects) |
| `tags` | string[] | — | intended stack, free-form, lowercase |
| `status` | enum | ✅ | one of `taxonomy.json#roadmapStatus`: `idea` \| `planned` \| `building` |
| `horizon` | enum\|null | — | one of `taxonomy.json#horizon`: `next` \| `later` \| `someday` |
| `target` | string\|null | — | soft target shown literally, e.g. `"Q3 2026"` — never a hard deadline |
| `link` | string\|null | — | URL to an issue/discussion describing it; **never** a demo/repo link that 404s |
| `weight` | number | — | sort within section (desc); default `0` |
| `featured` | boolean | — | surfaces the idea on the profile README "Currently exploring" line; default `false` |
| `visible` | boolean | — | kill switch; default `true` |

### Validation (enforced by `sync.mjs`)

Runs on `npm run check` and `npm run sync`. Each is a **blocking error**:

- `slug` must match the regex; no duplicate slugs across items.
- `title`, `problem`, `category` are required.
- `category` must exist in `taxonomy.json#categories`.
- `status` must exist in `taxonomy.json#roadmapStatus`.
- `horizon` (if set) must exist in `taxonomy.json#horizon`.

A roadmap `slug` that matches a live `portfolio` repo → **non-blocking warning**
(time to graduate it — see `CONTRIBUTING.md`).

### Controlled vocabularies

`roadmapStatus` (`idea`/`planned`/`building`) and `horizon` (`next`/`later`/`someday`)
are **new** vocabularies in `taxonomy.json`, each `{id,label,order,description}`. They
are kept separate from the project `status` enum — a roadmap idea is not a project.
