---
name: review
description: Two-tier review skill — checkpoint reviews during execution and deep reviews after plan completion.
---

# Review Skill

This skill provides two tiers of review. Use Tier 1 after each phase or task group. Use Tier 2 after all planned work is complete.

---

## When to Use Which Tier

- **Tier 1 (Checkpoint):** Invoked during execution, after completing a phase or group of tasks. This is a quick sanity check to catch drift early. Use this when the `execute` skill triggers a review mid-plan.
- **Tier 2 (Deep Review):** Invoked after ALL tasks in a plan are complete — full plan completion. This is the comprehensive end-of-work verification. Use this when `execute` signals that every task is done.
- **Default (Standalone):** If this skill is invoked directly by the user (not from within `execute`), ask which tier they want. Example prompt: *"Would you like a quick checkpoint review (Tier 1) or a full deep review (Tier 2)?"*

---

## Tier 1: Checkpoint Review

**When:** After completing a phase or logical group of tasks.

This is a lightweight, fast, inline check. Do not produce a file — report directly in conversation.

### Steps

1. **Plan alignment** — Compare completed tasks against the plan. Are we on track? Any drift?
2. **Architecture consistency** — Do the changes follow established patterns and conventions in the codebase?
3. **Build/test verification** — Run the build. Run tests if they exist. Check exit codes.
4. **Flag deviations** — Note anything that diverged from the plan and why.
5. **Missing tests** — If tests were planned for this phase but not written, flag it now.

### Output

A brief inline status:

```
Checkpoint: [phase/group name]
- Plan alignment: on track / drifted (details)
- Build: pass / FAIL
- Tests: pass / not run / FAIL
- Recommendation: continue / adjust / STOP
```

**If the build fails: STOP. Diagnose before continuing.**

---

## Tier 2: Deep Review

**When:** After ALL tasks in the plan are complete.

This is a comprehensive, end-to-end verification. Report in conversation only — do NOT create a review file.

### Verification Protocol

Never claim completion without fresh evidence.

1. **IDENTIFY** — What command proves this claim?
2. **RUN** — Execute the full command. Fresh, complete, no caching.
3. **READ** — Full output. Check the exit code.
4. **VERIFY** — Does the output actually confirm the claim?
5. **ONLY THEN** — State the claim, with evidence.

### Steps

1. **Full diff review** — Review `git diff` from the start of work to now. Understand every change.
2. **Plan coverage** — Check every task/checkbox in the plan file. Was it completed?
3. **Test verification**
   - Were planned tests written? Do they pass?
   - If tests were NOT planned: suggest where tests would add value. Do not force it, just suggest.
4. **End-to-end verification** — Run the full test suite, build, and linter. Check all exit codes.
5. **Code quality scan** — Check for:
   - Unused imports
   - Dead code
   - Inconsistencies between new files
   - Patterns that don't match the rest of the codebase
6. **Goal validation** — Re-read the stated Goal from the plan. Does the implementation actually achieve it?

### Output Format

```
## Review Summary

### Changes Made
- Created `path/to/file` (description)
- Modified `path/to/file` (description)

### Verification
- Tests: X/Y passing (Z new)
- Build: clean / issues
- Linter: clean / issues

### Plan Coverage
- [x] Task 1: description
- [x] Task 2: description
- [ ] Task 3: skipped — reason

### Suggestions
- Consider adding tests for X
- Documentation update recommended for Y
```

### Completion Rules

- Do NOT mark the plan as complete if any verification step fails.
- Only update the plan file status to "complete" after the deep review passes all checks.
- If anything fails, report what failed and what needs to be fixed before completion.
