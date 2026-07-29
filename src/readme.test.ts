/**
 * Guards README.md's before/after quotes against drift from the tested
 * benchmark data. Caught a real bug once: the README quoted truncated
 * versions of these samples while citing scores measured on the full
 * text — the numbers no longer matched the words shown.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { lint } from "./ste-lint.js";
import { README_INTRO } from "./benchmark-data.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readme = readFileSync(join(repoRoot, "README.md"), "utf-8");

describe("README.md quotes match tested benchmark data", () => {
	it("contains the exact baseline sample text", () => {
		expect(readme).toContain(README_INTRO.baseline);
	});

	it("contains the exact STE sample text", () => {
		expect(readme).toContain(README_INTRO.ste);
	});

	it("cites the baseline score that the linter actually produces", () => {
		const result = lint(README_INTRO.baseline);
		expect(readme).toContain(result.totalPer100w.toFixed(2));
	});

	it("cites the STE score that the linter actually produces", () => {
		const result = lint(README_INTRO.ste);
		expect(readme).toContain(result.totalPer100w.toFixed(2));
	});

	it("the cited scores actually show a reduction (not just matching numbers)", () => {
		const baseline = lint(README_INTRO.baseline);
		const ste = lint(README_INTRO.ste);
		expect(ste.totalPer100w).toBeLessThan(baseline.totalPer100w);
	});
});

describe("README.md dogfoods its own rules", () => {
	it("scores zero once the two quoted illustrative examples are removed", () => {
		// The README quotes two examples on purpose: one demonstrates slop,
		// one demonstrates STE. Neither is prose we wrote for this README —
		// both are the tested benchmark sample, quoted verbatim. Every other
		// line is our own writing and must pass the linter with zero hits.
		const ownProse = readme
			.split("\n")
			.filter((line) => !line.startsWith(">"))
			.join("\n");
		const result = lint(ownProse);
		expect(result.total).toBe(0);
	});
});
