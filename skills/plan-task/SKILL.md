---
name: plan-task
description: Step-by-step exploratory work — quick fixes, prototyping, iterative development without heavy planning
---

# Plan Task

You are in **task mode** — the "go with the flow" way of working. No heavy upfront planning. Understand what the user wants, do it, see what happens, decide next steps together.

This is not just for small tasks. It's for any work where the path forward reveals itself as you go.

## Use Cases

- **Quick fixes**: broken import, typo, config change (1-3 files)
- **Exploratory work**: "let's see how this API behaves" or "try refactoring this module"
- **Iterative development**: do one thing, evaluate, do the next thing
- **Prototyping**: try ideas without committing to a full architecture

## Codebase Context

Before starting work, check for `.cc-flow/CODEBASE.md`. If it exists, read it — it contains architecture decisions, conventions, and key abstractions that inform how to approach the task. This prevents accidentally breaking patterns or duplicating existing utilities.

If the task touches unfamiliar parts of the codebase and no `CODEBASE.md` exists, consider a quick exploration of the relevant directories before diving in.

## Process

### 1. Understand the Request

Ask what the user wants to accomplish **right now**. Not the grand vision — just the immediate goal.

### 2. Scope Check

Quickly assess which mode fits:

**Inline** — Small, clear scope. You know exactly what to do.
- Just do it. No questions, no plan file.
- Report what you did and the result.

Examples:
- "Fix the typo in the README" — open file, fix, done.
- "Add `cors` to the Express middleware" — one file, one line, verify server starts.
- "Rename `getUserData` to `fetchUserProfile`" — find-and-replace across the codebase, run tests.

**Light plan** — Needs some thinking. Multiple steps or decisions to make.
- Ask clarifying questions — as many as needed, no artificial limit. Scope dictates depth.
- Think through the approach in conversation (not in a plan file).
- Execute once aligned.

Examples:
- "Add input validation to the signup form" — which fields? What rules? Client-side, server-side, or both? Then implement.
- "Refactor the database module to use connection pooling" — discuss pool size, error handling, migration approach. Then execute step by step.
- "Add dark mode support to the settings page" — CSS variables vs. class toggling? Persist preference where? Then build it.

**Escalate** — Turns out this is bigger than expected. Multi-phase, architectural impact, lots of unknowns.
- Tell the user: "This is growing beyond task-mode scope. Want to switch to `plan-feature`?"
- The user decides. If they say "keep going," keep going. Task mode can handle complex work — it's just less structured.

Examples:
- User asks to "add notifications" and it turns out you need a new service, database table, WebSocket integration, and UI components.
- A "simple refactor" reveals the module is deeply coupled to 15 other files.
- "Add OAuth support" — multiple providers, token management, session handling, UI flows.

### 3. Execute

- Work through the task step by step
- For light plans, explain what you're about to do before doing it
- For inline tasks, just do the work and summarize after
- Run tests, linters, or builds as appropriate to verify your changes

### 4. Handle Failures

When something goes wrong during execution:

- **Test failure**: Read the error output carefully. Fix the root cause, not the symptom. Re-run tests to confirm.
- **Build failure**: Check if your changes caused it or if it was pre-existing. Fix what you broke; flag pre-existing issues to the user.
- **Unexpected complexity**: If a step reveals the task is harder than expected, pause and tell the user. Options: simplify scope, switch approach, or escalate to `plan-feature`.
- **Conflicting requirements**: If your change breaks something else, explain the trade-off and let the user decide.

Never silently skip a failing step. If you can't fix it, report it clearly and suggest next steps.

### 5. What's Next?

After completing the current task, ask: **"What's next?"**

This supports the iterative flow:
- User might have a follow-up task
- User might want to change direction based on results
- User might be done
- If complexity has grown, suggest escalating to `plan-feature`

## Key Behaviors

**No plan file for inline or light tasks.** The conversation is the plan. If the user wants to save the approach for later, create a plan file on request — but don't default to it.

**Escalation is a suggestion, not a wall.** If mid-work you realize this is complex, flag it. But if the user says "keep going," respect that. You can always escalate later.

**Never force structure.** If the user says "just do it" — just do it. Skip questions, skip scope checks, execute. You can always suggest structure afterward if something went wrong.

**Iterative by nature.** Each cycle is: understand -> do -> report -> "what's next?" Keep this loop tight.

**Worktree when useful.** Even for single tasks, if the user wants isolation (risky change, experimental work), suggest `worktree`. Don't require it.

**Leverage CODEBASE.md.** When it exists, use it to understand naming conventions, architectural patterns, and where things live. This avoids wasted exploration time and keeps changes consistent with the project.

## Tone

- Direct and action-oriented
- Minimal ceremony — get to the work quickly
- Suggest structure only when it would genuinely help
- "Let's try it and see" over "let's plan it perfectly first"
