// Shared helpers for the README adapters. Zero deps.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

export const loadCanon = () => read("data/projects.json");
export const loadTaxonomy = () => read("data/taxonomy.json");

// Roadmap = hand-authored ideas (data/roadmap.json), no GitHub source. Returns
// normalized, visible items sorted by horizon order -> weight desc -> title.
// Missing file -> [] (the feature is optional and never breaks a build).
export function loadRoadmap() {
  let raw;
  try { raw = read("data/roadmap.json"); } catch { return []; }
  const horizonOrder = new Map((loadTaxonomy().horizon || []).map((h) => [h.id, h.order]));
  return (raw.items || [])
    .map((it) => ({
      slug: it.slug,
      title: it.title,
      problem: it.problem,
      why: it.why || null,
      category: it.category,
      tags: [...new Set((it.tags || []).map((t) => t.toLowerCase().trim()))],
      status: it.status,
      horizon: it.horizon || null,
      target: it.target || null,
      link: it.link || null,
      weight: it.weight ?? 0,
      featured: it.featured ?? false,
      visible: it.visible ?? true,
    }))
    .filter((it) => it.visible)
    .sort((a, b) =>
      (horizonOrder.get(a.horizon) ?? 99) - (horizonOrder.get(b.horizon) ?? 99) ||
      b.weight - a.weight ||
      a.title.localeCompare(b.title));
}

export const linkCell = (p) => {
  const parts = [];
  if (p.links.repo) parts.push(`[Code](${p.links.repo})`);
  if (p.links.demo) parts.push(`[Demo](${p.links.demo})`);
  return parts.join(" · ") || "—";
};

// Markdown tables, one per category (taxonomy order), for the given projects.
export function renderByTheme(projects, taxonomy) {
  let md = "";
  for (const cat of [...taxonomy.categories].sort((a, b) => a.order - b.order)) {
    const items = projects.filter((p) => p.category === cat.id);
    if (!items.length) continue;
    md += `### ${cat.label}\n\n| Project | Description | Tech | Links |\n|---|---|---|---|\n`;
    for (const p of items) {
      md += `| **${p.title}** | ${p.tagline || p.description} | ${p.tags.slice(0, 4).join(", ")} | ${linkCell(p)} |\n`;
    }
    md += `\n`;
  }
  return md.trimEnd() + "\n";
}

// A compact "featured" table (flat, no theme grouping).
export function renderFeatured(projects) {
  let md = `| Project | What it is | Tech | Links |\n|---|---|---|---|\n`;
  for (const p of projects) {
    md += `| **${p.title}** | ${p.tagline || p.description} | ${p.tags.slice(0, 4).join(", ")} | ${linkCell(p)} |\n`;
  }
  return md;
}

const STATUS_BADGE = { idea: "💡 idea", planned: "📋 planned", building: "🚧 building" };

// Roadmap section: idea items grouped by horizon (taxonomy order), each a muted
// table. NEVER renders a repo/demo link — only an optional `link` to an issue/
// discussion on the title. Empty items -> "".
export function renderRoadmap(items, taxonomy) {
  if (!items.length) return "";
  const horizons = [...(taxonomy.horizon || [])].sort((a, b) => a.order - b.order);
  const seen = new Set();
  const table = (label, rows) => {
    let s = label ? `### ${label}\n\n` : "";
    s += `| Idea | Problem it solves | Tech | Status |\n|---|---|---|---|\n`;
    for (const it of rows) {
      const name = it.link ? `[**${it.title}**](${it.link})` : `**${it.title}**`;
      const badge = STATUS_BADGE[it.status] || it.status;
      const target = it.target ? ` _(${it.target})_` : "";
      s += `| ${name} | ${it.problem} | ${it.tags.slice(0, 4).join(", ")} | ${badge}${target} |\n`;
    }
    return s + "\n";
  };
  let md = "";
  for (const h of horizons) {
    const rows = items.filter((it) => it.horizon === h.id);
    rows.forEach((it) => seen.add(it.slug));
    if (rows.length) md += table(h.label, rows);
  }
  const rest = items.filter((it) => !seen.has(it.slug));
  if (rest.length) md += table(horizons.length ? "Unscheduled" : "", rest);
  return md.trimEnd() + "\n";
}

const START = "<!-- PORTFOLIO:START -->", END = "<!-- PORTFOLIO:END -->";

// Inject `md` between the markers in `file`. Errors if markers are missing.
export function injectMarkers(file, md, note) {
  const src = readFileSync(file, "utf8");
  if (!src.includes(START) || !src.includes(END)) {
    console.error(`Markers ${START} / ${END} not found in ${file}. Add them where the content should go.`);
    process.exit(1);
  }
  const banner = note ? `<!-- ${note} -->\n\n` : "";
  const out = src.replace(new RegExp(`${START}[\\s\\S]*${END}`), `${START}\n${banner}${md}\n${END}`);
  writeFileSync(file, out);
}

export { writeFileSync };
