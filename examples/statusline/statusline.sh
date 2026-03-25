#!/bin/sh
# Claude Code statusline: dir, branch, model, context bar, 5h/7d quotas.
# Requires: jq, git
input=$(cat)

cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // "."')
model=$(echo "$input" | jq -r '.model.display_name // .model.id // "?"')
ctx=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
five_h=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
weekly=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')
vim_mode=$(echo "$input" | jq -r '.vim.mode // empty')

dirname=$(basename "$cwd")

# Git branch
branch=""
if git -C "$cwd" rev-parse --git-dir > /dev/null 2>&1; then
    branch=$(git -C "$cwd" --no-optional-locks symbolic-ref --short HEAD 2>/dev/null)
fi

# ANSI colors
RST="\033[0m"
DIM="\033[2m"
CYAN="\033[36m"
GRN="\033[32m"
YEL="\033[33m"
ORG="\033[38;5;208m"
RED="\033[31m"
RBL="\033[5;31m"

# Color a percentage: color_pct <value> <low> <warn> <crit>
color_pct() {
    val="$1"; low="$2"; warn="$3"; crit="$4"
    if [ -z "$val" ]; then printf "?"; return; fi
    n=$(printf "%.0f" "$val")
    if [ "$n" -ge "$crit" ]; then printf "${RED}%d%%${RST}" "$n"
    elif [ "$n" -ge "$warn" ]; then printf "${YEL}%d%%${RST}" "$n"
    elif [ "$n" -ge "$low" ]; then printf "${GRN}%d%%${RST}" "$n"
    else printf "%d%%" "$n"
    fi
}

# Context bar: filled blocks + empty blocks, colored by severity
context_bar() {
    used=$(printf "%.0f" "$1")
    [ "$used" -lt 0 ] 2>/dev/null && used=0
    [ "$used" -gt 100 ] 2>/dev/null && used=100
    filled=$((used / 10))
    empty=$((10 - filled))
    bar=""
    i=0; while [ "$i" -lt "$filled" ]; do bar="${bar}█"; i=$((i+1)); done
    i=0; while [ "$i" -lt "$empty" ]; do bar="${bar}░"; i=$((i+1)); done
    if [ "$used" -lt 50 ]; then ncolor="$GRN"
    elif [ "$used" -lt 65 ]; then ncolor="$YEL"
    elif [ "$used" -lt 80 ]; then ncolor="$ORG"
    else ncolor="$RED"
    fi
    printf "${DIM}%s${RST} ${ncolor}%d%%${RST}" "$bar" "$used"
}

# Build output
parts="$dirname"

if [ -n "$branch" ]; then
    parts="$parts  ${CYAN}${branch}${RST}"
fi

parts="$parts  \033[38;5;242m${model}${RST}"

if [ -n "$ctx" ]; then
    parts="$parts  $(context_bar "$ctx")"
fi

parts="$parts  5h:$(color_pct "$five_h" 40 60 85)"
parts="$parts  7d:$(color_pct "$weekly" 40 60 85)"

if [ -n "$vim_mode" ]; then
    parts="$parts  [$vim_mode]"
fi

printf "%b" "$parts"
