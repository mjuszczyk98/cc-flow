import { basename } from "path";
import { execSync } from "child_process";

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
        branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
      } catch {}
    }
    const model = d.model?.display_name || d.model?.id || "?";
    const ctx = d.context_window?.used_percentage;
    const fiveH = d.rate_limits?.five_hour?.used_percentage;
    const week = d.rate_limits?.seven_day?.used_percentage;

    const parts = [];

    // Directory
    parts.push(dir);

    // Branch
    if (branch) parts.push(branch);

    // Model
    parts.push(model);

    // Context
    if (ctx != null) parts.push(`ctx:${Math.round(ctx)}%`);

    // Rate limits
    if (fiveH != null) parts.push(`5h:${Math.round(fiveH)}%`);
    if (week != null) parts.push(`7d:${Math.round(week)}%`);

    process.stdout.write(parts.join(" | "));
  } catch {
    process.stdout.write("statusline error");
  }
});
