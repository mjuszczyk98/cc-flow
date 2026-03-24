# CC-Flow

A lightweight development workflow framework for Claude Code. Combines the best of [Get Shit Done](https://github.com/codewhispers/get-shit-done-cc) and [Superpowers](https://github.com/obra/superpowers) while staying lean.

**CC-Flow is an assistant, not a replacement.** It helps you plan well and maintain good practices without forcing a rigid process.

## What's Inside

- **8 skills** — composable workflow building blocks
- **4 hooks** — statusline, context monitor, session init, scope guard
- **2 subagent prompts** — codebase mapper and task implementer
- **0 runtime dependencies** — pure markdown + bash/node hooks

## Skills

| Skill | Purpose |
|-------|---------|
| `cc-flow:brainstorm` | Explore ideas through interactive Q&A before planning |
| `cc-flow:map-codebase` | Analyze codebase structure, conventions, and patterns |
| `cc-flow:plan-feature` | Thorough multi-phase planning for large features |
| `cc-flow:plan-task` | Step-by-step exploratory work and quick fixes |
| `cc-flow:execute` | Execute plans with subagents and wave-based parallelism |
| `cc-flow:review` | Two-tier review: checkpoint (per group) + deep (full plan) |
| `cc-flow:update-docs` | Update documentation after changes (optional) |
| `cc-flow:worktree` | Create isolated git worktrees for feature work |

## Two Modes of Work

### Feature Mode (structured)
For when you know the destination.

```
brainstorm → map-codebase → plan-feature → execute → review
```

### Task Mode (exploratory)
For when you're discovering as you go.

```
plan-task → do → "What's next?" → repeat
```

## Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| `session-start.sh` | SessionStart | Load framework context |
| `statusline.js` | StatusLine | Show model, task, branch, context usage |
| `context-monitor.js` | PostToolUse | Warn agent when context runs low |
| `scope-guard.js` | PreToolUse | Advisory warning for out-of-plan edits |

## Project Artifacts

CC-Flow stores minimal files in your project:

```
.cc-flow/
├── CODEBASE.md          # Codebase analysis
└── plans/
    └── *.md             # Saved plans (executable later)
```

## Key Principles

- **Git-aware, not git-controlling** — auto-commit only in worktrees
- **No mandatory TDD** — tests suggested, never blocking
- **No over-engineering** — 8 skills vs 57 commands
- **Plans are files** — save now, execute later, edit by hand
- **Evidence over claims** — verify before declaring success
- **Questions without limits** — scope dictates depth

## Installation

### Via Claude Code Plugin System (recommended)

Add this repo as a marketplace and install:

```bash
# Add marketplace
/plugin marketplace add OWNER/cc-flow

# Install globally (all projects)
/plugin install cc-flow@OWNER-cc-flow --scope user

# Or install per project
/plugin install cc-flow@OWNER-cc-flow --scope project
```

### For development/testing

```bash
# Run Claude Code with CC-Flow loaded from local directory
claude --plugin-dir /path/to/cc-flow

# Reload after making changes (no restart needed)
/reload-plugins
```

## Design Influences

**From Get Shit Done:**
- Parallel codebase mapping with structured output
- Wave-based execution for independent tasks
- Thorough questioning process
- Prescriptive documentation philosophy

**From Superpowers:**
- Skill-based composable architecture
- Interactive brainstorming (one question at a time)
- Subagent-per-task execution (fresh context)
- Verification-before-completion philosophy

## License

MIT
