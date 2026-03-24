# Status Line Example

A custom Claude Code status line showing directory, branch, model, context usage, and rate limits.

## Output

```
cc-harness | main | Opus | ctx:43% | 5h:15% | 7d:9%
```

## Segments

| Segment | Source | Always shown |
|---------|--------|:---:|
| Directory | `cwd` | Yes |
| Branch | `worktree.branch` | When available |
| Model | `model.display_name` | Yes |
| Context | `context_window.used_percentage` | When available |
| 5h limit | `rate_limits.five_hour.used_percentage` | When available |
| 7d limit | `rate_limits.seven_day.used_percentage` | When available |

Rate limits are only available for Claude.ai Pro/Max subscribers after the first API response.

## Setup

1. Copy `statusline.mjs` to `~/.claude/statusline.mjs`
2. Add to your `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/statusline.mjs"
  }
}
```

## Requirements

- Node.js (no additional dependencies)
