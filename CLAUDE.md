# pi-stop-slop — pi-agent

Read CONVENTIONS.md before any GitHub or git operation.

## Project

pi-stop-slop — a pi-agent extension that brings ASD-STE100 simplified technical English writing rules into pi. Ported from woosal1337's Python reference implementation. Two modes: strict (procedures, error messages) and flavored (prose, no dictionary lockdown).
Stack: TypeScript / pi-agent extension / Node 22

## Commands

| Action    | Command                                              |
| --------- | ----------------------------------------------------- |
| Test      | `npx vitest run`                                       |
| Lint      | `npx eslint src/`                                      |
| Build     | `npx tsc --noEmit`                                     |
| Preflight | `npx tsc --noEmit && npx eslint src/ && npx vitest run` |
| CI        | `gh pr checks` (when a PR is open)                     |

## Architecture

Single pi-agent extension loaded from `~/.pi/agent/extensions/` or `.pi/extensions/`. Exposes an STE linter tool to the LLM and a `/stop-slop` command for manual invocation. Wraps the STE rule engine behind a thin interface with two modes. No external runtime dependencies beyond pi-agent's TypeBox and pi-ai packages.

## Conventions

- Functions: 4–20 lines. Split if longer.
- Files: under 300 lines.
- Names: specific and unique. Avoid `data`, `handler`, `Manager`.
- Types: explicit. No `any` on public API types.
- Early returns over nested ifs. Max 2 levels of indentation.
- ESM modules (`"type": "module"` in package.json).
- Inject dependencies through constructor/parameter.
- Tests run headless with `npx vitest run`.
- Every public function gets a test.

## Never

- NEVER over-engineer — keep it simple, fast, resilient.
- NEVER add emojis to output.
- NEVER apply slop patterns the tool itself would flag.
- NEVER use `any` on public API types.
- NEVER modify `node_modules/` or generated artifacts directly.
- NEVER dismiss reproducible gate failures as pre-existing or out of scope.
- NEVER proceed on red Preflight or red CI — invoke quick-fix or fix-bug first.

## Agent Rules

- Read specs/ before writing code.
- Write the minimum code that solves the stated problem. Nothing extra.
- Run Preflight after every change. Show evidence before declaring done.
- One clarifying question beats a wrong assumption baked into 200 lines.
- All written output goes in specs/.
- Credit the original author (woosal1337) in all public-facing output.
