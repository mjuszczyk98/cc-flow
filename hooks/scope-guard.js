#!/usr/bin/env node
// CC-Flow Scope Guard — PreToolUse hook (Write/Edit only)
// Advisory warning when editing files outside the current plan's scope.
// SOFT guard — advises, never blocks. The edit still proceeds.
//
// Checks if .cc-flow/plans/ has an in-progress plan, extracts file paths
// from it, and warns if the edit target isn't in the plan.

const fs = require('fs');
const path = require('path');

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name;

    // Only guard Write and Edit
    if (toolName !== 'Write' && toolName !== 'Edit') process.exit(0);

    const filePath = data.tool_input?.file_path || data.tool_input?.path || '';
    if (!filePath) process.exit(0);

    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Always allow edits to framework files, config, and docs
    const allowedPatterns = [
      /\.cc-flow[/\\]/,
      /\.gitignore$/,
      /\.env/,
      /CLAUDE\.md$/,
      /settings\.json$/,
      /package\.json$/,
    ];
    if (allowedPatterns.some(p => p.test(filePath))) process.exit(0);

    // Find in-progress plan
    const cwd = data.cwd || process.cwd();
    const plansDir = path.join(cwd, '.cc-flow', 'plans');

    if (!fs.existsSync(plansDir)) process.exit(0);

    let activePlan = null;
    try {
      const plans = fs.readdirSync(plansDir).filter(f => f.endsWith('.md'));
      for (const plan of plans) {
        const content = fs.readFileSync(path.join(plansDir, plan), 'utf8');
        if (content.includes('**Status**: in-progress')) {
          activePlan = { name: plan, content };
          break;
        }
      }
    } catch (e) {
      process.exit(0);
    }

    // No active plan — no guard needed
    if (!activePlan) process.exit(0);

    // Extract file paths from plan (look for backtick-quoted paths)
    const pathMatches = activePlan.content.match(/`([^`]+\.[a-z]{1,5})`/g) || [];
    const planPaths = pathMatches
      .map(m => m.replace(/`/g, '').replace(/\\/g, '/'))
      .filter(p => p.includes('/') || p.includes('.'));

    // Check if the edited file matches any plan path
    const editedFile = normalizedPath.split('/').slice(-3).join('/'); // last 3 segments
    const isInPlan = planPaths.some(pp => {
      const planFile = pp.split('/').slice(-3).join('/');
      return editedFile.includes(planFile) || planFile.includes(editedFile);
    });

    if (isInPlan) process.exit(0);

    // File not in plan — emit advisory warning
    const fileName = path.basename(filePath);
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: `CC-Flow scope note: "${fileName}" is not listed in the active plan (${activePlan.name}). This may be intentional — just flagging it.`
      }
    }));
  } catch (e) {
    // Silent fail — never block edits
    process.exit(0);
  }
});
