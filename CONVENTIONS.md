# Conventions

## Conventional Commits & Semantic Versioning

All changes MUST follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). Versioning MUST adhere to [Semantic Versioning 2.0.0](https://semver.org/).

### Commit Message Format

`<type>(<scope>): <description>` (Space after colon is MANDATORY)

### Types & Version Bumps

- `feat`: Minor (x.Y.z) - New feature
- `fix`: Patch (x.y.Z) - Bug fix
- `perf`: Patch (x.y.Z) - Performance improvement
- `docs`, `chore`, `style`, `refactor`, `test`: No bump (unless breaking)
- `BREAKING CHANGE:` (or `!` after type): Major (X.y.z)

## GitHub & Git Operations

- No direct work on `main` or `master`. Every task MUST start with a feature branch or worktree via `kickoff-branch`.
- **Integrate (solo default):** Ship with `bash scripts/land-branch.sh <branch> "<conventional message>"` after `release-branch` gates — local squash to `main`, then push. PR is optional.
- `git push origin <feature-branch>` is allowed for backup or CI; never push directly to `main`/`master` except via `land-branch.sh` (`GIT_BIGPOWERS_LAND=1`).
- Use `gh repo clone` not `git clone` for GitHub repos.
- Use `gh run view` / `gh run watch` for CI status.
- **Git Attribution:** NEVER include `Co-authored-by`, `Co-Authored-By`, or any footer attributing code to an AI agent. All commits must appear as authored solely by the human user.
- Never call GitHub REST API directly (curl, fetch, etc.).
- Never create GitHub issues from automated workflows — produce local .md files in specs/ instead.

## Always Green / Shift Left

**Always Green** means Preflight and CI are green before any forward work — not "green enough for this task."

**Shift Left (1-10-100):** Defects cost roughly 1x to fix in development, 10x in integration, 100x in production. Fixing a red gate now is cheaper than shipping and debugging later.

**Preflight** — the project's full local verification stack: `npx tsc --noEmit && npx eslint . && npx vitest run`. Preflight MUST pass before kickoff, develop, or verify phases advance.

**CI green** — when a PR exists, `gh pr checks` MUST show passing before merge or land.

## Discovered Defects

Any **reproducible gate failure** encountered during unrelated work is a discovered defect — not optional background noise.

**fix-or-log ladder (mandatory):**

1. **quick-fix** — trivial, data-only, or single-file fixes within guardrails.
2. **fix-bug** — when quick-fix guardrails abort, or the failure needs investigation (`specs/bugs/BUG-*.md` + TDD).
3. **Log** — only when reproduction is blocked after good-faith attempt. Write a BUG spec. Stop forward work until triaged.

Discovered fixes ship in the **same PR** as the original work but in **separate commits** (Conventional Commits). Never narrate a failure and continue.

**Hard block:** Red Preflight or red CI blocks forward progress until fix-or-log produces green.

### Banned dismissive phrases

Agents MUST NOT use these phrases (or close paraphrases) to ignore reproducible failures:

| Banned phrase | Required behavior instead |
| --------------- | --------------------------- |
| Pre-existing / pre-existing issues | Run fix-or-log; if truly unrelated, prove with a passing repro after revert |
| unrelated to this session | Same — session boundaries do not waive green gates |
| not introduced by my changes | Bisect or fix anyway; solo-default owns the whole tree |
| out of scope (ignoring a red gate) | Invoke quick-fix or fix-bug; scope-minimization never overrides Always Green |

## specs/ — All Planning Output Goes Here

Every skill that produces written output writes to `specs/` at the project root.

### YAML cockpit

| Layer | File | Answers |
| ------- | ------ | --------- |
| Session | `specs/state.yaml` | Active flow, epic/bug, git, `handoff.next_skill` |
| Release index | `specs/release-plan.yaml` | Target semver, WSJF epic list, BCP baseline per story |
| Progress | `specs/execution-status.yaml` | Flat status keys — sole SoT for story state |
| Planning UI | `specs/planning-status.yaml` | Discover-phase workflow checklist (optional) |

### Documentation responsibilities

| File / directory | Owns | Update when |
| ------------------ | ------ | ------------- |
| `specs/state.yaml` | Active session, handoff, workflow mode | Every skill handoff; branch switch |
| `specs/release-plan.yaml` | Epic ordering, WSJF, BCP baselines | New epic scoped; WSJF re-prioritized |
| `specs/execution-status.yaml` | Story/epic done/todo status (sole SoT) | Story completes |
| `specs/product/SCOPE_LATEST.yaml` | In/out of scope | scope-work; change-request |
| `specs/product/VISION_LATEST.yaml` | North star, strategic intent | Major pivot |
| `specs/product/GLOSSARY_LATEST.yaml` | Canonical domain terms | define-language |
| `specs/epics/eNN-*/epic.yaml` | Epic manifest, story list | slice-tasks; plan-work |
| `specs/tech-architecture/tech-stack.md` | Stack, modules, gray areas | map-codebase; deepen-architecture |
| `specs/adr/ADR-*.md` | Architectural decisions | model-domain |
| `specs/bugs/BUG-*.md` | Bug RCA + fix plan | investigate-bug |
| `specs/bugs/registry.yaml` | Bug index (generated) | inspect-quality |

## Code Style

- Functions: 4–20 lines. Split if longer.
- Files: under 300 lines. Split by responsibility.
- One thing per function, one responsibility per module (SRP).
- Names: specific and unique. Avoid `data`, `handler`, `Manager`, `Service`.
- Types: explicit. No `any`, no untyped public functions.
- No code duplication. Extract shared logic.
- Early returns over nested ifs. Max 2 levels of indentation.
- Conditionals: expressed as positives. Avoid negative flags or `unless` logic.
- No magic strings or numbers: every bare literal used in logic must be extracted to a named constant.
- Boolean logic in named functions: complex boolean expressions must be extracted into a named predicate function.
- Prefer exceptions over error codes.
- Remove dead code: unused functions, unreachable branches, and stale imports must be deleted — not commented out.
- Boy Scout Rule: leave every file you touch at least as clean as you found it.
- **Law of Demeter:** A method MUST call only its immediate collaborators. Never chain `a.getB().getC().doX()`.
- Exception messages must include the offending value, expected shape, and an actionable remediation hint.

## Comments

- Write WHY, not WHAT.
- Complex or non-obvious logic must include "Provenance" links (e.g., issue, commit SHA, or ADR filename).
- Docstrings on public functions: intent + one usage example.
- No obvious comments that restate the code.
- No commented-out code: dead code must be deleted, not commented out.

## Tests (F.I.R.S.T)

- Tests run headless with `npx vitest run`.
- Every new function gets a test. Every bug fix gets a regression test.
- Mocks for external I/O are named fake classes, not inline stubs.
- Tests are **F**ast, **I**ndependent, **R**epeatable, **S**elf-Validating, **T**imely.
- Never skip or @ignore a test without an explicit ambiguity note.
- Test boundary conditions: every suite must cover exact edge values — empty input, maximum, minimum, and off-by-one.
- Test through public interfaces only: assert on observable outcomes, never on internal state.
- Every change must be verifiable with a single runnable command before it is marked done.

## Dependencies

- Inject dependencies through constructor/parameter, not global/import.
- Wrap third-party libs behind a thin project-owned interface.

## Formatting

- Use Prettier with default config.
- Configured in pre-commit and on-save. No style debates beyond that.

## Logging

- Structured JSON for debugging / observability.
- Plain text only for user-facing CLI output.

## Defensive Code

- Graceful degradation (when external services/dependencies fail)
- Retry with backoff (for API/network calls)

The agent implements defensive code only for categories explicitly listed here.

## Stack Conventions

Adapted from node-service profile for pi-agent extensions.

### Commands

| Action | Command |
| -------- | --------- |
| Test | `npx vitest run` |
| Lint | `npx eslint .` |
| Build | `npx tsc --noEmit` |
| Run | Loaded by pi-agent; no standalone run command |

### Architecture

- Extension entry: `src/index.ts` exports default factory function receiving `ExtensionAPI`.
- Layered: tools → rule engine → STE rule definitions.
- Tools register via `pi.registerTool()` with TypeBox parameter schemas.
- Commands register via `pi.registerCommand()`.

### Conventions

- ESM (`"type": "module"` in package.json).
- Environment via `process.env` validated at boot.
- Pi-agent extension API imports from `@earendil-works/pi-coding-agent`.
- Parameter schemas via `typebox`.

### Never

- NEVER over-engineer — keep it simple, fast, resilient.
- NEVER add emojis to output.
- NEVER apply slop patterns the tool itself would flag.
- NEVER start background resources from the extension factory — defer to `session_start`.
