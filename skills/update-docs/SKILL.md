---
name: update-docs
description: Review recent changes and suggest documentation updates. Entirely optional — only runs when explicitly invoked.
---

# Update Docs Skill

This skill reviews recent changes and suggests documentation that may need updating. It is 100% optional and never auto-triggers.

---

## Process

### 1. Determine the Diff

Figure out what changed. Use the most appropriate method:

- **After a plan execution**: `git diff main...HEAD` (or whatever the base branch is) to see all changes on the feature branch.
- **After a single task**: `git diff HEAD~1` or `git diff --cached` if changes are staged but not committed.
- **Manual invocation**: Ask the user what scope to review. Options:
  - "Since last commit" (`git diff HEAD`)
  - "Since branching" (`git diff main...HEAD`)
  - "Specific commits" (`git diff <sha1>..<sha2>`)
  - "All uncommitted changes" (`git diff` + `git diff --cached`)

If there is no git history (new project), review all files and focus on whether initial documentation matches the actual implementation.

### 2. Identify Documentation Candidates

Check whether any of the following need updates based on the changes:

| Document | Update when... |
|---|---|
| **README.md** | New features, changed setup steps, changed APIs, new dependencies |
| **API docs** | New endpoints, changed parameters, changed responses |
| **Inline comments** | Complex logic was added or substantially changed |
| **Config docs** | New environment variables, new config options, changed defaults |
| **CHANGELOG** | Any user-facing change (only if a CHANGELOG already exists) |
| **CODEBASE.md** | Architecture or conventions changed (suggest refreshing via map-codebase) |

### 3. Concrete Examples of What to Update

Here are typical scenarios and what documentation they affect:

- **New API endpoint added** — Update API docs with route, method, parameters, request/response examples. Update README if it lists available endpoints.
- **New environment variable** — Add to README's configuration section, `.env.example` if it exists, and any deployment docs.
- **Dependency added/removed** — Update README's prerequisites or installation section. Note version requirements if relevant.
- **Breaking change to existing API** — Update API docs, add migration notes, update CHANGELOG if it exists.
- **New CLI command or flag** — Update README's usage section or dedicated CLI docs.
- **Refactored module structure** — Update any architecture docs. If `CODEBASE.md` exists, suggest a refresh.
- **Changed build/test process** — Update README's development section, CI docs, contributing guide.

### 4. When to Suggest CODEBASE.md Refresh

If `.cc-flow/CODEBASE.md` exists, suggest running `map-codebase` to refresh it when:

- New top-level directories or modules were created
- Architectural patterns changed (e.g., switched from callbacks to async/await)
- Key abstractions were added, renamed, or removed
- Conventions changed (naming, file organization, error handling approach)
- Major dependencies were added or replaced

Do not suggest a refresh for minor changes (bug fixes, small features within existing patterns). The threshold is: "Would a new developer's mental model of the codebase be wrong without this update?"

### 5. Present Findings

Report to the user in conversation:

```
These docs may need updating:
- README.md — new setup step for X
- API docs — new endpoint /api/foo added
- CHANGELOG — new feature Y
```

If nothing needs updating, say so. Don't force documentation changes for trivial modifications.

### 6. Update Only What Is Approved

Wait for the user to confirm which updates to make. Then apply only those.

---

## Rules

- **Never auto-trigger.** Only run when the user explicitly invokes this skill.
- **Don't create what doesn't exist.** If the project has no CHANGELOG, don't add one. If there are no API docs, don't create them.
- **Don't over-document.** Only suggest updates where documentation genuinely helps someone. Skip trivial or obvious changes.
- **Follow existing style.** Match the format, tone, and conventions of the project's existing documentation.
- **If CODEBASE.md exists** and the changes affect architecture or conventions, suggest refreshing it with the map-codebase skill rather than manually editing it.
- **Prefer accuracy over completeness.** It is better to update fewer docs correctly than to shotgun updates everywhere. Wrong documentation is worse than missing documentation.
