# Status Line Example

A custom Claude Code status line with colored context bar, rate limit indicators, and git branch display.

## Output

```
cc-flow  main  Opus  ██████░░░░ 60%  5h:32%  7d:12%
```

- Context bar changes color: green → yellow → orange → blinking red
- Rate limits (5h/7d): no color → green → yellow → red based on usage
- Branch shown in cyan, model dimmed
- Vim mode shown when active

## Segments

| Segment | Source | Always shown |
|---------|--------|:---:|
| Directory | `cwd` / `workspace.current_dir` | Yes |
| Branch | git / `worktree.branch` | When available |
| Model | `model.display_name` | Yes |
| Context | `context_window.used_percentage` | When available |
| 5h limit | `rate_limits.five_hour.used_percentage` | Yes (? if unavailable) |
| 7d limit | `rate_limits.seven_day.used_percentage` | Yes (? if unavailable) |
| Vim mode | `vim.mode` | When active |

Rate limits are only available for Claude.ai Pro/Max subscribers after the first API response.

## Variants

Three identical implementations — pick whichever fits your system:

| File | Runtime | Command |
|------|---------|---------|
| `statusline.mjs` | Node.js | `node ~/.claude/statusline.mjs` |
| `statusline.py` | Python 3 | `python3 ~/.claude/statusline.py` |
| `statusline.sh` | Shell + jq | `sh ~/.claude/statusline.sh` |

## Setup

1. Copy your preferred variant to `~/.claude/`
2. Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/statusline.mjs"
  }
}
```

Replace the command with your chosen variant.

## Requirements

- **Node.js variant**: Node.js (no dependencies)
- **Python variant**: Python 3.10+ (no dependencies)
- **Shell variant**: POSIX shell + `jq` + `git`
