/**
 * STE violation categories and word lists.
 * Ported from woosal1337/ste-lint.py (MIT).
 *
 * Original: https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop
 */

export const MARKETING_ADJECTIVES = [
	"seamless",
	"seamlessly",
	"robust",
	"powerful",
	"cutting-edge",
	"effortless",
	"effortlessly",
	"world-class",
	"next-generation",
	"revolutionary",
	"blazing",
	"lightning-fast",
	"elegant",
	"delightful",
	"turnkey",
	"best-in-class",
	"state-of-the-art",
	"game-changing",
	"first-class",
	"battle-tested",
	"enterprise-grade",
	"supercharge",
	"unlock",
	"unleash",
	"empower",
	"empowers",
];

export const BANNED_WORDS = [
	"begin",
	"begins",
	"commence",
	"commences",
	"initiate",
	"initiates",
	"originate",
	"utilize",
	"utilizes",
	"utilizing",
	"leverage",
	"leverages",
	"leveraging",
	"facilitate",
	"facilitates",
	"ensure",
	"ensures",
	"ensuring",
	"prior to",
	"subsequent to",
	"obtain",
	"obtains",
	"acquire",
	"acquires",
	"demonstrate",
	"demonstrates",
	"additionally",
	"furthermore",
	"moreover",
	"comprehensive",
	"comprehensively",
	"utilization",
	"aforementioned",
	"henceforth",
	"therein",
	"whilst",
	"amongst",
	"numerous",
	"myriad",
	"plethora",
	"in order to",
	"a variety of",
	"in the event that",
	"due to the fact that",
];

export const PHRASAL_VERBS = [
	"spin up",
	"spin down",
	"reach out",
	"dive into",
	"dives into",
	"diving into",
	"kick off",
	"kicks off",
	"roll out",
	"rolls out",
	"tear down",
	"ramp up",
	"circle back",
	"drill down",
	"spun up",
	"reaching out",
];

export const MODAL_HEDGES = [
	"it is important to note",
	"it should be noted",
	"it is worth noting",
	"please note that",
	"as mentioned",
	"as noted above",
];

/** Verbs that form nominalizations: "perform an analysis" → "analyze" */
export const NOMINALIZATION_VERBS = [
	"perform",
	"performs",
	"performed",
	"conduct",
	"conducts",
	"conducted",
	"provide",
	"provides",
	"provided",
	"carry out",
	"carries out",
	"make use of",
	"makes use of",
];

export const BE_FORMS =
	/(?:\bam\b|\bis\b|\bare\b|\bwas\b|\bwere\b|\bbe\b|\bbeen\b|\bbeing\b)/i;

export const IRREGULAR_PAST_PARTICIPLES =
	/\b(?:done|made|sent|read|built|kept|held|set|put|run|written|shown|given|taken|found|got|gotten|seen|known|thrown|drawn)\b/i;

export type SteMode = "strict" | "flavored";
