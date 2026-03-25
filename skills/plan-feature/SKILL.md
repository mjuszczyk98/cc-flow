---
name: plan-feature
description: Plan large features, milestones, and multi-file architectural changes through thorough questioning and structured phase breakdown.
---

# Feature Planner

Build a detailed, executable plan for complex work. Thorough upfront questioning produces plans that execute cleanly.

## When to Use

- Multi-file features or architectural changes
- Milestones spanning multiple components
- Work that benefits from phased execution with dependencies

## When to Skip

- Quick fixes or single-file changes — use `plan-task` instead
- Exploratory work where the destination is unclear — use `brainstorm` first

## Workflow

### 1. Load Context

Read `.cc-flow/CODEBASE.md` if it exists. This provides architecture, conventions, and testing patterns so you plan with the codebase, not against it.

If `CODEBASE.md` does not exist:

```
No CODEBASE.md found. For large features, codebase context improves plan quality significantly.
Run map-codebase first? Or proceed without it?
```

Suggest `map-codebase` but don't block on it.

### 2. Gather Requirements

Ask questions until you have full context. **No artificial limit** — the scope dictates the depth. A notification system needs more questions than a config refactor.

Cover these areas (not all will apply every time):

- **Goal**: What exactly are we building and why? What does success look like?
- **Constraints**: Performance targets, browser support, backwards compatibility, deadlines?
- **Preferences**: Patterns to follow, libraries to use or avoid, naming conventions?
- **Existing patterns**: What similar features exist in the codebase? Should this follow the same pattern or break from it?
- **Edge cases**: What happens when things go wrong? Empty states, error handling, concurrency?
- **Dependencies**: External services, APIs, other features that must exist first?
- **Scope boundaries**: What is explicitly NOT part of this feature? Where do we draw the line?
- **Testing expectations**: What level of testing is expected? Integration, unit, e2e?

Ask in natural conversation, not as a checklist dump. Group related questions. Follow up on vague answers.

If the requirements are too vague to plan against, suggest `brainstorm` first:

```
The requirements are still open-ended. Want to brainstorm first to narrow things down,
then come back to planning?
```

### 3. Design the Plan

Break the work into **phases** with clear dependencies.

**Wave structure**: Phases that don't depend on each other share a wave number and can execute in parallel. Phases that depend on earlier work get a higher wave number.

Within each phase, break work into **bite-sized tasks**. Each task should be completable by a single subagent in one pass — small enough to hold fully in context, large enough to be a meaningful unit of work.

Every task must include:
- **Exact file paths**: `create src/services/notify.ts`, `modify src/routes/api.ts` — never vague references
- **Concrete steps**: what to do, with enough code context that an implementer doesn't have to guess
- **Verification**: a command to run or a condition to check

### 4. Save the Plan

Write the plan to `.cc-flow/plans/YYYY-MM-DD-{name}.md` using this format:

```markdown
# [Feature Name]
**Date**: YYYY-MM-DD
**Status**: draft

## Goal
One sentence — what we're building and why.

## Approach
2-3 sentences on architectural direction. Key decisions and their rationale.

## Preferences
- Auto-commit: yes/no (worktree only)
- Pause after groups: yes/no
- Autonomous: yes/no

## Phases

### Phase 1: [Name]
**Wave**: 1 (independent)

#### Task 1.1: [Name]
**Files**: create `path/to/file.ts`, modify `path/to/other.ts`
**Commit**: _(filled during execution)_
- [ ] Step 1: [concrete action with code context]
- [ ] Step 2: [concrete action with code context]
- [ ] Verify: `npm test` or manual description of expected result

#### Task 1.2: [Name]
**Files**: modify `path/to/another.ts`
**Commit**: _(filled during execution)_
- [ ] Step 1: [concrete action]
- [ ] Verify: [verification]

--- checkpoint review ---

### Phase 2: [Name]
**Wave**: 1 (independent — can run parallel with Phase 1)

#### Task 2.1: [Name]
...

--- checkpoint review ---

### Phase 3: [Name]
**Wave**: 2 (depends on Phase 1, Phase 2)

#### Task 3.1: [Name]
...

--- checkpoint review ---

## Notes
- Risks or open questions
- Suggestions for improvement
- Areas where testing would add the most value
```

### 5. Present and Decide

Show the user a summary of the plan (phases, task count, wave structure) and ask:

```
Plan saved to .cc-flow/plans/YYYY-MM-DD-{name}.md

Options:
1. Execute now — start running the plan
2. Save for later — come back to it anytime with cc-flow:execute
3. Edit first — modify the plan, then execute
```

### 6. Gather Session Preferences

If the user chooses to execute, ask these once (don't re-ask during execution):

- **Auto-commit per task?** Only available if a worktree is active. Default: yes in worktree, disabled otherwise.
- **Pause after each task group?** Checkpoint review between phases where you can continue, adjust, or stop. Default: yes.
- **Run autonomously?** No pauses, full execution. Overrides the pause setting. Default: no.

Record preferences in the plan file's `Preferences` section and update status to `ready`.

### 7. Hand Off to Execution

If executing now, invoke `cc-flow:execute` with the plan path. If a worktree would benefit the work and none is active, suggest it:

```
This feature touches multiple files across several phases. A worktree would give you
an isolated branch with safe auto-commits. Set one up with cc-flow:worktree?
```

Suggest, never require.

## Task Granularity Guide

Each task should be:
- **Self-contained**: completable without knowledge of other tasks' implementation details
- **Verifiable**: has a concrete check that confirms success
- **Focused**: touches a small, well-defined set of files
- **Context-light**: an implementer can execute it with just the task spec and relevant CODEBASE.md sections

If a task requires understanding the full plan to implement, it's too big. Break it down further.

## Key Rules

- Plans are markdown files — human-readable, human-editable
- Exact file paths in every task, no vague references
- Wave structure makes parallelism explicit
- Checkpoint reviews between phases keep execution on track
- The user always has final say — on the plan, on execution, on everything
