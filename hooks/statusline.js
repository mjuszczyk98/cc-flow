#!/usr/bin/env node
// CC-Flow Statusline Hook
// Shows: model | current task | directory | context usage bar
// Adapted from GSD's statusline with CC-Flow simplifications.

const fs = require('fs');
const path = require('path');
const os = require('os');

let input = '';
// Timeout guard: exit silently if stdin hangs (Windows/Git Bash pipe issues)
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const model = data.model?.display_name || 'Claude';
    const dir = data.workspace?.current_dir || process.cwd();
    const session = data.session_id || '';
    const remaining = data.context_window?.remaining_percentage;

    // Context window display
    // Claude Code reserves ~16.5% for autocompact buffer
    const AUTO_COMPACT_BUFFER_PCT = 16.5;
    let ctx = '';
    if (remaining != null) {
      const usableRemaining = Math.max(0, ((remaining - AUTO_COMPACT_BUFFER_PCT) / (100 - AUTO_COMPACT_BUFFER_PCT)) * 100);
      const used = Math.max(0, Math.min(100, Math.round(100 - usableRemaining)));

      // Write bridge file for context-monitor hook
      if (session) {
        try {
          const bridgePath = path.join(os.tmpdir(), `cc-flow-ctx-${session}.json`);
          fs.writeFileSync(bridgePath, JSON.stringify({
            session_id: session,
            remaining_percentage: remaining,
            used_pct: used,
            timestamp: Math.floor(Date.now() / 1000)
          }));
        } catch (e) {
          // Silent fail — bridge is best-effort
        }
      }

      // Build progress bar (10 segments)
      const filled = Math.floor(used / 10);
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

      // Color based on usable context thresholds
      if (used < 50) {
        ctx = ` \x1b[32m${bar} ${used}%\x1b[0m`;
      } else if (used < 65) {
        ctx = ` \x1b[33m${bar} ${used}%\x1b[0m`;
      } else if (used < 80) {
        ctx = ` \x1b[38;5;208m${bar} ${used}%\x1b[0m`;
      } else {
        ctx = ` \x1b[5;31m${bar} ${used}%\x1b[0m`;
      }
    }

    // Current task from todos
    let task = '';
    const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
    const todosDir = path.join(claudeDir, 'todos');
    if (session && fs.existsSync(todosDir)) {
      try {
        const files = fs.readdirSync(todosDir)
          .filter(f => f.startsWith(session) && f.includes('-agent-') && f.endsWith('.json'))
          .map(f => ({ name: f, mtime: fs.statSync(path.join(todosDir, f)).mtime }))
          .sort((a, b) => b.mtime - a.mtime);

        if (files.length > 0) {
          const todos = JSON.parse(fs.readFileSync(path.join(todosDir, files[0].name), 'utf8'));
          const inProgress = todos.find(t => t.status === 'in_progress');
          if (inProgress) task = inProgress.activeForm || '';
        }
      } catch (e) {
        // Silent fail
      }
    }

    // Detect worktree
    let branch = '';
    try {
      const headPath = path.join(dir, '.git', 'HEAD');
      if (fs.existsSync(headPath)) {
        const head = fs.readFileSync(headPath, 'utf8').trim();
        const match = head.match(/ref: refs\/heads\/(.+)/);
        if (match) branch = match[1];
      }
    } catch (e) {}

    // Build output
    const dirname = path.basename(dir);
    const parts = [
      `\x1b[2m${model}\x1b[0m`
    ];
    if (task) parts.push(`\x1b[1m${task}\x1b[0m`);
    if (branch && branch !== 'main' && branch !== 'master') {
      parts.push(`\x1b[36m${branch}\x1b[0m`);
    }
    parts.push(`\x1b[2m${dirname}\x1b[0m`);

    process.stdout.write(parts.join(' │ ') + (ctx || ''));
  } catch (e) {
    // Silent fail
  }
});
