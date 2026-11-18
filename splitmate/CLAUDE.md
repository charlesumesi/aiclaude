# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Splitmate is an expense-sharing app for groups (React 19, Vite 8, Tailwind CSS 4, React Router 7). There is no backend: all data lives in the browser's localStorage. A move to Supabase is planned, which is why the data layer is shaped the way it is (see below).

The git repository root is the parent folder (`aiclaude/`); this app lives in `splitmate/`. Run git commands accordingly (paths in `git status` are relative to `aiclaude/`).

## Commands

```bash
npm run dev       # dev server on http://localhost:5173 (port is pinned, see below)
npm run build     # production build to dist/
npm run preview   # serve the build, also on 5173
```

There is no test suite and no linter. Verify changes with `npm run build`; for UI changes, check the page in a browser.

The port is pinned with `strictPort` in `vite.config.js` on purpose: localStorage is per origin, so running on 5174 would show an empty app. If `npm run dev` fails with "Port 5173 is already in use", a Splitmate dev server is usually already running; reuse it rather than changing the port.

## Architecture

**Data layer: `src/data/storage.js` is the only module that touches localStorage.** Nothing else may read or write it. Every function is `async` even though localStorage is synchronous, so the rest of the app already treats data access as async and the file can be swapped for a Supabase implementation without changes elsewhere. Keep that contract when adding functions.

**Auth: all auth logic lives in `src/context/AuthContext.jsx`.** Pages call `useAuth()` (`user`, `loading`, `login`, `register`, `logout`) and never touch sessions or passwords. Passwords are stored in plain text (local testing only). On first load `ensureSeeded()` creates four test accounts (`charles@`, `bob@`, `rahul@`, `eva@test.com`, password `password`). Don't display these credentials in the UI.

**Routing (`src/App.jsx`):** `PublicOnly` wraps `/`, `/login`, `/register` (signed-in users are redirected to `/dashboard`); `RequireAuth` + `AppLayout` (navbar + error boundary) wrap `/dashboard`, `/group/new`, `/group/:id`, `/move-groups`. Adding an expense is a modal inside `GroupDetail`, not a route.

**Pages load data with `useAsyncData(loader, deps)`** (`src/hooks/useAsyncData.js`), which returns `{ data, loading, error, reload }`. After a write, call `reload()` rather than patching local state.

### Data model rules that span files

- **Money is integer pence everywhere** (storage, balances, splits). Convert only at the edges with `parseAmount` / `formatMoney` / `penceToInput` in `src/utils/money.js`. `formatMoney` always returns a positive figure; callers add the wording ("You owe", "+", "−").
- **Group members are identified by lowercased email, not user id**, because pending members (invited before registering) have `userId: null`. Expense `paidBy` and `splits[].email` are emails. `createUser` activates any pending memberships for that email. Use `normaliseEmail` before comparing.
- **Expenses**: `{ groupId, description, amount, date ('YYYY-MM-DD'), paidBy, category, splitType ('equal'|'manual'), splits: [{ email, amount }], createdBy }`. `addExpense` rejects splits that don't sum exactly to `amount`. Equal splits come from `splitEqually`, which gives leftover pennies to the first people in member order.
- **Categories** are defined once in `src/utils/categories.js`; use `categoryOf(expense)` to display, since older expenses have no `category` (shown as "Other").
- **Soft delete only**: expenses and groups get `isDeleted`/`deletedAt`/`deletedBy` and are never removed. Readers filter them out; `computeNetBalances` skips deleted expenses.
- **Balances are always recalculated from scratch** (`src/utils/balances.js`): `computeNetBalances` gives net pence per email (positive = owed money), and `settleDebts` turns that into the minimum number of payments. It's exact (bitmask DP over zero-sum subgroups) for up to 15 people with non-zero balances, and greedy above that.
- **Move groups** (`exportGroups`/`importGroups`) exists because each origin has its own storage. Import only adds missing records, never overwrites, re-maps user ids by email, and writes a `splitmate.backup-before-import` key first.

## Styling

Design tokens and reusable component classes are in `src/index.css`. Tokens are in Tailwind v4 `@theme` (colors such as `page`, `surface`, `line`, `primary`, `ink`/`ink-2`/`ink-3`, `pos`/`neg`/`settled`, `logo-red`). Recipes such as `.card`, `.btn`, `.btn-primary`/`-secondary`/`-danger`, `.input`, `.label`, `.badge`, `.pill`, `.amount`, `.navbar` and `.section-title` live in `@layer components`, so Tailwind utilities override them. Use the tokens and recipes rather than raw Tailwind colors.

The original visual spec is in `zfolder/zsplitmate_combo2` (feature spec: `zfolder/zsplitmate_combo`). Key rules still in force:
- Only the six text sizes defined in `@theme` exist (`xs` 12, `sm` 14, `base` 16, `lg` 18, `xl` 24, `2xl` 30); the default scale is cleared.
- Orange (`primary`) is for primary buttons, links, focus and active states only. Money colors (`pos`/`neg`/`settled`) are only for balance states.
- Money figures use `.amount` (tabular numbers, bold) and should be the most prominent thing in their card. In Group Detail, settlements involving the current user come first in full color, and others are muted.
- Cards have borders, not shadows; no gradients.

The user later deliberately overrode parts of that spec, so keep these:
- Page width is `max-w-6xl` (~1150px), not 680px.
- The navbar has a stronger border and a soft shadow (`.navbar`).
- The logo is a banknote mascot SVG plus a red/black 30px wordmark (`src/components/Logo.jsx`).
- Sign in / Sign out are outlined buttons with icons.
- At roughly 1280×610 (the user's browser at 150% zoom), pages are meant to fit without scrolling where the content allows.

## Other files

`zfolder/` holds the user's prompt notes and reference screenshots; it is not part of the app.

`.claude/skills/` holds project skills: `accessibility`, `code-review`, `explain-code`, `impeccable`, `update-readme`, and `update-claude` (patches this file with what changed in a session; never rewrites it).
