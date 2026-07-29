# pi-stop-slop

Your model writes tight prose from the first token. No second pass. No rewrite step.

This README follows its own rules. Two quotes below show bad writing on purpose. Every other sentence scores zero on the linter in this repo. That is the whole pitch.

## The problem

Ask a model for a README and you get this:

> Traditional caches miss constantly in LLM workloads because users rarely phrase the same question identically — fluxcache solves this by embedding incoming prompts and matching them against previously cached queries within a configurable similarity threshold. It ships with sensible defaults so you can get semantic caching running in a few lines of code, while exposing the knobs — similarity thresholds, TTLs, namespacing, custom scoring — that real applications need as they scale. Whether you're building a chatbot, a RAG pipeline, or an agentic workflow, fluxcache is designed to slot into your existing stack with minimal friction and no vendor lock-in.

Score on our linter: **5.15 violations per 100 words**. Three em dashes. A 40-word run-on sentence. The phrase "sensible defaults."

## The fix

Turn on strict or flavored mode and the same model writes this instead:

> A normal cache matches requests by exact text. A small change in wording then causes a cache miss. fluxcache compares the meaning of a new prompt with the prompts already in the cache. If two prompts are close enough in meaning, fluxcache returns the stored response instead of a new call to the model. This lowers the number of calls to the model and cuts the cost and response time of the application.

Score: **2.74 violations per 100 words**. Same facts. Fewer words. No em dash.

## How it works

Most anti-slop tools work like this: the model writes, then a second pass rewrites the output. Two model calls. Extra latency. A gap between what the model meant and what the rewriter guessed.

pi-stop-slop skips the second pass. The moment you turn on a mode, the rule set goes straight into the system prompt. The model writes in the target style on the first pass. One call. No rewrite. No added latency beyond the extra prompt tokens.

A companion tool (`stop_slop_lint`) still exists. Use it to check text that already exists, written before the mode was on, or pasted in from somewhere else.

## Install

```bash
pi install npm:pi-stop-slop
```

Or from source:

```bash
git clone https://github.com/leonardo-meireles/pi-stop-slop
pi install ./pi-stop-slop
```

## Use

```
/stop-slop strict     Procedures, error messages, safety text. Every rule enforced.
/stop-slop flavored   READMEs, PR descriptions, general docs. Default mode.
/stop-slop off        Back to normal writing.
/stop-slop setup      Show modes and examples.
```

The status line shows the active mode: `[STE:STRICT]` or `[STE:FLAVORED]`.

## Modes

| Mode | Use case | Dictionary |
| --- | --- | --- |
| `strict` | Procedures, runbooks, error messages | Locked. Short common words only. |
| `flavored` | READMEs, PR text, general docs | Relaxed. Keeps active voice, drops marketing words and semicolons. |

Both modes ban marketing adjectives, semicolons, and contractions. Strict mode also caps sentence length at 20 words and forces the ASD-STE100 controlled vocabulary.

## The rules

Based on ASD-STE100, the aerospace industry's Simplified Technical English standard, written for aircraft maintenance manuals in 1986. The standard exists because a pilot cannot afford to misread a procedure.

- One instruction per sentence
- Active voice only
- No semicolons, no contractions
- No marketing adjectives: `seamless`, `robust`, `powerful`, `cutting-edge`, and the rest of the list
- No phrasal verbs: `spin up` becomes `start`
- Short common words: `use` instead of `utilize`, `help` instead of `facilitate`

## Numbers

Real numbers from woosal1337's original experiment: six writing tasks, two model families, four writing conditions. Scored with the original Python linter, the direct ancestor of the one shipped here.

| Condition | Claude sonnet | GPT-5.5 |
| --- | --- | --- |
| Baseline | 4.36 | 3.54 |
| Ban-words list | 4.21 (−3%) | 2.14 (−40%) |
| Orwell's 6 rules | 2.48 (−43%) | 1.69 (−52%) |
| STE | **1.12 (−74%)** | 1.76 (−50%) |

A real writing system beats a folk fix. Banning words one at a time barely moved Claude's score. A full writing system cut both models' slop by half or more.

The TypeScript linter in this repo is a port, not a byte-for-byte copy. It agrees on direction: STE always scores lower. It does not agree on exact magnitude, since the JavaScript and Python regex engines disagree on some edge cases. The linter that ships in this package measures the fluxcache example above at 5.15 -> 2.74.

## CLI

The linter also runs standalone, outside pi:

```bash
echo "your text" | npx ste-lint
npx ste-lint draft.md
npx ste-lint docs/*.md
```

Output is JSON for a single text, or a summary table for files:

```
draft.md    words= 191 total=  8 per100w=  4.19 em_dash= 2
```

## Tool for the model

`stop_slop_lint` is available to the model as a tool at all times, on or off mode. Use it to check existing text, drafts, or pasted content against the same rules.

## Development

```bash
npm test        # runs the full suite
npm run lint    # eslint
npm run typecheck
npm run preflight   # all three
```

## Credit

Rules and linter design come from [woosal1337's original work](https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop). This project ports that Python reference into a pi-agent extension. All credit for the underlying method goes there.

Spec: [ASD-STE100](https://www.asd-ste100.org), Issue 9, free to read.

## License

MIT.
