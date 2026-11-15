# Accessibility Audit Checklist (Splitmate)

Run this after building or changing any page, form or interactive component, before calling the feature done. The target is WCAG 2.1 AA. Sections follow the priority order in `SKILL.md`.

Mark each item ✅ pass, ❌ fail (fix it), or n/a. Check in the browser at roughly 1280×610, and once at phone width (~375px).

---

## 0. How to test

- [ ] **Keyboard only**: unplug the mouse mentally. Tab / Shift+Tab through the whole page, use Enter and Space on buttons, and Escape in modals.
- [ ] **Automated scan**: run Lighthouse (Chrome DevTools → Lighthouse → Accessibility) or the axe DevTools extension on the page. Fix everything it reports, then do the manual checks, because tools catch only about a third of issues.
- [ ] **Screen reader spot check**: NVDA (Windows, free) or Narrator (Win+Ctrl+Enter). Listen to the page title, headings (H key in NVDA), form labels and error messages.
- [ ] **Zoom**: at 200% browser zoom nothing is cut off or overlapping, and the page doesn't need sideways scrolling at 320px wide (WCAG 1.4.10).
- [ ] **Signed out and signed in**: check both `PublicOnly` pages (`/`, `/login`, `/register`) and `RequireAuth` pages (`/dashboard`, `/group/new`, `/group/:id`, `/move-groups`).

---

## 1. Forms

Applies to `Login`, `Register`, `CreateGroup`, `AddExpenseModal` and the file picker in `MoveGroups`.

- [ ] Every `<input>`, `<select>` and `<textarea>` has a visible `<label className="label" htmlFor="…">` that matches its `id`. Placeholders are not labels.
- [ ] `id`s are unique on the page. Generated ids include something unique, as in `share-${m.email}`.
- [ ] Inputs use the right `type` (`email`, `password`, `date`) and `autoComplete` (`email`, `current-password`, `new-password`, `name`) so browsers and password managers can help.
- [ ] Money inputs use `inputMode="decimal"`, so phones show a number keypad, and accept both `12` and `12.50` (`parseAmount`).
- [ ] Required fields are marked in the label text or with `required`, not only with colour.
- [ ] Groups of related controls (split type radios, per-member share checkboxes) are wrapped in `<fieldset>` with a `<legend>`, or have `role="group"` + `aria-labelledby`.
- [ ] Checkbox and radio labels are clickable (the `<label>` wraps the control or uses `htmlFor`).
- [ ] An invalid field gets `aria-invalid="true"`, and its message is linked with `aria-describedby="<message id>"`.
- [ ] The **file picker** (`MoveGroups`): the `sr-only` input inside the `.btn` label can be reached with Tab, **and the label shows a focus ring when it has focus**. `.btn:focus-visible` doesn't fire here, because the input has focus, not the label, so the label needs `focus-within:` outline classes.
- [ ] Submitting with Enter works, because the submit button is `type="submit"` inside a `<form onSubmit>`.
- [ ] While saving, the submit button is `disabled` and its text changes ("Saving…"), so the state isn't shown by greying alone.
- [ ] `autoFocus` is used only on the first field of a modal or single-purpose page (as in `AddExpenseModal` and `CreateGroup`), not on content pages.

## 2. Buttons and links

- [ ] Actions are `<button type="button">`. Navigation is `<Link>`. No `<div onClick>` or `<span onClick>`.
- [ ] A button is never nested inside another button or a link. In expense rows, the "open" button and the Delete button are siblings.
- [ ] Every button and link has an accessible name. Icon-only buttons (`.icon-btn`, the modal ×) have an `aria-label`, and decorative SVGs (`CloseIcon`, `SignInIcon`, `SignOutIcon`, the logo mascot) have `aria-hidden`.
- [ ] Repeated buttons have names that say which item they act on: `aria-label={\`Delete ${expense.description}\`}`, not ten buttons called "Delete".
- [ ] Link text makes sense out of context ("Back to dashboard", not "click here").
- [ ] The logo link to `/dashboard` reads as "Splitmate" (the wordmark text), not as an empty link.
- [ ] Every interactive element has a **visible focus indicator**. `.btn` and `.icon-btn` have a 2px orange `:focus-visible` outline. Check custom-styled clickable things that don't use those classes: navbar links, the card-sized `<Link>` in group tiles, the expense row button, and the small Delete text button.
- [ ] Focus order follows the visual order. On Group Detail the CSS grid moves sections around on wide screens, so Tab through it to confirm the order still makes sense.
- [ ] Click targets are at least 24×24px (WCAG 2.5.8). Check the small Delete text button and `.icon-btn`.
- [ ] Destructive actions (delete expense, delete group) ask for confirmation. `window.confirm` is acceptable for keyboard and screen reader users. A custom dialog must follow the modal rules below.

### Modals (`Modal.jsx`, used by `AddExpenseModal` and `ExpenseDetailModal`)

- [ ] It has `role="dialog"`, `aria-modal="true"` and `aria-labelledby` pointing at the title. ✅ already in place.
- [ ] Escape closes it. ✅ already in place.
- [ ] **Focus moves into the modal when it opens**, to the first field or the close button.
- [ ] **Focus is trapped**: Tab from the last control wraps to the first, and doesn't reach the page behind.
- [ ] **Focus returns to the button that opened it** ("Add expense", or the expense row) when it closes.
- [ ] The page behind is hidden from screen readers while the modal is open (`inert` on the app root, or `aria-hidden` on siblings).
- [ ] The `aria-labelledby="modal-title"` id is unique. Only one modal can be open at a time.

## 3. Error states

