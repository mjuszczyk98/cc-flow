import { basename } from "path";
import { execSync } from "child_process";

// Color helpers
const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  orange: "\x1b[38;5;208m",
  red: "\x1b[31m",
  redBlink: "\x1b[5;31m",
};

function colorPct(val, thresholds = [40, 60, 85]) {
  if (val == null) return "?";
  const n = Math.round(val);
  const [low, warn, crit] = thresholds;
  if (n >= crit) return `${C.red}${n}%${C.reset}`;
  if (n >= warn) return `${C.yellow}${n}%${C.reset}`;
  if (n >= low) return `${C.green}${n}%${C.reset}`;
  return `${n}%`;
}

function contextBar(usedPct) {
  const used = Math.max(0, Math.min(100, Math.round(usedPct)));
  const filled = Math.floor(used / 10);
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(10 - filled);
  let numColor;
  if (used < 50) numColor = C.green;
  else if (used < 65) numColor = C.yellow;
  else if (used < 80) numColor = C.orange;
  else numColor = C.red;
  return `${C.dim}${bar}${C.reset} ${numColor}${used}%${C.reset}`;
}

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const d = JSON.parse(input);

    const cwd = d.cwd || d.workspace?.current_dir || ".";
    const dir = basename(cwd);
    let branch = d.worktree?.branch || "";
    if (!branch) {
      try {
        branch = execSync("git rev-parse --abbrev-ref HEAD", {
          cwd,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        }).trim();
      } catch {}
    }
    const model = d.model?.display_name || d.model?.id || "?";
    const ctx = d.context_window?.used_percentage;
    const fiveH = d.rate_limits?.five_hour?.used_percentage;
    const week = d.rate_limits?.seven_day?.used_percentage;
    const vim = d.vim?.mode;

    const parts = [];
    parts.push(dir);
    if (branch) parts.push(`${C.cyan}${branch}${C.reset}`);
    parts.push(`\x1b[38;5;242m${model}${C.reset}`);
    if (ctx != null) parts.push(contextBar(ctx));
    parts.push(`5h:${colorPct(fiveH)}`);
    parts.push(`7d:${colorPct(week)}`);
    if (vim) parts.push(`[${vim}]`);

    process.stdout.write(parts.join("  "));
  } catch {
    process.stdout.write("statusline error");
  }
});
