---
name: stop-slop
description: >
  Write prose in ASD-STE100 Simplified Technical English to remove AI slop.
  Two modes: strict (procedures, error messages, controlled dictionary) and
  flavored (general prose, no dictionary lockdown). Use when user says
  "stop slop", "stop-slop", "/stop-slop", or invokes this skill.
  Ported from woosal1337's Python reference (MIT). Original:
  https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop
---

# stop-slop

Write prose in ASD-STE100 Simplified Technical English. This applies to
documentation, READMEs, pull-request text, error messages, release notes,
and comments. It does NOT apply to code, identifiers, or command syntax.

Rules, modes, and the machine-checkable linter are ported from
woosal1337/ste-lint.py. Original:
<https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop>

## Persistence

ACTIVE EVERY RESPONSE once triggered. No revert after many turns.
No filler drift. Still active if unsure.
Off only: "stop slop off" / "normal mode" / "/stop-slop off".

Default mode: **flavored**. Switch: `/stop-slop strict|flavored`.

## Rules — both modes

### Words

- One name for one thing. Do not call the same item by two different names.
- Short common word: start (not begin/commence/initiate), use (not
  utilize/leverage), help (not facilitate), make sure (not ensure),
  before (not prior to), after (not subsequent to), about (not
  regarding/concerning), get (not obtain/acquire), show (not
  demonstrate), also (not additionally/furthermore/moreover).
- One meaning per word. "Fall" means to move down, not to decrease.
- No marketing adjectives: seamless, robust, powerful, cutting-edge,
  effortless, world-class, next-generation, revolutionary.
- American spelling.

### Verbs

- Active voice. "The parser reads the file", not "the file is read by
  the parser."
- Use a verb for an action. "Analyze the log", not "perform an
  analysis of the log."
- No stacked auxiliaries. Not "it is important to note that this may
  help to improve." Write "this improves X."
- No "-ing" main verb where a simple tense works.

### Sentences

- One instruction per sentence. Max 20 words (instruction), max 25
  words (descriptive).
- No contractions. Use articles: a, an, the, this, these.

### Punctuation

- No semicolons. Write two sentences.

### Structure

- One topic per paragraph, max six sentences.
- For steps, use a numbered vertical list, one action per item,
  imperative form.
- Put a condition before its command.

Write only the requested text. No preamble, no summary, no closing
remarks beyond what was asked.

## Self-lint (run mentally before returning text)

1. Any sentence over 20 words? Split it.
2. Any semicolon? Replace with a period.
3. Any contraction? Expand it.
4. Any passive voice with a known actor? Make it active.
5. Any "-ing" main verb, nominalization ("perform an analysis"), or
   phrasal verb ("spin up")? Replace with a plain verb.
6. Same thing named two ways? Pick one name.

## Modes

**strict** — procedures, runbooks, safety text, error messages.
Apply every rule. Enforce the word-length caps.

**flavored** (default) — general prose: READMEs, PR descriptions, docs.
Apply sentence, paragraph, active-voice, and no-phrasal-verb
discipline. Relax the controlled-dictionary lockdown so the text keeps
enough range to read naturally. Still no marketing adjectives, no
semicolons, no contractions.

## Boundaries

Code, commands, identifiers, and URLs: never touch.
"stop slop off" or "normal mode": revert to standard prose.

## Credit

ASD-STE100 Issue 9, free at asd-ste100.org.
Ported from woosal1337/ste-lint.py (MIT).
