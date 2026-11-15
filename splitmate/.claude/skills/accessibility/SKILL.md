---
name: accessibility
description: Audits and improves the accessibility of a web page or component, following WCAG 2.1 AA standards. Use when the user asks to make a page or component more accessible, or to check for accessibility issues.
when_to_use: "Use after building any form, interactive component, or page to check for accessibility issues. Run before marking a feature done. Not for general styling or layout changes."
---

# Accessibility Skill

## Goal
Every user should be able to use the app, including those with visual, auditory, motor, or cognitive impairments. Follow WCAG 2.1 AA standards to ensure accessibility.

## Audit checklist
For the full checklist, see audit-checklist.md (if file exists).
For "before and after" examples of accessibility fixes, see bad-vs-good.md (if file exists).
Otherwise, follow these guidelines:
See auditing tools like Lighthouse, axe, or WAVE to check for issues. Key areas to review:
- **Color contrast**: Ensure text has sufficient contrast against its background (minimum 4.5:1 for normal text, 3:1 for large text).
- **Keyboard navigation**: All interactive elements must be reachable and operable via keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys).
- **Focus indicators**: Ensure focus is visible on interactive elements (buttons, links, inputs).
- **ARIA roles and labels**: Use appropriate ARIA attributes to convey meaning to assistive technologies. For example, use `aria-label`, `aria-labelledby`, and `aria-describedby` where needed.
- **Form labels**: Every input must have a visible label or an associated `aria-label`.
- **Semantic HTML**: Use proper HTML elements (e.g., `<button>` for buttons, `<a>` for links, `<header>`, `<main>`, `<footer>` for structure).

## Priority order
1. Forms - most interaction happens here, and errors can block users.
2. Buttons and links - ensure all actions are accessible.
3. Error states - screen readers must be able to detect,understand, and announce errors.
4. Headlines - navigation landmark for screen reader users.
5. Color - never the only indicator of information or state (e.g., errors, required fields, success messages).

## How to apply this skill
After building a component:
1. Run through audit-checklist.md (if file exists) to check for accessibility issues.
2. For each issue found, fix it by according to WCAG 2.1 AA standards or applying the pattern from bad-vs-good.md (if file exists).
3. Test: tabthrough the component - does focus order make sense?
4. Test: does every interactive element have a visible focus indicator?