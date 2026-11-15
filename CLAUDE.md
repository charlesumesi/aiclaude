# CLAUDE.md (aiclaude workspace)

Applies to every project under `aiclaude/`. Project-specific guidance lives in each project's own CLAUDE.md (e.g. `splitmate/CLAUDE.md`).

## Explaining code and keeping the skills log

When the user asks how something works, or you explain a technique, algorithm or concept:

1. **Explain it in the explain-code format** (the `explain-code` skill, `C:\Users\Temp\.claude\skills\explain-code\SKILL.md`):
   1. **Analogy**: compare it to something from everyday life.
   2. **Diagram**: ASCII art showing the flow, structure or relationships.
   3. **Walkthrough**: step by step, what happens.
   4. **Gotcha**: a common mistake or misconception.
   Keep it conversational.
2. **Then append an entry to `C:\Users\Temp\aiclaude\skills\SKILLS.md`** without being asked. Create the file if it's missing. Use the same four parts, under a `## <Skill name>` heading followed by an italic line: `*YYYY-MM-DD · <project> · <source file>*`. Follow the existing entries' layout, and separate entries with `---`.
3. If the skill already has an entry, update that entry instead of adding a duplicate.
4. In your reply, say in one line that the entry was added or updated.

Don't log trivial answers (a one-line fact or a command name). Only log explanations of how something works.
