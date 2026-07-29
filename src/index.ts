/**
 * pi-stop-slop — pi-agent extension
 *
 * Brings ASD-STE100 Simplified Technical English writing rules into pi-agent.
 * Two modes: strict (procedures) and flavored (general prose).
 *
 * Ported from woosal1337/ste-lint.py (MIT).
 * Original: https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { lint } from "./ste-lint.js";
import type { SteMode } from "./ste-rules.js";

// ── state ───────────────────────────────────────────────────

interface State {
	mode: SteMode | null;
}

// ── mode descriptions ───────────────────────────────────────

const SETUP_TEXT = `
pi-stop-slop — ASD-STE100 Simplified Technical English for pi-agent

MODES
  /stop-slop strict    — Procedures, error messages, safety text.
                          All STE rules enforced. Dictionary locked.
  /stop-slop flavored  — READMEs, PR descriptions, general docs.
                          Active voice, no marketing, no semicolons.
                          Dictionary relaxed for natural range.
  /stop-slop off       — Revert to standard writing.

EXAMPLES
  Before: "It is important to note that this may help to improve performance."
  After:  "This improves performance."

  Before: "The file is read by the parser and the result is displayed."
  After:  "The parser reads the file and shows the result."

Status line shows current mode: [STE:STRICT] or [STE:FLAVORED].

Ported from woosal1337/ste-lint.py (MIT).
Spec: ASD-STE100 Issue 9, free at asd-ste100.org.
`;

// ── skill content (single source of truth, read once, immutable) ──

/**
 * Reads skills/stop-slop/SKILL.md and strips YAML frontmatter.
 * This is the ONLY copy of STE rules text — the extension injects
 * it directly instead of duplicating rules in template literals.
 */
function loadSkillBody(): string {
	const here = dirname(fileURLToPath(import.meta.url));
	const skillPath = join(here, "..", "skills", "stop-slop", "SKILL.md");
	const raw = readFileSync(skillPath, "utf-8");
	return raw.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
}

const skillBody = loadSkillBody();

const modeReminder: Record<SteMode, string> = {
	strict:
		"Currently in STRICT mode: enforce every rule above and the " +
		"controlled dictionary. This is for procedures and error messages.",
	flavored:
		"Currently in FLAVORED mode: apply sentence, paragraph, and " +
		"active-voice discipline. Dictionary relaxed for natural prose.",
};

// ── commands ─────────────────────────────────────────────────

function registerCommands(pi: ExtensionAPI, state: State) {
	pi.registerCommand("stop-slop", {
		description: "Toggle ASD-STE100 simplified technical English mode",
		handler: async (args, ctx) => {
			const sub = args?.trim().toLowerCase() ?? "";

			if (sub === "setup" || sub === "help") {
				ctx.ui.notify(SETUP_TEXT, "info");
				return;
			}

			if (sub === "off" || sub === "normal" || sub === "disable") {
				state.mode = null;
				ctx.ui.setStatus("stop-slop", "");
				ctx.ui.notify("STE mode off. Standard writing restored.", "info");
				return;
			}

			if (sub === "strict") {
				state.mode = "strict";
				ctx.ui.setStatus("stop-slop", "[STE:STRICT]");
				ctx.ui.notify("STE mode: strict (procedures).", "info");
				return;
			}

			if (sub === "flavored" || sub === "" || sub === "on") {
				state.mode = "flavored";
				ctx.ui.setStatus("stop-slop", "[STE:FLAVORED]");
				ctx.ui.notify(
					"STE mode: flavored (general prose). /stop-slop strict for procedures.",
					"info",
				);
				return;
			}

			ctx.ui.notify(
				`Unknown: "${args}". Try /stop-slop strict|flavored|off|setup`,
				"error",
			);
		},
	});
}

// ── tools ────────────────────────────────────────────────────

function registerTools(pi: ExtensionAPI) {
	pi.registerTool({
		name: "stop_slop_lint",
		label: "Lint for Slop",
		description:
			"Analyze text for AI slop patterns using ASD-STE100 rules. " +
			"Returns violations per category and a total score per 100 words. " +
			"Lower score = cleaner text. Use this to check writing quality.",
		parameters: Type.Object({
			text: Type.String({
				description:
					"The text to analyze for slop. Can be a draft message, " +
					"documentation paragraph, or any prose you plan to output.",
			}),
		}),
		async execute(_toolCallId, params) {
			const result = lint(params.text);

			const lines: string[] = [
				`Score: ${result.totalPer100w} violations per 100 words`,
				`Words: ${result.words} | Sentences: ${result.sentences}`,
				"",
			];

			if (result.total === 0) {
				lines.push("No violations found. Text is clean.");
			} else {
				for (const v of result.summary) {
					lines.push(`- [${v.count}] ${v.label}: ${v.detail}`);
				}
			}

			return {
				content: [{ type: "text", text: lines.join("\n") }],
				details: {
					score: result.totalPer100w,
					total: result.total,
					words: result.words,
					violations: result.violations,
				},
			};
		},
	});
}

// ── hooks ────────────────────────────────────────────────────

function registerHooks(pi: ExtensionAPI, state: State) {
	pi.on("before_agent_start", async (event, _ctx) => {
		if (!state.mode) return;

		const steSystemPrompt = `${skillBody}\n\n${modeReminder[state.mode]}`;

		return {
			systemPrompt: event.systemPrompt + "\n\n" + steSystemPrompt,
		};
	});

	pi.on("session_start", async (_event, ctx) => {
		if (state.mode) {
			const label = state.mode === "strict" ? "[STE:STRICT]" : "[STE:FLAVORED]";
			ctx.ui.setStatus("stop-slop", label);
		}
	});

	pi.on("session_shutdown", async () => {
		state.mode = null;
	});
}

// ── entry point ──────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
	// Fresh state per extension instantiation — never share mutable
	// mode across sessions via module-level globals.
	const state: State = { mode: null };
	registerCommands(pi, state);
	registerTools(pi);
	registerHooks(pi, state);
}
