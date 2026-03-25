---
name: ccf:next
description: "Show what to do next — routing based on current plan state"
---

# What's Next?

Scan `.cc-flow/plans/` to determine the current state and suggest the next action. **Suggest, never auto-execute.**

## Process

1. **Check for plans** — Read all `.md` files in `.cc-flow/plans/`. If the directory doesn't exist or is empty:
   ```
   No plans found. Start with /ccf:plan to plan a feature or task.
   ```

2. **Parse each plan** — Extract from each file:
   - `**Status**:` field (draft / ready / in-progress / complete)
   - Task checkboxes: count `- [x]` (done) vs `- [ ]` (remaining)
   - Current phase and next unchecked task

3. **Apply routing** — Find the most relevant plan and suggest:

   | State | Suggestion |
   |-------|-----------|
   | Only `draft` plans exist | "Plan `{name}` is ready to review. `/ccf:execute` to start, or edit the plan first." |
   | Only `ready` plans exist | "Plan `{name}` is ready. `/ccf:execute` to start." |
   | A plan is `in-progress`, unchecked tasks remain | "Plan `{name}` is in progress ({done}/{total} tasks). Next: Task {X.Y} — `/ccf:execute` to resume." |
   | A plan is `in-progress`, all tasks checked | "All tasks in `{name}` are done. Run `/ccf:review` for a deep review." |
   | All plans are `complete` | "All plans complete. `/ccf:plan` to start something new." |
   | Multiple plans, mixed states | Show a brief summary of each, highlight the `in-progress` one as priority. |

4. **Show context** — For in-progress plans, also show:
   - The name and phase of the next task
   - Whether a worktree is active
   - Any blockers noted in the plan's Notes section

## Key Rules

- **On-demand only** — no STATE.md, no persistent tracking file. State is derived from plan files every time.
- **Suggest, never execute** — show the user what to do, let them decide.
- **Priority**: `in-progress` > `ready` > `draft` > `complete`
- **Keep it brief** — 3-5 lines of output, not a full report.
