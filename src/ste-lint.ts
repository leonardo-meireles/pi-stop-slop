/**
 * STE anti-slop linter — the machine-checkable subset of ASD-STE100.
 * Ported from woosal1337/ste-lint.py (MIT).
 *
 * Deterministic. Score = violations per 100 words. Lower is cleaner.
 *
 * Original: https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop
 */

import {
	BANNED_WORDS,
	BE_FORMS,
	IRREGULAR_PAST_PARTICIPLES,
	MARKETING_ADJECTIVES,
	MODAL_HEDGES,
	NOMINALIZATION_VERBS,
	PHRASAL_VERBS,
} from "./ste-rules.js";

// ── pre-built regexes (static patterns from constants, not user input) ─

// biome-ignore lint/security/noDangerouslyInsertedRegexpTheWorldIsOnFire: phrases
// always come from hardcoded module-level constants in ste-rules.ts
// (BANNED_WORDS, MARKETING_ADJECTIVES, etc.), never from user input.
function buildPhraseRe(phrases: string[]): RegExp {
	const escaped = phrases
		.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("|");
	return new RegExp(`(?<![a-z])(?:${escaped})(?![a-z])`, "gi");
}

const BANNED_WORDS_RE = buildPhraseRe(BANNED_WORDS);
const MARKETING_RE = buildPhraseRe(MARKETING_ADJECTIVES);
const PHRASAL_RE = buildPhraseRe(PHRASAL_VERBS);
const MODAL_HEDGE_RE = buildPhraseRe(MODAL_HEDGES);
const NOM_VERBS_RE = buildPhraseRe(NOMINALIZATION_VERBS);

// biome-ignore lint/security/noDangerouslyInsertedRegexpTheWorldIsOnFire: static sources, not user input
const PASSIVE_RE = new RegExp(
	`${BE_FORMS.source}\\s+(?:\\w+ed|${IRREGULAR_PAST_PARTICIPLES.source})`,
	"gi",
);
// biome-ignore lint/security/noDangerouslyInsertedRegexpTheWorldIsOnFire: static sources
const ING_MAIN_RE = new RegExp(`${BE_FORMS.source}\\s+\\w+ing\\b`, "gi");

// Suffixes t/re/ve/ll/d/m never form possessives, so any \w+'suffix
// match is always a real contraction (don't, we're, I've, we'll, I'd, I'm).
// The 's suffix is ambiguous (it's = it is, but author's = possessive),
// so it only counts when the preceding word is a known pronoun/adverb
// that commonly forms an 's contraction — never a possessive noun.
const APOSTROPHE_S_PRONOUNS =
	"it|that|what|who|here|there|let|he|she|how|where|when|why|one";
// biome-ignore lint/security/noDangerouslyInsertedRegexpTheWorldIsOnFire: static hardcoded constant, not user input
const CONTRACTION_RE = new RegExp(
	`\\b\\w+['’](?:t|re|ve|ll|d|m)\\b|\\b(?:${APOSTROPHE_S_PRONOUNS})['’]s\\b`,
	"gi",
);

// ── helpers ────────────────────────────────────────────────

