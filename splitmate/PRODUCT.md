# Product

<!-- impeccable:product-schema 1 -->

> Sections marked *(inferred)* were drawn from the repository and specs on 2026-11-14 without user confirmation. The user chose "go with your guesses"; confirm or correct them when convenient.

## Platform

web

## Users

*(inferred)* Groups of friends, flatmates and travel companions, UK-based, who share costs: trips, shared houses, nights out (per the landing copy). Mixed comfort with technology. Their job: log what was spent and who shared it, then find out who owes whom and settle up with as few transfers as possible. Whether the near-term audience is the public, the user's own circle, or a learning/portfolio build is undecided.

## Product Purpose

Splitmate tracks shared expenses within a group and tells everyone exactly who owes whom. Success means anyone in a group can see their own position at a glance ("You owe Charles £8.00", "Bob owes you £2.00", "All settled") and settle with the minimum number of payments.

## Positioning

*(inferred)*
- **Fewest possible payments.** Settlement is exact (bitmask DP over zero-sum subgroups) for up to 15 people with non-zero balances, so nobody sends money round in circles.
- **Invite before they join.** Members are added by email. Unregistered people are held as pending and get access automatically when they register.
- **Plain clarity.** No ads, upsells or gamification. The product answers one question: who owes whom.

## Operating Context

- Groups are created by a member who adds others one at a time by email. The creator joins automatically.
- Expenses are added from a modal on the group page: description, amount, date, payer, category, and who shares it (equal split by default, live per-person share, or manual split).
- Balances are always shown from the current user's point of view. Settlements involving them come first.
- Because data is per browser origin, "Move groups" (export/import) moves groups between browsers or origins.
- The user's primary viewing context is a desktop browser at about 1280×610 (150% zoom). Pages should fit without scrolling where the content allows.

## Capabilities and Constraints

- **Features:** register / sign in / sign out; dashboard with totals (you owe, owed to you, net) and group cards; create group with active and pending members; group detail with members, expenses, categories and settlements; add, view and soft-delete expenses; export/import groups.
- **Money:** integer pence everywhere, formatted at the edges. *(inferred)* GBP (£) only. Multi-currency is out of scope until decided.
- **Data:** localStorage only, accessed solely through `src/data/storage.js` with an async API, ready for a planned move to Supabase. No backend yet.
- **Auth:** local testing only, with plain-text passwords. Seeded test accounts must never be shown in the UI.
- **Records:** soft delete only. Balances are recalculated from scratch every time.
- **Terminology:** "group", "member" (active / pending), "expense", "split" (equal / manual), "settlement", "You owe" / "owes you" / "All settled".
- **Open:** mobile priority, target audience, multi-currency, real authentication and hosting.

## Brand Commitments

- Name: **Splitmate**.
- Logo: banknote mascot SVG with a red/black wordmark (`src/components/Logo.jsx`; reference `zfolder/zsplitmate_logo.png`).
- Voice: plain, friendly, British English ("maths", "flat", "night out"). Short and direct. Avoids awkwardness around money.
- User overrides to the original spec recorded in `CLAUDE.md` (page width, navbar, outlined sign-in/out buttons, fit at 1280×610) are binding.

## Evidence on Hand

- Feature spec: `zfolder/zsplitmate_combo`. Visual spec: `zfolder/zsplitmate_combo2`. Prompt notes and screenshots: `zfolder/zsplitmate_promptss*`.
- There are no real users, testimonials, usage data, press or pricing. Future work must not invent any of them.

## Product Principles

*(inferred)*
1. **Your position first.** Every money view leads with what the current user owes or is owed. Other people's debts come second.
2. **Exact, never approximate.** Amounts are to the penny, splits must sum exactly, and settlements are the true minimum.
3. **Nothing is lost.** Records are soft-deleted, imports never overwrite, and a backup is taken before an import.
4. **Low friction for the group.** Anyone can be added by email, whether or not they've registered.
5. **Calm about money.** Make it clear without blame or pressure. Colour signals balance state, not urgency.

## Accessibility & Inclusion

*(inferred)* Target WCAG 2.1 AA. Balance states must not rely on colour alone: the wording ("You owe", "owes you", "All settled") carries the meaning.
