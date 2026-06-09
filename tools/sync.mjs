#!/usr/bin/env node
// Portfolio hub — canonical sync engine.
// Builds data/projects.json (website-agnostic source of truth) by merging
// GitHub repo metadata (auto) with data/overrides.json (hand-authored).
//
// Usage:
//   node tools/sync.mjs               generate data/projects.json
//   node tools/sync.mjs --candidates  list every public repo + whether it would be included
//   node tools/sync.mjs --check       validate overrides/taxonomy without writing
//
// Auth: uses GITHUB_TOKEN env (CI) or `gh auth token` (local). Zero npm deps.

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OWNER = "diogo-costa-silva";
const MARKER_TOPIC = "portfolio";          // opt-in: only repos carrying this topic are included
const INCLUDE_ARCHIVED = false;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

const args = new Set(process.argv.slice(2));
const MODE = args.has("--candidates") ? "candidates"
  : args.has("--tags") ? "tags"
  : args.has("--check") ? "check"
  : "generate";

// ---------- helpers ----------
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const warn = (m) => console.warn(`⚠  ${m}`);
const die = (m) => { console.error(`✖  ${m}`); process.exit(1); };

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  try { return execSync("gh auth token", { encoding: "utf8" }).trim(); }
  catch { die("No auth: set GITHUB_TOKEN or run `gh auth login`."); }
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "portfolio-sync",
    },
  });
  if (!res.ok) die(`GitHub API ${res.status} on ${path}: ${await res.text()}`);
  return res.json();
}

