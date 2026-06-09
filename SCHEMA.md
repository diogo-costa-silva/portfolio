# Canonical Project Schema

`data/projects.json` is the **website-agnostic source of truth** for every showcased
project. It is **generated** by `scripts/sync.mjs` from two inputs:

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
