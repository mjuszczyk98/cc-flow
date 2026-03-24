---
name: map-codebase
description: Analyze a codebase and produce a structured CODEBASE.md — stack, architecture, conventions, testing patterns, and concerns.
---

# Codebase Mapper

Build a shared understanding of the codebase by dispatching two parallel subagents, then merging their findings into `.cc-flow/CODEBASE.md`.

## When to Use

- Before the first `plan-feature` in a new or unfamiliar codebase
- When `CODEBASE.md` is stale or missing
- When the user asks to refresh codebase understanding

## When to Skip

- Quick fixes or small tasks — just read what you need
- Small codebases (<10 files) — you can understand these inline
- `CODEBASE.md` exists and is recent (check the timestamp at the top)

## Workflow

### 1. Prepare

Ensure `.cc-flow/` directory exists. If `CODEBASE.md` already exists, note the date and ask:

```
CODEBASE.md was last generated on {date}. Regenerate or keep it?
```

### 2. Dispatch Subagents

Launch **2 parallel `codebase-mapper` agents** (defined in `agents/codebase-mapper.md`), each with a different focus area:

| Agent | Focus Area | Covers |
|-------|-----------|--------|
| Structure Agent | `structure` | Stack, architecture, directory layout, integrations |
| Quality Agent | `quality` | Conventions, testing patterns, concerns/tech debt |

Dispatch each using the Agent tool with the `codebase-mapper` agent definition. Include the focus area assignment in the agent's prompt.

### 3. Merge Results

Combine both agents' output into a single `.cc-flow/CODEBASE.md` with this structure:

```markdown
# Codebase Map
> Generated: {date} | Project: {name}

## Stack
{technologies, languages, frameworks, versions}

## Architecture
{high-level patterns, data flow, key abstractions}

## Structure
{directory layout with descriptions of what lives where}

## Conventions
{naming, formatting, patterns — prescriptive rules, not observations}

## Testing
{test framework, patterns, coverage expectations, how to run}

## Concerns
{tech debt, risks, areas needing attention}

## Integrations
{external services, APIs, databases, third-party dependencies}
```

### 4. Confirm

Show the user a brief summary of what was found. The full details live in the file.

## Philosophy

These principles guide what goes into CODEBASE.md:

- **File paths are critical.** Write `src/services/user.ts`, not "the user service." Every reference must be traceable.
- **Patterns matter more than lists.** Show HOW things are done with code examples, not just WHAT exists.
- **Be prescriptive.** "Use `camelCase` for functions" helps. "Some functions use `camelCase`" does not.
- **Current state only.** No temporal language. Write what IS, not what was or will be.

## Output

Single file: `.cc-flow/CODEBASE.md`

This file is read by other skills (`plan-feature`, `execute`, subagents) to provide shared context without re-exploring the codebase each time.
