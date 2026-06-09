// Shared helpers for the README adapters. Zero deps.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

export const loadCanon = () => read("data/projects.json");
export const loadTaxonomy = () => read("data/taxonomy.json");

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