- [ ] Load errors (`Couldn't load …`) and action errors are shown in the page, in `text-sm text-danger`, not only in the console.
- [ ] Errors that appear after an action are announced: the container has `role="alert"` (urgent) or `aria-live="polite"` (status), **and is in the DOM before the text appears**. Rendering a new `<p role="alert">` usually works. A live region added at the same moment as its text often isn't read.
- [ ] Error text says what went wrong and how to fix it ("Shares must add up to £42.00. £3.00 left."), not just "Invalid".
- [ ] Errors are not shown by colour alone. Use text, and an icon or "Error:" prefix if needed. A red border alone fails.
- [ ] Field errors are linked to their field with `aria-describedby`, and the field has `aria-invalid`.
- [ ] The running total in `AddExpenseModal` (`aria-live="polite"`) is announced without stealing focus. ✅ already in place, so keep it when editing.
- [ ] Success messages (import finished, group created) are announced with `aria-live="polite"`, or confirmed by navigating to a page with a clear `<h1>`.
- [ ] Loading states ("Loading…") say what's loading, or the container has `aria-busy="true"`.

## 4. Headings and structure

- [ ] Each page has exactly **one `<h1>`** (page or group name, or the `AuthCard` title). Sections use `<h2 className="section-title">`, and modal titles are `<h2>`.
- [ ] Heading levels don't skip (no `h1` → `h3`).
- [ ] Landmarks: `AppLayout` provides `<header>` (navbar) and `<main>`. Wrap the navbar links in `<nav aria-label="Main">`. Public pages (`Landing`, `AuthCard`) also need a `<main>`.
- [ ] Lists of things (groups, expenses, members, settlements) are `<ul>`/`<li>`, and nothing but `<li>` sits directly inside a `<ul>`.
- [ ] **Page title changes per route** (WCAG 2.4.2). `index.html` has a fixed `<title>Splitmate</title>`, so each page should set `document.title`, e.g. "Trip to Rome · Splitmate".
- [ ] `<html lang="en">` is set. ✅ already in place.
- [ ] After a route change, focus or a screen reader announcement lands on the new page (focus the `<h1>`, or announce the title), not left on a link that's gone.
- [ ] Data shown as a table (an expense breakdown, if one is added) uses `<table>` with `<th scope="col">`, not a grid of `<div>`s.

## 5. Colour and contrast

Measured from the tokens in `src/index.css` (normal text needs **4.5:1**; large text of 24px+, or 18.66px+ bold, and UI parts like borders and focus rings need **3:1**):

| Pair | Ratio | Result |
| --- | --- | --- |
| `ink` on `surface`/`page` | ~17:1 | ✅ |
| `ink-2` on `surface` | 4.80 | ✅ |
| `ink-2` on `page` | 4.48 | ❌ just under for normal text. Darken `ink-2` slightly (e.g. `#736d68`) |
| `ink-3` on `surface` | 2.52 | ❌ fails for any text. It's used for dates, "Loading…", empty states, the Delete button, navbar "Move groups" and placeholders |
| `ink-3` on `page` | 2.35 | ❌ |
| white on `primary` (`.btn-primary`) | 3.56 | ❌ for normal-size button text. Use `primary-hover` `#c2410c` (5.18) as the button background, or make the text large and bold |
| `primary` text on `surface` (`.link`) | 3.56 | ❌ for normal text. Use `#c2410c` for link text |
| `danger` on `surface`, white on `danger` | 4.83 | ✅ |
| `pos`/`neg`/`settled`/`pending` on their `-bg` | 6.8–7.6 | ✅ |
| `line` border on `surface` (inputs, cards) | 1.27 | ❌ for **input** borders, which are UI parts. Inputs need a 3:1 border, so darken it or use `ink-3`. Card borders are decorative and exempt |
| `primary` focus ring on `surface` | 3.56 | ✅ (3:1 needed) |

- [ ] New text uses `ink` or `ink-2` for anything people need to read. Keep `ink-3` for purely decorative text such as the `›` chevron, or fix the token.
- [ ] The input focus state (`border-color: primary` + 12% orange glow) is visible against the unfocused border. The glow alone is too faint, and it's the border change that counts.
- [ ] Balance states are never shown by colour alone. The pills say "You owe" / "You're owed" / "All settled", and settlement rows say "You owe X" / "X owes you". ✅ keep the words when restyling.
- [ ] Signs on net figures use a real minus (`−`) or "+" so they're read correctly, not only red/green.
- [ ] Pending members are marked with the "pending" badge text, not just amber.
- [ ] Nothing depends on hover alone (tooltips, revealed buttons). It must also work on focus and on touch.
- [ ] Animations and transitions respect `prefers-reduced-motion` if any are added beyond the short colour transitions.

---

## Known gaps to fix (found 2026-11-13)

These are open in the current code. Fix them when working in the file, or as a dedicated pass.

1. **`Modal.jsx`**: no focus trap, no initial focus on the dialog for `ExpenseDetailModal`, and no focus return on close. The background isn't made `inert`.
2. **Contrast tokens**: `ink-3` text, white on `primary`, `.link` text and input borders fail (see the table).
3. **`MoveGroups.jsx` file picker**: the `sr-only` input has no visible focus indicator on its `.btn` label.
4. **Page titles**: every route shows "Splitmate". Set `document.title` per page.
5. **Errors not announced**: `Login`/`Register` errors and other `text-danger` messages have no `role="alert"`.
6. **Navbar**: the links aren't inside a `<nav>`. "Move groups" uses `ink-3`.
7. **`GroupDetail.jsx`**: the expense Delete button is missing `type="button"` (harmless outside a form, but inconsistent) and is a small target.

## Sign-off

- [ ] Lighthouse accessibility score is 100, or every remaining issue is listed and explained.
- [ ] Keyboard-only walkthrough done: every action on the page can be completed without a mouse.
- [ ] The feature has been checked at 200% zoom and at phone width.
