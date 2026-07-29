/**
 * Benchmark data: before/after text samples from woosal1337's experiment.
 * Scores are from the Python ste-lint.py (violations per 100 words).
 *
 * Original: https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop
 */

export interface BenchmarkSample {
  name: string;
  baseline: string;
  ste: string;
  expectedBaselineScore: number;
  expectedSteScore: number;
}

export const README_INTRO: BenchmarkSample = {
  name: "README intro",
  baseline:
    "Traditional caches miss constantly in LLM workloads because users rarely " +
    "phrase the same question identically — fluxcache solves this by embedding " +
    "incoming prompts and matching them against previously cached queries within " +
    "a configurable similarity threshold. It ships with sensible defaults so you " +
    "can get semantic caching running in a few lines of code, while exposing the " +
    "knobs — similarity thresholds, TTLs, namespacing, custom scoring — that real " +
    "applications need as they scale. Whether you're building a chatbot, a RAG " +
    "pipeline, or an agentic workflow, fluxcache is designed to slot into your " +
    "existing stack with minimal friction and no vendor lock-in.",
  ste:
    "A normal cache matches requests by exact text. A small change in wording " +
    "then causes a cache miss. fluxcache compares the meaning of a new prompt " +
    "with the prompts already in the cache. If two prompts are close enough in " +
    "meaning, fluxcache returns the stored response instead of a new call to " +
    "the model. This lowers the number of calls to the model and cuts the cost " +
    "and response time of the application.",
  expectedBaselineScore: 4.19,
  expectedSteScore: 1.18,
};

export const ERROR_MESSAGE: BenchmarkSample = {
  name: "error message",
  baseline:
    "You've hit the rate limit for this API. Your account is allowed up to " +
    "100 requests per rolling 60-second window — once that window rolls past, " +
    "the counter resets and you can resume making requests. We enforce this " +
    "limit to maintain consistent performance and ensure fair access for all " +
    "users. Check the Retry-After header for the exact wait time.",
  ste:
    "The API allows a maximum of 100 requests per minute for each account. " +
    "Your application sent more requests than this limit allows. The server " +
    "rejected the extra requests to protect the system for all users. Check " +
    "the Retry-After header in the response for the exact wait time. Wait for " +
    "this time, then send your request again.",
  expectedBaselineScore: 3.25,
  expectedSteScore: 0.0,
};

export const PR_DESCRIPTION: BenchmarkSample = {
  name: "PR description",
  baseline:
    "This PR replaces our home-grown exponential-backoff retry decorator " +
    "with the `stamina` library (MIT, well-maintained, type-safe). The " +
    "immediate motivation is issue #2473: transient database connection " +
    "failures during deploys were surfaced immediately to callers with no " +
    "retry, forcing every call site to implement its own ad-hoc retry logic. " +
    "By centralizing retry behaviour in stamina we get configurable backoff, " +
    "jitter, and circuit-breaking for free, while removing 400+ lines of " +
    "bespoke retry code spread across 14 files. The migration is mechanical: " +
    "every `@retry` import becomes `from stamina import retry`, the parameters " +
    "map one-to-one, and the test suite confirms identical backoff timing " +
    "within acceptable jitter bounds. One behavioural change: stamina's " +
    "default maximum retry delay is 30s (was 60s in our decorator). This is " +
    "arguably more sensible for user-facing timeouts and is documented in the " +
    "migration guide added to docs/breaking-changes.md.",
  ste:
    "Replace the custom retry decorator with the `stamina` library. The " +
    "decorator caused transient database connection failures to surface " +
    "immediately with no retry. Each call site had its own retry logic. " +
    "Stamina provides configurable backoff, jitter, and circuit-breaking. " +
    "Remove 400 lines of retry code from 14 files. The migration is " +
    "mechanical. Change each `@retry` import to `from stamina import retry`. " +
    "The parameters map one-to-one. The test suite confirms identical backoff " +
    "timing within acceptable jitter bounds. One change: stamina uses a 30s " +
    "maximum retry delay. Our decorator used 60s. This change is documented " +
    "in docs/breaking-changes.md.",
  expectedBaselineScore: 3.46,
  expectedSteScore: 1.35,
};

export const ALL_SAMPLES: BenchmarkSample[] = [
  README_INTRO,
  ERROR_MESSAGE,
  PR_DESCRIPTION,
];
