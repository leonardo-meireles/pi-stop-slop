/**
 * Benchmark regression test: verifies pi-stop-slop linter behavior
 * matches the direction and structure from woosal1337's experiment.
 *
 * Exact numeric parity with Python ste-lint.py cannot be verified here
 * because the published before/after samples are excerpts, not the
 * full texts used in the experiment (191-347 words each).
 *
 * Original: https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop
 */

import { describe, expect, it } from "vitest";
import { lint } from "../src/ste-lint.js";
import { ALL_SAMPLES } from "../src/benchmark-data.js";

describe("benchmark: STE reduces slop vs baseline", () => {
  for (const sample of ALL_SAMPLES) {
    it(`${sample.name}: STE score < baseline score`, () => {
      const baseline = lint(sample.baseline);
      const ste = lint(sample.ste);
      expect(ste.totalPer100w).toBeLessThan(baseline.totalPer100w);
    });
  }

  it("all samples show measurable slop reduction", () => {
    const reductions: string[] = [];
    for (const sample of ALL_SAMPLES) {
      const baseline = lint(sample.baseline);
      const ste = lint(sample.ste);
      const pct =
        baseline.totalPer100w > 0
          ? (
              ((baseline.totalPer100w - ste.totalPer100w) /
                baseline.totalPer100w) *
              100
            ).toFixed(0)
          : "0";
      reductions.push(`${sample.name}: −${pct}%`);
    }
    // All reductions must be positive
    for (const r of reductions) {
      const pct = parseInt(r.match(/\d+/)![0], 10);
      expect(pct).toBeGreaterThan(0);
    }
  });
});

describe("benchmark: linter output structure", () => {
  it("returns all 11 violation categories", () => {
    const result = lint(ALL_SAMPLES[0].baseline);
    const categories = Object.keys(result.violations);
    expect(categories).toHaveLength(11);
    expect(categories).toContain("long_sentence(>20w)");
    expect(categories).toContain("semicolon");
    expect(categories).toContain("contraction");
    expect(categories).toContain("passive_voice");
    expect(categories).toContain("ing_main_verb");
    expect(categories).toContain("nominalization");
    expect(categories).toContain("phrasal_verb");
    expect(categories).toContain("banned_word");
    expect(categories).toContain("marketing_adjective");
    expect(categories).toContain("modal_hedge");
    expect(categories).toContain("long_paragraph(>6s)");
  });

  it("returns sample violations with actual matched words", () => {
    const result = lint(
      "Our seamless, robust platform utilizes leverage.",
    );
    expect(result.sampleMarketing.length).toBeGreaterThan(0);
    expect(result.sampleMarketing).toContain("seamless");
    expect(result.sampleBanned.length).toBeGreaterThan(0);
    expect(result.sampleBanned).toContain("utilizes");
  });

  it("scores are deterministic (same input → same output)", () => {
    const text = ALL_SAMPLES[0].baseline;
    const r1 = lint(text);
    const r2 = lint(text);
    expect(r1.totalPer100w).toBe(r2.totalPer100w);
    expect(r1.total).toBe(r2.total);
  });
});