async function allPublicRepos() {
  const out = [];
  for (let page = 1; ; page++) {
    const batch = await gh(`/users/${OWNER}/repos?per_page=100&type=public&sort=updated&page=${page}`);
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out.filter((r) => !r.fork);
}

// ---------- load + validate taxonomy ----------
const taxonomy = read("data/taxonomy.json");
const CATEGORIES = new Set(taxonomy.categories.map((c) => c.id));
const STATUSES = new Set(taxonomy.status.map((s) => s.id));
const catOrder = new Map(taxonomy.categories.map((c) => [c.id, c.order]));

// ---------- build one canonical project ----------
const TAG_ALIASES = { "jupyter-notebook": "jupyter" };
const normTag = (t) => {
  const s = t.toLowerCase().trim().replace(/\s+/g, "-");
  return TAG_ALIASES[s] || s;
};

function buildProject(repo, ov) {
  const tagsFromGh = (repo.topics || []).filter((t) => t !== MARKER_TOPIC);
  const lang = repo.language ? [repo.language] : [];
  const tags = [...new Set([...(ov.tags || []), ...tagsFromGh, ...lang].map(normTag))];

  const status = ov.status || (repo.archived ? "archived" : "active");
  const category = ov.category;

  return {
    slug: repo.name,
    title: ov.title || repo.name,
    tagline: ov.tagline || repo.description || "",
    description: ov.description || repo.description || "",
    highlight: ov.highlight || null,
    category,
    tags,
    status,
    featured: ov.featured ?? false,
    weight: ov.weight ?? 0,
    visible: ov.visible ?? true,
    source: "github",
    links: {
      repo: repo.html_url,
      demo: ov.demo || repo.homepage || null,
      docs: ov.docs || null,
    },
    media: {
      image: ov.image || `https://opengraph.githubassets.com/1/${OWNER}/${repo.name}`,
      thumbnail: ov.thumbnail || null,
    },
    repo: {
      language: repo.language || null,
      stars: repo.stargazers_count,
      license: repo.license?.spdx_id || null,
      createdAt: repo.created_at,
      updatedAt: repo.pushed_at,
      topics: repo.topics || [],
    },
  };
}

function validate(p, overrideExists) {
  const errs = [];
  if (!SLUG_RE.test(p.slug)) errs.push(`invalid slug "${p.slug}"`);
  if (!overrideExists) errs.push(`no override entry (needs enrichment)`);
  else {
    if (!p.category) errs.push(`missing category`);
    else if (!CATEGORIES.has(p.category)) errs.push(`unknown category "${p.category}"`);
    if (!STATUSES.has(p.status)) errs.push(`unknown status "${p.status}"`);
  }
  return errs;
}

// ---------- main ----------
const repos = await allPublicRepos();
const overrides = read("data/overrides.json");

if (MODE === "candidates") {
  console.log(`\nPublic repos for ${OWNER} (${repos.length}) — included = has topic "${MARKER_TOPIC}":\n`);
  for (const r of repos.sort((a, b) => a.name.localeCompare(b.name))) {
    const tagged = (r.topics || []).includes(MARKER_TOPIC);
    const hasOv = !!overrides[r.name];
    const flag = tagged ? (hasOv ? "✅ included" : "⚠ tagged, no override") : "   skip";
    console.log(`${flag.padEnd(24)} ${r.name.padEnd(34)} [${(r.topics || []).join(", ") || "no topics"}]`);
  }
  console.log(`\nTo include a repo: gh repo edit ${OWNER}/<name> --add-topic ${MARKER_TOPIC}\n`);
  process.exit(0);
}

const included = repos.filter((r) => (r.topics || []).includes(MARKER_TOPIC) && (INCLUDE_ARCHIVED || !r.archived));
const projects = [];
let hardErrors = 0;

for (const r of included) {
  const ov = overrides[r.name] || {};
  const p = buildProject(r, ov);
  const errs = validate(p, !!overrides[r.name]);
  if (errs.length) {
    const blocking = errs.some((e) => e.startsWith("invalid slug") || e.startsWith("unknown"));
    if (blocking) { hardErrors++; console.error(`✖  ${r.name}: ${errs.join("; ")}`); }
    else warn(`${r.name}: ${errs.join("; ")}`);
  }
  if (!errs.some((e) => e.includes("needs enrichment"))) projects.push(p);
}

// manual entries (source:manual) declared in overrides without a matching repo
for (const [slug, ov] of Object.entries(overrides)) {
  if (slug.startsWith("$") || repos.find((r) => r.name === slug)) continue;
  if (ov.source !== "manual") continue;
  projects.push({
    slug, title: ov.title || slug, tagline: ov.tagline || "", description: ov.description || "",
    highlight: ov.highlight || null, category: ov.category, tags: ov.tags || [],
    status: ov.status || "completed", featured: ov.featured ?? false, weight: ov.weight ?? 0,
    visible: ov.visible ?? true, source: "manual",
    links: { repo: ov.repo || null, demo: ov.demo || null, docs: ov.docs || null },
    media: { image: ov.image || null, thumbnail: ov.thumbnail || null },
    repo: null,
  });
}

if (hardErrors) die(`${hardErrors} blocking error(s) — fix overrides/taxonomy and re-run.`);

projects.sort((a, b) =>
  (catOrder.get(a.category) ?? 99) - (catOrder.get(b.category) ?? 99) ||
  b.weight - a.weight ||
  new Date(b.repo?.updatedAt || 0) - new Date(a.repo?.updatedAt || 0)
);

const payload = {
  $schema: "./docs/SCHEMA.md",
  generatedBy: "tools/sync.mjs",
  owner: OWNER,
  count: projects.length,
  projects,
};

if (MODE === "tags") {
  const counts = new Map();
  for (const p of projects) for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  console.log(`\nDistinct tags across ${projects.length} project(s) — review for synonyms to alias:\n`);
  for (const [tag, n] of sorted) console.log(`  ${String(n).padStart(2)}  ${tag}`);
  console.log(`\n${sorted.length} distinct tags. Add canonicalizations to TAG_ALIASES in tools/sync.mjs.\n`);
  process.exit(0);
}

if (MODE === "check") {
  console.log(`✓ ${projects.length} project(s) valid. No file written (--check).`);
  process.exit(0);
}

writeFileSync(join(ROOT, "data/projects.json"), JSON.stringify(payload, null, 2) + "\n");
console.log(`✓ Wrote data/projects.json — ${projects.length} project(s).`);
for (const c of taxonomy.categories) {
  const n = projects.filter((p) => p.category === c.id).length;
  if (n) console.log(`   ${c.label}: ${n}`);
}
