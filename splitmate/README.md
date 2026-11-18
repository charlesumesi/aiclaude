# Splitmate

Splitmate is an expense-sharing web app for groups of friends, flatmates or travellers who want to track shared costs and see who owes whom.

## Features

- Create groups and add members by email, including people who haven't registered yet (they join the group automatically when they sign up)
- Log shared expenses with an equal split or custom amounts per person
- Tag each expense with a category (Food & Drinks, Transport, Accommodation, Activities, Shopping, Utilities, Other)
- Add an optional note to an expense, shown under its description in the group's expense list
- See each member's balance and a list of who should pay whom, using the smallest number of payments
- Delete expenses and groups without losing the history behind them
- Move groups to another browser or address by downloading them as a file and loading it there

## Tech stack

- React 19
- Vite 8
- Tailwind CSS 4
- React Router 7
- localStorage for data (Phase 1)
- Supabase (Phase 2, planned)

## Getting started

1. Clone the repo:
   ```bash
   git clone https://github.com/charlesumesi/aiclaude.git
   cd aiclaude/splitmate
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173

The port is pinned to 5173 on purpose. localStorage is separate for each origin, so running the app on a different port would show an empty app. If `npm run dev` reports that port 5173 is in use, a Splitmate dev server is probably already running; use that one.

Other commands:

```bash
npm run build     # production build to dist/
npm run preview   # serve the build on port 5173
```

## Test accounts

These accounts are created automatically the first time the app loads:

| Email | Password |
| --- | --- |
| charles@test.com | password |
| bob@test.com | password |
| rahul@test.com | password |
| eva@test.com | password |

They are for local testing only. Passwords are stored in plain text in the browser.

## Project structure

```
src/
  components/   reusable UI pieces (modals, layout, route guards, logo, icons)
  context/      AuthContext: login, register, logout and the useAuth hook
  pages/        one file per route
  hooks/        useAsyncData: loads data and reloads it after writes
  utils/        balances.js, money.js, categories.js, members.js
  data/         storage.js: all localStorage access
  App.jsx       routes
  index.css     design tokens and shared component classes
```

## Available routes

| Route | Page | Auth required |
| --- | --- | --- |
| `/` | Landing | No (signed-in users go to `/dashboard`) |
| `/login` | Login | No (signed-in users go to `/dashboard`) |
| `/register` | Register | No (signed-in users go to `/dashboard`) |
| `/dashboard` | Dashboard: your groups and balances | Yes |
| `/group/new` | Create group | Yes |
| `/group/:id` | Group detail: expenses, balances, settlements | Yes |
| `/move-groups` | Move groups: export and import | Yes |

Any other path redirects to `/`. Adding an expense is a modal on the group detail page, not a separate route.

## Data storage

### Phase 1: localStorage

All data lives in the browser under these keys:

| Key | Contents |
| --- | --- |
| `splitmate.users` | registered users |
| `splitmate.groups` | groups and their members |
| `splitmate.expenses` | expenses and their splits |
| `splitmate.session` | the signed-in user |
| `splitmate.seeded` | whether the test accounts have been created |

`src/data/storage.js` is the only module that reads or writes localStorage. Every function in it is `async`, even though localStorage is synchronous, so the rest of the app already treats data access as asynchronous.

Importing groups only adds records that are missing and never overwrites existing ones. Before importing, the app saves a copy of the current data under `splitmate.backup-before-import`.

### Phase 2: Supabase (planned)

The plan is to move the data to Supabase. Because all data access goes through `storage.js` with an async interface, that file can be replaced with a Supabase version without changing the rest of the app.

## Important notes

- **Money is stored as whole pence.** All amounts, balances and splits are integers, which avoids floating point rounding errors. Amounts are converted to and from pounds only when shown or typed in (`src/utils/money.js`). With an equal split, any leftover pennies go to the first members in the list.
- **Expenses and groups are soft-deleted.** Deleting sets `isDeleted: true` with `deletedAt` and `deletedBy` instead of removing the record, so the history stays intact. Deleted items are hidden and left out of balance calculations.
- **Members are identified by lowercased email, not user id.** `paidBy` and each split's `email` refer to a member's email, because a member who hasn't registered yet has no user id.
- **Pending members.** When a group is created with an email that has no account yet, that member is saved with `userId: null`. When someone registers with that email, their pending memberships are activated and they see the group straight away.
- **Balances are always recalculated from the expenses** rather than stored (`src/utils/balances.js`). Settlements use an exact minimum-payments method for up to 15 people with non-zero balances, and a faster approximate method above that.