function stripCode(text: string): string {
	let t = text;
	t = t.replace(/```[\s\S]*?```/g, " ");
	t = t.replace(/`[^`]*`/g, " ");
	return t;
}

function sentences(text: string): string[] {
	const out: string[] = [];
	for (const line of text.split("\n")) {
		let s = line.trim();
		if (!s) continue;
		s = s.replace(/^\s*#{1,6}\s*/, "");
		s = s.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "");
		if (!s) continue;
		const parts = s.split(/(?<=[.!?:])\s+(?=[A-Z0-9"'-])/);
		for (const p of parts) {
			const trimmed = p.trim();
			if (trimmed) out.push(trimmed);
		}
	}
	return out;
}

function wordCount(s: string): number {
	const matches = s.match(/[A-Za-z0-9][A-Za-z0-9'\-/]*/g);
	return matches ? matches.length : 0;
}

function countRE(text: string, re: RegExp): number {
	const found = text.match(re);
	return found ? found.length : 0;
}

function collectRE(
	text: string,
	re: RegExp,
): { count: number; hits: string[] } {
	const found = text.match(re);
	if (!found) return { count: 0, hits: [] };
	return { count: found.length, hits: found };
}

// ── violation categories ───────────────────────────────────

export interface ViolationSummary {
	label: string;
	count: number;
	detail: string;
}

export interface LintResult {
	words: number;
	sentences: number;
	violations: Record<string, number>;
	total: number;
	totalPer100w: number;
	emDashCount: number;
	longestSentenceWords: number;
	sampleMarketing: string[];
	sampleBanned: string[];
	summary: ViolationSummary[];
}

export function lint(text: string): LintResult {
	const raw = text;
	const cleaned = stripCode(text);
	const sents = sentences(cleaned);
	const words = Math.max(
		sents.reduce((sum, s) => sum + wordCount(s), 0),
		1,
	);

	const v: Record<string, number> = {};

	// long sentences (>20 words)
	const longCounts = sents.map((s) => wordCount(s));
	const longs = longCounts.filter((n) => n > 20);
	v["long_sentence(>20w)"] = longs.length;

	// semicolons
	v["semicolon"] = (cleaned.match(/;/g) ?? []).length;

	// contractions (excludes possessive 's: "author's" is not "author is")
	v["contraction"] = (cleaned.match(CONTRACTION_RE) ?? []).length;

	// passive voice, -ing, nominalizations
	v["passive_voice"] = countRE(cleaned, PASSIVE_RE);
	v["ing_main_verb"] = countRE(cleaned, ING_MAIN_RE);
	{
		const nomVerbs = countRE(cleaned, NOM_VERBS_RE);
		const nomOf = countRE(cleaned, /\b\w{4,}(?:tion|ment|ance|ence)\s+of\b/gi);
		v["nominalization"] = nomVerbs + nomOf;
	}

	// phrasal, banned, marketing, hedges
	v["phrasal_verb"] = countRE(cleaned, PHRASAL_RE);
	const bannedResult = collectRE(cleaned, BANNED_WORDS_RE);
	v["banned_word"] = bannedResult.count;
	const marketingResult = collectRE(cleaned, MARKETING_RE);
	v["marketing_adjective"] = marketingResult.count;
	v["modal_hedge"] = countRE(cleaned, MODAL_HEDGE_RE);

	// long paragraphs (>6 sentences)
	const paragraphs = raw.split(/\n\s*\n/).filter((p) => p.trim());
	v["long_paragraph(>6s)"] = paragraphs.reduce(
		(sum, p) => sum + (sentences(stripCode(p)).length > 6 ? 1 : 0),
		0,
	);

	const emDashes = (raw.match(/[—–]/g) ?? []).length;

	const total = Object.values(v).reduce((a, b) => a + b, 0);

	const summary: ViolationSummary[] = Object.entries(v).flatMap(
		([key, count]) =>
			count > 0 ? [{ label: key, count, detail: explainViolation(key) }] : [],
	);

	return {
		words,
		sentences: sents.length,
		violations: v,
		total,
		totalPer100w: Math.round(((total * 100) / words) * 100) / 100,
		emDashCount: emDashes,
		longestSentenceWords:
			longs.length > 0 ? Math.max(...longs) : Math.max(...longCounts, 0),
		sampleMarketing: [...new Set(marketingResult.hits)].slice(0, 6),
		sampleBanned: [...new Set(bannedResult.hits)].slice(0, 6),
		summary,
	};
}

function explainViolation(key: string): string {
	const map: Record<string, string> = {
		"long_sentence(>20w)": "Sentence exceeds 20 words. Split it.",
		semicolon: "Semicolon found. Use a period and write two sentences.",
		contraction: "Contraction found. Expand it (e.g. don't → do not).",
		passive_voice: "Passive voice detected. Use active voice.",
		ing_main_verb: "Be + -ing main verb. Use simple tense.",
		nominalization:
			"Nominalization. Use a plain verb (e.g. 'perform analysis' → 'analyze').",
		phrasal_verb: "Phrasal verb. Use a plain verb (e.g. 'spin up' → 'start').",
		banned_word: "Banned word. Use the short common alternative.",
		marketing_adjective: "Marketing adjective. Remove it.",
		modal_hedge: "Modal hedge. Delete it and state the fact.",
		"long_paragraph(>6s)": "Paragraph exceeds 6 sentences. Split it.",
	};
	return map[key] ?? "Unknown violation.";
}
