#!/usr/bin/env node
// Adapter: canonical projects.json -> webfolio-v1-vanilla schema.
// Usage: node tools/adapter-v1-vanilla.mjs <path-to-webfolio-v1-vanilla>/data/projects.json
// The canonical hub stays website-agnostic; this maps it to the live site's shape.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2];
if (!target) { console.error("Usage: node tools/adapter-v1-vanilla.mjs <target projects.json>"); process.exit(1); }

const canon = JSON.parse(readFileSync(join(ROOT, "data/projects.json"), "utf8"));

// roadmap = hand-authored ideas (no repo). Emitted as a SEPARATE top-level key so
// the site can render a muted "what's next" section without mixing it into projects.
let roadmapRaw = { items: [] };
try { roadmapRaw = JSON.parse(readFileSync(join(ROOT, "data/roadmap.json"), "utf8")); } catch { /* optional */ }
const roadmap = (roadmapRaw.items || [])
  .filter((it) => it.visible !== false)
  .map((it, i) => ({
    id: i + 1,
    title: it.title,
    problem: it.problem,
    why: it.why || null,
    category: it.category,
    technologies: it.tags || [],
    status: it.status,                 // idea | planned | building
    horizon: it.horizon || null,       // next | later | someday
    target: it.target || null,
    link: it.link || "#",              // site uses "#" as the "no link" sentinel
    featured: it.featured ?? false,
    isReal: false,                     // never a shipped project
  }));

const projects = canon.projects
  .filter((p) => p.visible)
  .map((p, i) => ({
    id: i + 1,
    title: p.title,
    category: p.category,
    description: p.highlight || p.tagline || p.description,
    technologies: p.tags,
    status: p.status,
    difficulty: "—",                 // not modeled canonically; left neutral
    featured: p.featured,
    github: p.links.repo || "#",   // site uses "#" as the "no link" sentinel
    demo: p.links.demo || "#",
    image: p.media.image,
    isReal: p.source === "github",
  }));

writeFileSync(target, JSON.stringify({ projects, roadmap }, null, 2) + "\n");
console.log(`✓ Wrote ${target} — ${projects.length} project(s), ${roadmap.length} roadmap item(s) in v1-vanilla schema.`);
