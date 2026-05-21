/**
 * Takes screenshots of all built flows and saves them to public/flow-screenshots/
 * Run: node scripts/take-flow-screenshots.mjs
 */

import { execSync } from "child_process";
import { existsSync, copyFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/flow-screenshots");
const BASE_URL = "http://localhost:60509";
const VIEWPORT = "--viewport-size=1440,900";
const WAIT = "--wait-for-timeout=2500";

// [id, route, copyFrom?]
// copyFrom means: same screenshot as another flow (shared route)
const FLOWS = [
  ["DB-01", "/dashboard"],
  ["ML-01", "/meetings"],
  ["ML-03", "/meetings", "ML-01"],          // new meeting modal — same page
  ["MD-01", "/meetings/m2"],
  ["MD-02", "/meetings/m8"],
  ["MD-03", "/meetings/m1"],
  ["MD-04", "/meetings/m1", "MD-03"],        // transcript tab — same page
  ["MD-05", "/meetings/m8", "MD-02"],        // participants panel — same page
  ["MD-06", "/meetings/m8", "MD-02"],        // invite guest — same page
  ["GU-01", "/guest-join/m8"],
  ["GU-02", "/guest-join/m8", "GU-01"],      // success state — same page
  ["GU-03", "/guest-join/m8", "GU-01"],      // wrong password — same page
  ["GU-04", "/guest-view/m8"],
  ["CA-01", "/calendar"],
  ["AN-01", "/analytics"],
  ["SE-01", "/settings"],
  ["SE-02", "/settings", "SE-01"],
  ["SE-03", "/settings", "SE-01"],
  ["SE-04", "/settings", "SE-01"],
];

let ok = 0;
let failed = 0;

for (const [id, route, copyFrom] of FLOWS) {
  const outFile = path.join(OUT_DIR, `${id}.png`);

  if (copyFrom) {
    const src = path.join(OUT_DIR, `${copyFrom}.png`);
    if (existsSync(src)) {
      copyFileSync(src, outFile);
      console.log(`  ✓ ${id} (copied from ${copyFrom})`);
      ok++;
    } else {
      console.log(`  ✗ ${id} — source ${copyFrom}.png not found yet, skipping copy`);
    }
    continue;
  }

  const url = `${BASE_URL}${route}`;
  const cmd = `npx playwright screenshot ${VIEWPORT} ${WAIT} "${url}" "${outFile}"`;

  try {
    execSync(cmd, { stdio: "pipe", timeout: 30_000 });
    console.log(`  ✓ ${id}  ${route}`);
    ok++;
  } catch (err) {
    console.error(`  ✗ ${id}  ${route} — ${err.message?.split("\n")[0]}`);
    failed++;
  }
}

console.log(`\nDone: ${ok} succeeded, ${failed} failed`);
