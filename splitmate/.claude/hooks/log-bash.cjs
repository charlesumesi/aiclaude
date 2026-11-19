// PreToolUse hook: appends every Bash command Claude runs to .claude/bash-history.log.
// Format: [YYYY-MM-DD HH:MM:SS] <command>  (local time; extra lines of a multi-line command are indented)
// Always exits 0 so logging can never block a command.
const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  try {
    const command = JSON.parse(input)?.tool_input?.command;
    if (!command) return;
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    const text = command.replace(/\r?\n/g, '\n    ');
    const dir = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
    fs.appendFileSync(path.join(dir, '.claude', 'bash-history.log'), `[${stamp}] ${text}\n`);
  } catch {
    // never block the tool call
  }
});
