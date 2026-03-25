---
name: execute
description: Execute a saved plan by dispatching subagent implementers per task, with wave-based parallelism and checkpoint reviews.
---

# Plan Executor

Execute a plan from `.cc-flow/plans/` by dispatching focused subagents per task. Each subagent gets fresh context — no inherited session history, no context rot.

## When to Use

- A plan exists in `.cc-flow/plans/` and is ready to run
- Invoked directly by `plan-feature` after the user chooses "execute now"
- The user wants to resume or re-run a previously saved plan

## Workflow

### 1. Load the Plan

Read the plan file from `.cc-flow/plans/`. If invoked without a specific plan:

```
Available plans in .cc-flow/plans/:
1. 2026-03-24-notification-system.md (draft)
2. 2026-03-20-auth-refactor.md (in-progress, Phase 2)

Which plan?
```

If the plan status is `in-progress`, offer to resume from where it left off (first unchecked task).

### 2. Review Before Execution

Read the full plan. Raise concerns if you spot issues:

- Tasks that reference files that don't exist (and aren't marked as `create`)
- Missing verification steps
- Dependency ordering that seems wrong
- Tasks that are too large for a single subagent context

If concerns exist, present them and let the user decide whether to adjust or proceed.

### 3. Load Session Preferences

Check the plan's `Preferences` section. If preferences aren't set (plan came from outside `plan-feature`), ask the user once:

- **Auto-commit per task?** Only if worktree active. Otherwise disabled — framework never touches git without a worktree.
- **Pause after each task group?** Default: yes.
- **Run autonomously?** Default: no.

### 4. Analyze Waves

Group phases by wave number. Within a wave, all phases are independent and their tasks can run in parallel. Across waves, execute sequentially.

```
Execution order:
  Wave 1: Phase 1 (3 tasks), Phase 2 (2 tasks)  — parallel
  Wave 2: Phase 3 (4 tasks)                      — after Wave 1
  Wave 3: Phase 4 (2 tasks)                      — after Wave 2
```

Update the plan status to `in-progress`.

### 5. Execute Tasks

For each task, dispatch a subagent implementer with precisely crafted context.

**What the subagent receives** (dispatch using the `implementer` agent from `agents/implementer.md`):

- The task spec: name, file paths, steps, verification criteria
- Relevant sections from `.cc-flow/CODEBASE.md` (conventions, patterns, architecture — only what's relevant to the task, not the entire file)
- Phase context: what this task is part of, what came before it in this phase
- Auto-commit instructions: whether to commit after verification, and on which branch
- Scope boundary: explicit instruction to not modify files outside the task spec

**What the subagent does NOT receive**:

- Full session history
- Other phases' details
- Unrelated codebase context

This isolation is intentional. Fresh context per task prevents accumulated confusion and keeps implementers focused.

#### Parallel Execution Within Waves

Tasks within the same wave that belong to different phases are independent — dispatch their subagents in parallel. Tasks within the same phase execute sequentially (they may depend on each other implicitly through shared files).

#### Handling Subagent Results

When a subagent completes:

1. Read its report: what was done, what was verified, any issues
2. Mark the task's checkboxes as completed in the plan file
3. If the subagent flagged issues or deviations, note them and decide:
   - Minor deviation: log it, continue
   - Significant issue: pause execution, surface to user
   - Blocker: stop execution, surface to user

### 6. Deviation Rules

When executing a task, the implementer may encounter situations not anticipated by the plan. Apply these rules:

**Auto-fix (don't ask, just do and note in the report):**
- Broken imports or missing dependencies — fix them
- Missing null/error checks the plan didn't anticipate — add them
- Typos in names that don't match the plan spec — correct to match
- Minor file path differences (file moved/renamed since plan was written) — adapt

**Pause and ask the user:**
- Task requires modifying files not listed in the plan
- Implementation needs a fundamentally different approach than planned
- New database tables, models, or migrations not in the plan
- Task is significantly larger than estimated
- External dependency or API doesn't behave as the plan assumed

**Rule**: When in doubt, ask. The cost of asking is low; the cost of a wrong autonomous decision is high.

### 7. Checkpoint Review

After each phase (or logical task group) completes, perform a checkpoint:

- **Alignment check**: Are we still following the plan's stated goal and approach?
- **Consistency check**: Does the new code fit the codebase's patterns and conventions?
- **Verification check**: Run the project's build/test commands. Report results.
- **Plan update**: Mark completed tasks in the plan file.

If the user has pauses enabled:

```
--- Checkpoint: Phase 1 complete ---
Tasks completed: 3/3
Verification: tests passing, build clean
Issues: none

Continue to Phase 2? (continue / adjust / stop)
```

If running autonomously, log the checkpoint but don't pause.

### 8. Auto-Commit Behavior

**Worktree active + auto-commit enabled**:
- Commit after each successfully verified task
- Commit message follows the project's existing convention
- Include the task name and phase for traceability
- After committing, write the short commit hash back into the plan file's `**Commit**:` field for the completed task
- Never force-push, never rebase without permission

**No worktree OR auto-commit disabled**:
- Never touch git
- The user handles all commits manually

### 9. Completion

After all tasks are done:

1. Update the plan status to `complete`
2. Summarize what was delivered:
   - Tasks completed vs planned
   - Any deviations from the original plan
   - Verification results
3. Invoke `cc-flow:review` in deep mode for a comprehensive post-execution review

```
Plan complete: .cc-flow/plans/2026-03-24-notification-system.md
  Phases: 4/4
  Tasks:  11/11
  Status: all verifications passing

Running deep review...
```

## Subagent Dispatch

Dispatch tasks using the `implementer` agent (defined in `agents/implementer.md`). The agent definition includes:

- The implementer's role and constraints
- Placeholders for task spec, codebase context, and phase context
- Verification and reporting expectations
- Git behavior rules

Craft each dispatch carefully. Fill in `{{task_spec}}`, `{{codebase_context}}`, and `{{phase_context}}` with the specific context for each task. The quality of the subagent's output depends directly on the quality of its instructions and context.

## Resuming a Plan

If a plan is `in-progress`:

1. Find the first unchecked task
2. Re-read the plan to understand what was already done
3. Run a quick verification to confirm previous work is intact
4. Resume from the first incomplete task

## Key Rules

- Subagents get fresh, focused context — never inherited session history
- Checkpoint reviews keep execution aligned with the plan
- Auto-commit only happens inside worktrees — never in the main tree
- The user can pause, adjust, or stop at any checkpoint
- Evidence before claims — run verification, read output, then report results
- Update the plan file as execution progresses — it's the source of truth
