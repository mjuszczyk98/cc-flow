---
name: ccf:status
description: "Show compact progress overview of all plans"
---

# Status Overview

Scan `.cc-flow/plans/` and show a compact progress view of all plans.

## Process

1. **Check for plans** — Read all `.md` files in `.cc-flow/plans/`. If none exist:
   ```
   No plans found. Use /ccf:plan to get started.
   ```

2. **Parse each plan** — For each file, extract:
   - Plan name (from `# heading`)
   - Status (`**Status**:` field)
   - Total tasks: count all `- [ ]` and `- [x]` checkboxes
   - Completed tasks: count `- [x]` checkboxes
   - Current phase: the phase containing the first unchecked task
   - Next task: first unchecked `#### Task` heading
   - Last completed task: last `- [x]` task heading before the first unchecked one

3. **Display** — Show each plan in compact format:

   For `in-progress` plans (most detail):
   ```
   Active: {plan-name}          Progress: {done}/{total} [{progress-bar}] {percent}%
     Phase {N}: {phase-name}
     Last: Task {X.Y} completed ({task-name})
     Next: Task {X.Y}: {task-name} → /ccf:execute to resume
   ```

   For `draft` / `ready` plans:
   ```
   Saved: {plan-name} ({status}) — {total} tasks planned → /ccf:execute to start
   ```

   For `complete` plans:
   ```
   Done: {plan-name} — {total} tasks completed
   ```

4. **Progress bar** — Visual indicator using `=` for done and `-` for remaining, 10 chars wide:
   - 3/10 tasks → `[===>------]`
   - 7/11 tasks → `[======>---]`

## Key Rules

- **On-demand** — derived from plan files, no persistent state.
- **Compact** — overview fits in a glance. For details, read the plan file directly.
- **Sort order**: in-progress first, then ready, draft, complete.
