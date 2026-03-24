---
name: worktree
description: Create an isolated git worktree for feature work — separate branch, clean environment, safe auto-commits.
---

# Worktree Management

Create a git worktree so feature work happens on an isolated branch. This keeps `main` clean and enables auto-commit per task.

## When to Use

- Multi-task feature work that benefits from isolation
- When `plan-feature` or `plan-task` suggests it
- When the user wants safe auto-commit behavior

**Never force this.** Both `plan-feature` and `plan-task` may suggest a worktree, but the user decides. If they say no, move on.

## Workflow

### 1. Determine Worktree Directory

Check these locations in order and use the first that exists:

1. `.worktrees/` in the project root
2. `worktrees/` in the project root
3. A `worktree_dir` preference in the project's `CLAUDE.md`
4. If none found — ask the user where they want worktrees stored

### 2. Verify Git-Ignore Safety

Before creating anything, confirm the worktree directory is listed in `.gitignore`. If it is not:

```
The worktree directory "{dir}" is not in .gitignore.
Add it now? (Recommended — worktree contents should never be committed to the parent repo.)
```

Add the entry if the user agrees. Do not proceed without confirmation.

### 3. Create the Worktree

```bash
# Create worktree with a new feature branch
git worktree add {worktree_dir}/{branch-name} -b {branch-name}
```

Branch naming: use the feature/task name as the branch name. Keep it short and descriptive (e.g., `feature/notification-system`, `fix/auth-import`).

If the branch already exists, attach to it instead of creating a new one:

```bash
git worktree add {worktree_dir}/{branch-name} {branch-name}
```

### 4. Initialize Environment

Inside the new worktree:

1. **Install dependencies** — detect the package manager and run install (`npm install`, `pip install -r requirements.txt`, `cargo build`, etc.)
2. **Verify clean baseline** — run the project's test suite or build command to confirm the worktree starts healthy
3. **Report status** — tell the user the worktree is ready and where it lives

```
Worktree ready:
  Path:   {worktree_dir}/{branch-name}
  Branch: {branch-name}
  Base:   {current-branch}
  Tests:  passing ✓
```

### 5. Auto-Commit Behavior

When a worktree is active:

- **Auto-commit per task is enabled by default** — each completed task gets a commit on the feature branch
- Commit messages follow the project's existing convention
- The user can disable this at any time ("stop auto-committing")
- Never force-push. Never rebase without explicit permission.

## Cleanup

When feature work is complete:

```bash
# From the main repo
git worktree remove {worktree_dir}/{branch-name}
```

Remind the user to merge or PR the feature branch before cleanup.

## Built-in Worktree Tools

Claude Code provides built-in `EnterWorktree` and `ExitWorktree` tools that can be used as an alternative to raw git commands. When these tools are available, prefer using them — they handle the worktree lifecycle (creation, switching, cleanup) with proper integration into the Claude Code session. Fall back to raw `git worktree` commands only if the built-in tools are unavailable or insufficient for the specific use case.

## Key Rules

- Worktrees are **suggested, never required**
- Always verify git-ignore before creating
- Always verify the environment is healthy before starting work
- Auto-commit is a convenience — the user can override at any time
- If worktree creation fails, fall back gracefully to working in the main tree
