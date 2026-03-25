#!/usr/bin/env python3
"""Claude Code statusline: dir, branch, model, context bar, 5h/7d quotas."""
from __future__ import annotations
import json
import subprocess
import sys
from pathlib import Path

# ANSI color helpers
RESET = "\033[0m"
DIM = "\033[2m"
CYAN = "\033[36m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
ORANGE = "\033[38;5;208m"
RED = "\033[31m"
RED_BLINK = "\033[5;31m"


def color_pct(val: float | None, thresholds: tuple[int, int, int] = (40, 60, 85)) -> str:
    if val is None:
        return "?"
    n = round(val)
    low, warn, crit = thresholds
    if n >= crit:
        return f"{RED}{n}%{RESET}"
    if n >= warn:
        return f"{YELLOW}{n}%{RESET}"
    if n >= low:
        return f"{GREEN}{n}%{RESET}"
    return f"{n}%"


def context_bar(used_pct: float) -> str:
    used = max(0, min(100, round(used_pct)))
    filled = used // 10
    bar = "\u2588" * filled + "\u2591" * (10 - filled)
    if used < 50:
        num_color = GREEN
    elif used < 65:
        num_color = YELLOW
    elif used < 80:
        num_color = ORANGE
    else:
        num_color = RED
    return f"{DIM}{bar}{RESET} {num_color}{used}%{RESET}"


def git_branch(cwd: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", "-C", cwd, "--no-optional-locks", "symbolic-ref", "--short", "HEAD"],
            capture_output=True, text=True, timeout=3,
        )
        return result.stdout.strip() or None
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return None


def main() -> None:
    try:
        data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, ValueError):
        data = {}

    cwd = data.get("workspace", {}).get("current_dir") or data.get("cwd", "")
    model = (data.get("model") or {}).get("display_name") or (data.get("model") or {}).get("id", "?")
    ctx_used = (data.get("context_window") or {}).get("used_percentage")
    rate_limits = data.get("rate_limits") or {}
    five_h = (rate_limits.get("five_hour") or {}).get("used_percentage")
    weekly = (rate_limits.get("seven_day") or {}).get("used_percentage")
    vim_mode = (data.get("vim") or {}).get("mode")

    dirname = Path(cwd).name if cwd else "."
    branch = git_branch(cwd) if cwd else None

    parts = [dirname]
    if branch:
        parts.append(f"{CYAN}{branch}{RESET}")
    parts.append(f"\033[38;5;242m{model}{RESET}")
    if ctx_used is not None:
        try:
            parts.append(context_bar(float(ctx_used)))
        except (TypeError, ValueError):
            pass
    parts.append(f"5h:{color_pct(five_h)}")
    parts.append(f"7d:{color_pct(weekly)}")
    if vim_mode:
        parts.append(f"[{vim_mode}]")

    print("  ".join(parts), end="")


if __name__ == "__main__":
    main()
