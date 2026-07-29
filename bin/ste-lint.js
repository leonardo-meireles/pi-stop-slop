#!/usr/bin/env node
/**
 * ste-lint — CLI entry point for the anti-slop linter.
 * Mirrors woosal1337/ste-lint.py CLI behavior.
 *
 * Usage:
 *   echo "your text" | npx ste-lint
 *   npx ste-lint file1.md file2.md
 *
 * Original: https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";

async function main() {
  const { createJiti } = await import("jiti");
  const jiti = createJiti(import.meta.url);
  const mod = jiti("../src/ste-lint.ts");

  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Read from stdin
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const text = Buffer.concat(chunks).toString("utf-8");
    const result = mod.lint(text);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  // Read from files
  const cwd = process.cwd();
  for (const pattern of args) {
    if (pattern.includes("*") || pattern.includes("?")) {
      const abs = resolve(cwd, pattern);
      const dir = dirname(abs);
      const glob = basename(abs);
      const re = new RegExp(
        "^" + glob.replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
      );
      if (existsSync(dir)) {
        const files = readdirSync(dir)
          .filter((f) => re.test(f))
          .sort();
        for (const file of files) {
          processFile(mod.lint, resolve(dir, file));
        }
      }
    } else {
      const filepath = resolve(cwd, pattern);
      if (existsSync(filepath)) {
        processFile(mod.lint, filepath);
      } else {
        console.error("File not found: " + pattern);
      }
    }
  }
}

function processFile(lintFn, filepath) {
  const text = readFileSync(filepath, "utf-8");
  const result = lintFn(text);
  const name = filepath.split("/").pop() ?? filepath;
  const w = String(result.words).padStart(4);
  const t = String(result.total).padStart(3);
  const p = String(result.totalPer100w.toFixed(2)).padStart(6);
  const ed = String(result.emDashCount).padStart(2);
  console.log(
    name.padEnd(32) +
      " words=" + w +
      " total=" + t +
      " per100w=" + p +
      " em_dash=" + ed,
  );
}

main();
