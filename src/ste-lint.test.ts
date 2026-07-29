/**
 * Tests for ste-lint.ts — ported from woosal1337/ste-lint.py
 *
 * Original: https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop
 */

import { describe, expect, it } from "vitest";
import { lint } from "../src/ste-lint.js";

describe("ste-lint", () => {
	it("returns zero violations for clean text", () => {
		const result = lint("The parser reads the file. It shows the result.");
		expect(result.total).toBe(0);
		expect(result.totalPer100w).toBe(0);
	});

	it("detects long sentences (>20 words)", () => {
		const text =
			"The parser reads the file and it shows the result and also writes the output and logs the error and sends the notification to the user.";
		const result = lint(text);
		expect(result.violations["long_sentence(>20w)"]).toBe(1);
	});

	it("detects semicolons", () => {
		const result = lint("Read the file; then write the output.");
		expect(result.violations["semicolon"]).toBe(1);
	});

	it("detects contractions", () => {
		const result = lint("The file isn't ready. You can't read it yet.");
		expect(result.violations["contraction"]).toBe(2);
	});

	it("detects passive voice", () => {
		const result = lint("The file is read by the parser.");
		expect(result.violations["passive_voice"]).toBeGreaterThanOrEqual(1);
	});

	it("does not flag active voice as passive", () => {
		const result = lint("The parser reads the file.");
		expect(result.violations["passive_voice"]).toBe(0);
	});

	it("detects banned words", () => {
		const result = lint("We utilize this method to leverage our system.");
		expect(result.violations["banned_word"]).toBeGreaterThanOrEqual(2);
	});

	it("detects marketing adjectives", () => {
		const result = lint("Our robust, powerful, seamless platform.");
		expect(result.violations["marketing_adjective"]).toBe(3);
	});

	it("detects phrasal verbs", () => {
		const result = lint(
			"We need to spin up the server and reach out to the team.",
		);
		expect(result.violations["phrasal_verb"]).toBe(2);
	});

	it("detects modal hedges", () => {
		const result = lint(
			"It is important to note that this is correct. Please note that it changes.",
		);
		expect(result.violations["modal_hedge"]).toBe(2);
	});

	it("detects nominalizations", () => {
		const result = lint("Perform an analysis of the data.");
		expect(result.violations["nominalization"]).toBeGreaterThanOrEqual(1);
	});

	it("detects -ing main verbs", () => {
		const result = lint("The parser is reading the file.");
		expect(result.violations["ing_main_verb"]).toBe(1);
	});

	it("detects long paragraphs", () => {
		const text = Array.from(
			{ length: 7 },
			(_, i) => `Sentence number ${i + 1} describes the system.`,
		).join(" ");
		const result = lint(text);
		expect(result.violations["long_paragraph(>6s)"]).toBe(1);
	});

	it("strips code blocks from analysis", () => {
		const text = [
			"Here is code:",
			"```ts",
			"const x = 1; // this is a comment that uses contractions like isn't",
			"```",
			"The parser reads the file.",
		].join("\n");
		const result = lint(text);
		expect(result.violations["semicolon"]).toBe(0);
		expect(result.violations["contraction"]).toBe(0);
	});

	it("computes score per 100 words", () => {
		const text =
			"The file is read by the parser. The system utilizes leverage. " +
			"It is a robust seamless powerful platform.";
		const result = lint(text);
		expect(result.totalPer100w).toBeGreaterThan(0);
		expect(result.words).toBeGreaterThan(0);
	});

	it("returns sample violations", () => {
		const text =
			"Our seamless, robust platform utilizes leverage to demonstrate power.";
		const result = lint(text);
		expect(result.sampleMarketing.length).toBeGreaterThan(0);
		expect(result.sampleBanned.length).toBeGreaterThan(0);
	});

	it("handles empty text gracefully", () => {
		const result = lint("");
		expect(result.words).toBe(1); // floor to 1 to avoid division by zero
		expect(result.total).toBe(0);
	});

	it("does not double-count phrases in multiple lists", () => {
		// "it is important to note" was in both BANNED and MODAL_HEDGE.
		// After fix, it counts only as modal_hedge, not also as banned_word.
		const result = lint("It is important to note that this works.");
		expect(result.violations["modal_hedge"]).toBe(1);
		expect(result.violations["banned_word"]).toBe(0);
	});
});
