#!/usr/bin/env node
// CC-Flow Session Start Hook
// Loads framework context into Claude's session on startup, clear, or compact.

const fs = require('fs');
const path = require('path');

let input = '';
// Timeout guard: exit silently if stdin hangs (Windows/Git Bash pipe issues)
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    // Use CLAUDE_PLUGIN_ROOT if set (plugin mode), otherwise resolve from script location
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');

    const claudeMdPath = path.join(pluginRoot, 'CLAUDE.md');
    let claudeMdContent;
    try {
      claudeMdContent = fs.readFileSync(claudeMdPath, 'utf8');
    } catch (e) {
      claudeMdContent = 'Error reading CC-Flow CLAUDE.md: ' + e.message;
    }

    const sessionContext = `<CC-FLOW>\nYou have CC-Flow loaded.\n\n${claudeMdContent}\n</CC-FLOW>`;

    // Output context injection as JSON
    // Claude Code reads hookSpecificOutput.additionalContext
    const output = JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: sessionContext
      }
    });

    process.stdout.write(output);
  } catch (e) {
    // Silent fail — output empty JSON so hook doesn't break
    process.stdout.write('{}');
  }
});
