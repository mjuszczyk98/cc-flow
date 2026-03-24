#!/usr/bin/env node
// CC-Flow Context Monitor — PostToolUse hook
// Reads context metrics from the statusline bridge file and injects
// warnings when context usage is high. Makes the AGENT aware of
// context limits (the statusline only shows the user).
//
// How it works:
// 1. The statusline hook writes metrics to $TMPDIR/cc-flow-ctx-{session_id}.json
// 2. This hook reads those metrics after each tool use
// 3. When remaining context drops below thresholds, it injects a warning
//
// Thresholds:
//   WARNING  (remaining <= 35%): Agent should wrap up current task
//   CRITICAL (remaining <= 25%): Agent should stop and inform user
//
// Debounce: 5 tool uses between warnings to avoid spam
// Severity escalation bypasses debounce (WARNING -> CRITICAL fires immediately)

const fs = require('fs');
const os = require('os');
const path = require('path');

const WARNING_THRESHOLD = 35;
const CRITICAL_THRESHOLD = 25;
const STALE_SECONDS = 60;
const DEBOUNCE_CALLS = 5;

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 10000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const sessionId = data.session_id;

    if (!sessionId) process.exit(0);

    const tmpDir = os.tmpdir();
    const metricsPath = path.join(tmpDir, `cc-flow-ctx-${sessionId}.json`);

    // No metrics file = subagent or fresh session
    if (!fs.existsSync(metricsPath)) process.exit(0);

    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    const now = Math.floor(Date.now() / 1000);

    // Ignore stale metrics
    if (metrics.timestamp && (now - metrics.timestamp) > STALE_SECONDS) {
      process.exit(0);
    }

    const remaining = metrics.remaining_percentage;
    const usedPct = metrics.used_pct;

    // No warning needed
    if (remaining > WARNING_THRESHOLD) process.exit(0);

    // Debounce check
    const warnPath = path.join(tmpDir, `cc-flow-ctx-${sessionId}-warned.json`);
    let warnData = { callsSinceWarn: 0, lastLevel: null };
    let firstWarn = true;

    if (fs.existsSync(warnPath)) {
      try {
        warnData = JSON.parse(fs.readFileSync(warnPath, 'utf8'));
        firstWarn = false;
      } catch (e) {}
    }

    warnData.callsSinceWarn = (warnData.callsSinceWarn || 0) + 1;

    const isCritical = remaining <= CRITICAL_THRESHOLD;
    const currentLevel = isCritical ? 'critical' : 'warning';

    // Severity escalation bypasses debounce
    const severityEscalated = currentLevel === 'critical' && warnData.lastLevel === 'warning';
    if (!firstWarn && warnData.callsSinceWarn < DEBOUNCE_CALLS && !severityEscalated) {
      fs.writeFileSync(warnPath, JSON.stringify(warnData));
      process.exit(0);
    }

    // Reset debounce
    warnData.callsSinceWarn = 0;
    warnData.lastLevel = currentLevel;
    fs.writeFileSync(warnPath, JSON.stringify(warnData));

    // Build advisory warning
    let message;
    if (isCritical) {
      message = `CONTEXT CRITICAL: Usage at ${usedPct}%. Remaining: ${remaining}%. ` +
        'Context is nearly exhausted. Inform the user that context is low and ask how they ' +
        'want to proceed. Finish the current task if possible, avoid starting new work.';
    } else {
      message = `CONTEXT WARNING: Usage at ${usedPct}%. Remaining: ${remaining}%. ` +
        'Context is getting limited. Avoid unnecessary exploration or starting new complex work. ' +
        'Consider wrapping up the current task group.';
    }

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: message
      }
    }));
  } catch (e) {
    // Silent fail — never block tool execution
    process.exit(0);
  }
});
