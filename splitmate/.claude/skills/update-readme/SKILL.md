---
name: update-readme
description: Create README.md if it doesn't exist, or update it if it does. Reads CLAUDE.md and git log for context.
---

# README

First, check if CLAUDE.md exists. If it does, read it — it contains the project
conventions, data models, and current status. If it doesn't exist, infer what you
can from the src/ folder structure and package.json.

The examples below were accurate when this skill was written. Always check them
against the actual code before writing them into the README; the code wins.

---

## If README.md does not exist

Create it from scratch. Explore the project and write a complete README
with the following sections in this order:

### Project title and description
One clear sentence explaining what Splitmate does and who it's for.

### Features
A bullet list of what the app actually does — from the user's perspective.
Not technical implementation. Only list features that exist in the code. Things like:
- Create groups and add members by email (they can join before registering)
- Log shared expenses with equal or custom splits, each with a category
- See who owes whom with auto-calculated settlements (minimum number of payments)
- Soft-delete expenses without losing balance history
- Move groups between browsers/origins with export and import

### Tech stack
List the main technologies: React 19, Vite 8, Tailwind CSS 4, React Router 7,
localStorage (Phase 1), Supabase (Phase 2, planned).

### Getting started
Step-by-step from zero:
1. Clone the repo
2. Install dependencies (npm install)
3. Run the dev server (npm run dev)
4. Open http://localhost:5173

Mention that the port is pinned on purpose: localStorage is per origin, so a
different port would show an empty app.

### Test accounts
List all pre-seeded accounts with credentials (take them from `ensureSeeded()`
in src/data/storage.js):
- charles@test.com / password
- bob@test.com / password
- rahul@test.com / password
- eva@test.com / password

Explain that these are created automatically on first load and are for local
testing only (passwords are stored in plain text).

### Project structure
A brief map of the src/ folders:
- components/ — reusable UI pieces (modals, layout, route guards, logo)
- context/ — AuthContext (useAuth hook)
- pages/ — one file per route
- hooks/ — useAsyncData (loading data with reload after writes)
- utils/ — balances.js, money.js, categories.js, members.js
- data/ — storage.js (all localStorage access)

### Available routes
A table with columns: Route | Page | Auth required
Include every route in the app (see src/App.jsx).

### Data storage
Explain Phase 1 (localStorage, keys: splitmate.users, splitmate.groups,
splitmate.expenses, splitmate.session, splitmate.seeded) and that storage.js is
the only module that touches it, with every function async. Mention Phase 2
(planned Supabase migration: storage.js can be swapped without changes elsewhere).

### Important notes
- Money is stored as integer pence everywhere
- Why expenses and groups are soft-deleted (isDeleted: true) instead of removed
- Why paidBy and splits use lowercased member emails, not userIds
- The pending member flow (add by email before they register)

Use plain markdown. No emoji. Write clearly for a developer picking up the
project for the first time.

---

## If README.md already exists

1. Read the current README carefully
2. If CLAUDE.md exists, read it for the latest project status
3. Run `git log --oneline -10` to see what changed recently
4. Compare what the README says against what's actually in the project
5. Update ONLY sections that are outdated or missing
6. Do not change the tone, formatting style, or section order
7. Do not remove sections — only update or add

After finishing, print exactly:
  Updated: [sections changed]
  Added: [new sections]
  Unchanged: [sections left as-is]
