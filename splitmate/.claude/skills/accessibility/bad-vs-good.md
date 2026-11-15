# Accessibility Fixes: Bad vs Good (Splitmate)

Before-and-after patterns for the issues in `audit-checklist.md`. Where a **Bad** example is marked *(current code)*, it's copied from Splitmate as it is today, so the fix can be applied directly. The others are mistakes that are easy to make when adding new features.

Each pair says what's wrong, shows the fix, and names the WCAG 2.1 criterion.

| # | Pattern | Area |
| --- | --- | --- |
| 1 | Placeholder used as a label | Forms |
| 2 | Field error not linked to its field | Forms |
| 3 | Grouped controls without a group name | Forms |
| 4 | Hidden file input with no focus ring *(current code)* | Forms |
| 5 | Clickable `<div>` instead of a button | Buttons and links |
| 6 | Repeated buttons with the same name | Buttons and links |
| 7 | Icon-only button with no name | Buttons and links |
| 8 | Button nested inside a link or button | Buttons and links |
| 9 | Modal without focus management *(current code)* | Buttons and links |
| 10 | Error message that isn't announced *(current code)* | Error states |
| 11 | Same page title on every route *(current code)* | Headings and structure |
| 12 | Navbar links not in a `<nav>` *(current code)* | Headings and structure |
| 13 | Styled text instead of a heading | Headings and structure |
| 14 | Balance shown by colour alone | Colour |
| 15 | Low-contrast text tokens *(current code)* | Colour |

---

## Forms

### 1. Placeholder used as a label

**Bad**

```jsx
<input className="input" type="email" placeholder="Email address" value={email} onChange={…} />
```

The placeholder disappears as soon as you type, it's too faint to read (`ink-3`, 2.5:1), and many screen readers don't treat it as a name.

**Good**

```jsx
<label htmlFor="member-email" className="label">Email address</label>
<input
  id="member-email"
  className="input"
  type="email"
  autoComplete="email"
  placeholder="name@example.com"
  value={email}
  onChange={…}
/>
```

A visible `<label>` linked by `htmlFor`/`id`. The placeholder only gives an example of the format. *WCAG 1.3.1, 3.3.2, 4.1.2.*

### 2. Field error not linked to its field

**Bad**

```jsx
<input id="exp-amount" className="input border-danger" value={amount} onChange={…} />
<p className="text-sm text-danger">Enter an amount</p>
```

The only link between the error and the field is position and a red border. A screen reader user hears "Amount, edit" with no hint that anything is wrong.

**Good**

```jsx
<input
  id="exp-amount"
  className="input"
  inputMode="decimal"
  value={amount}
  onChange={…}
  aria-invalid={amountError ? true : undefined}
  aria-describedby={amountError ? 'exp-amount-error' : undefined}
/>
{amountError && (
  <p id="exp-amount-error" className="mt-1.5 text-sm text-danger">
    {amountError}  {/* e.g. "Enter an amount like 12 or 12.50" */}
  </p>
)}
```

The field is marked invalid, and its message is read along with the label. The message says how to fix the problem, not just "Invalid". *WCAG 1.3.1, 3.3.1, 3.3.3.*

### 3. Grouped controls without a group name

**Bad**

```jsx
<p className="label">Split</p>
<label><input type="radio" name="split" value="equal" /> Equally</label>
<label><input type="radio" name="split" value="manual" /> Manually</label>
```

Each radio is announced as just "Equally" or "Manually". The question they answer is lost.

**Good**

```jsx
<fieldset>
  <legend className="label">Split</legend>
  <label className="flex items-center gap-2">
    <input type="radio" name="split" value="equal" checked={splitType === 'equal'} onChange={…} />
    Equally
  </label>
  <label className="flex items-center gap-2">
    <input type="radio" name="split" value="manual" checked={splitType === 'manual'} onChange={…} />
    Manually
  </label>
</fieldset>
```

`<fieldset>` + `<legend>` names the group ("Split, Equally, radio button, 1 of 2"). Do the same for the per-member share checkboxes in `AddExpenseModal`. Remove the fieldset's default border with Tailwind (`border-0 p-0 m-0`) if needed. *WCAG 1.3.1.*

### 4. Hidden file input with no focus ring *(current code: `MoveGroups.jsx`)*

**Bad**

```jsx
<label className="btn btn-secondary cursor-pointer">
  Choose file…
  <input type="file" accept=".json,application/json" className="sr-only" onChange={handleFile} />
</label>
```

Tab reaches the hidden input, but nothing on screen changes. `.btn:focus-visible` applies to the label, and it's the input that has focus.

**Good**

```jsx
<label className="btn btn-secondary cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
  Choose file…
  <input type="file" accept=".json,application/json" className="sr-only" onChange={handleFile} />
</label>
```

`focus-within:` draws the ring on the visible label whenever the input inside it has focus. *WCAG 2.4.7.*

---

## Buttons and links

### 5. Clickable `<div>` instead of a button

**Bad**

```jsx
<div className="card px-6 py-4 cursor-pointer" onClick={() => setViewing(expense)}>
  {expense.description}
</div>
```

You can't reach it with Tab, Enter and Space do nothing, and a screen reader announces it as plain text.

**Good**

```jsx
<button
  type="button"
  onClick={() => setViewing(expense)}
  className="card w-full px-6 py-4 text-left transition-colors hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
>
  {expense.description}
</button>
```

Use `<button>` for actions and `<Link>` for navigation. They come with focus, keyboard support and the right role. Card-styled buttons need their own `focus-visible:` ring, because they don't use `.btn`. *WCAG 2.1.1, 4.1.2.*

### 6. Repeated buttons with the same name

**Bad**

```jsx
{expenses.map((e) => (
  <li key={e.id}>
    {e.description}
    <button type="button" onClick={() => onDelete(e)}>Delete</button>
  </li>
))}
```

A screen reader's list of buttons shows "Delete, Delete, Delete, …" with no way to tell them apart.

**Good** *(improves the Delete button in `GroupDetail.jsx`)*

```jsx
<button
  type="button"
  onClick={() => onDelete(e)}
  aria-label={`Delete ${e.description}`}
  className="min-h-6 min-w-6 rounded-md px-2 py-1 text-xs text-ink-2 hover:bg-neg-bg hover:text-danger"
>
  Delete
</button>
```

The accessible name says which expense the button deletes. Keep the visible word "Delete" inside the `aria-label` so voice-control users can say "click Delete". The button also gets `type="button"` and a minimum 24px target. *WCAG 2.4.6, 2.5.3, 2.5.8.*

### 7. Icon-only button with no name

**Bad**

```jsx
<button type="button" onClick={onClose} className="icon-btn">
  <CloseIcon />
</button>
```

It's announced as just "button".

**Good** *(as in `Modal.jsx`)*

```jsx
<button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
  <CloseIcon />  {/* the SVG has aria-hidden */}
</button>
```

The name goes on the button, and the decorative SVG is hidden. When an icon sits next to text (Sign in / Sign out), keep `aria-hidden` on the icon and let the text be the name. *WCAG 1.1.1, 4.1.2.*

### 8. Button nested inside a link or button

**Bad**

```jsx
<Link to={`/group/${group.id}`} className="card …">
  {group.name}
  <button type="button" onClick={() => leaveGroup(group)}>Leave</button>
</Link>
```

This is invalid HTML. Pressing Enter on "Leave" may also follow the link, and screen readers announce it unpredictably.

**Good**

```jsx
<li className="card flex items-center gap-4 px-6 py-6">
  <Link to={`/group/${group.id}`} className="min-w-0 flex-1 rounded-md focus-visible:outline-2 focus-visible:outline-primary">
    {group.name}
  </Link>
  <button type="button" onClick={() => leaveGroup(group)} aria-label={`Leave ${group.name}`} className="btn btn-secondary">
    Leave
  </button>
</li>
```

Make them siblings inside a plain container, the way expense rows have an "open" button and a Delete button side by side. *WCAG 4.1.1, 4.1.2.*

### 9. Modal without focus management *(current code: `Modal.jsx`)*

**Bad**

```jsx
export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // …
  }, [onClose])

  return (
    <div className="fixed inset-0 …">
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" …>
```

Escape works, but:

- `ExpenseDetailModal` opens with focus still on the page behind.
- Tab walks out of the dialog into the page behind it.
- On close, focus drops to `<body>`, so keyboard users start again from the top of the page.

**Good**

```jsx
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CloseIcon from './CloseIcon.jsx'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Capture the opener during render, before a child's autoFocus moves focus.
  const [opener] = useState(() => document.activeElement)

  useEffect(() => {
    const dialog = dialogRef.current
    const app = document.getElementById('root')

    // Hide the page behind from keyboard and screen readers.
    app.inert = true
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Move focus in, unless a child (e.g. autoFocus on the first field) already did.
    if (!dialog.contains(document.activeElement)) dialog.focus()

    function onKey(e) {
      if (e.key === 'Escape') return onCloseRef.current()
      if (e.key !== 'Tab') return
      const items = [...dialog.querySelectorAll(FOCUSABLE)]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      app.inert = false
      document.body.style.overflow = previousOverflow
      opener?.focus?.() // give focus back to "Add expense" or the expense row
    }
  }, [opener])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-surface p-6 outline-none sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
          <h2 id="modal-title" className="text-lg text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
```

How it works:

- **Portal:** the modal is rendered into `document.body`, so `inert` on `#root` hides the page without hiding the modal.
- **Focus in, trapped, back:** focus moves into the dialog, Tab wraps inside it, and focus returns to whatever opened it.
- **Capturing the opener:** it's grabbed in a `useState` initializer, because by the time effects run, `autoFocus` inside `AddExpenseModal` has already moved focus.
- **`onClose` held in a ref:** the effect doesn't depend on `onClose`, so it doesn't re-run (and bounce focus) when a parent passes a new function.

The same `<dialog>` element with `showModal()` is a valid alternative that gives you trapping and `inert` for free. *WCAG 2.1.2, 2.4.3, 4.1.2.*

---

## Error states

### 10. Error message that isn't announced *(current code: `Login.jsx`, `Register.jsx`)*

**Bad**

```jsx
{error && <p className="text-sm text-danger">{error}</p>}
<button type="submit" disabled={submitting} className="btn btn-primary btn-block">
```

A sighted user sees "Wrong email or password" appear. A screen reader user presses Enter and hears nothing, so they don't know the sign-in failed.

**Good**

```jsx
<p role="alert" className="min-h-5 text-sm text-danger">
  {error}
</p>
<button type="submit" disabled={submitting} className="btn btn-primary btn-block">
  {submitting ? 'Signing in…' : 'Sign in'}
</button>
```

- **Live region:** `role="alert"` makes the message a live region that is read as soon as text appears.
- **Always present:** the `<p>` stays in the DOM (empty until there's an error), so the screen reader is already watching it when text arrives. `min-h-5` keeps the layout from jumping.
- **Button text:** it changes while submitting, so the busy state isn't shown by greying alone.

Use `aria-live="polite"` instead of `role="alert"` for non-urgent updates, such as the running total in `AddExpenseModal` or "Import finished". *WCAG 3.3.1, 4.1.3.*

---

## Headings and structure

### 11. Same page title on every route *(current code)*

**Bad**

```html
<!-- index.html: the only title, never changed -->
<title>Splitmate</title>
```

Every tab, bookmark and browser-history entry says "Splitmate", and screen readers announce the same title after every navigation.

**Good**

```js
// src/hooks/useDocumentTitle.js
import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Splitmate` : 'Splitmate'
  }, [title])
}
```

```jsx
// in GroupDetail.jsx, once the group has loaded
useDocumentTitle(group?.name ?? 'Group')

// in Dashboard.jsx
useDocumentTitle('Dashboard')
```

Each route names itself ("Trip to Rome · Splitmate"). Call the hook before any early `return`, because of the rules of hooks, and pass a fallback while data loads. *WCAG 2.4.2.*

### 12. Navbar links not in a `<nav>` *(current code: `AppLayout.jsx`)*

**Bad**

```jsx
<header className="navbar">
  <div className="mx-auto flex …">
    <Link to="/dashboard"><Logo /></Link>
    <div className="flex min-w-0 items-center gap-4 text-sm">
      <Link to="/move-groups" className="shrink-0 text-ink-3 transition-colors hover:text-ink">
        Move groups
      </Link>
```

There's no navigation landmark, so screen reader users can't jump to the menu. "Move groups" is also `ink-3` (2.5:1).

**Good**

```jsx
<header className="navbar">
  <div className="mx-auto flex …">
    <Link to="/dashboard" aria-label="Splitmate home"><Logo /></Link>
    <nav aria-label="Main" className="flex min-w-0 items-center gap-4 text-sm">
      <Link to="/move-groups" className="shrink-0 text-ink-2 transition-colors hover:text-ink">
        Move groups
      </Link>
      …
    </nav>
```

The links sit in `<nav aria-label="Main">`, the logo link gets a clear name, and the link text uses `ink-2` (4.8:1 on white). *WCAG 1.3.1, 1.4.3, 2.4.1.*

### 13. Styled text instead of a heading

**Bad**

```jsx
<p className="text-lg font-semibold text-ink">Balances</p>
```

It looks like a heading, but screen reader users jumping by heading (H key) skip straight past it.

**Good**

```jsx
<h2 className="section-title">Balances</h2>
```

Use real heading elements with the `.section-title` recipe for looks: one `<h1>` per page, `<h2>` for sections and modal titles, and no skipped levels. *WCAG 1.3.1, 2.4.6.*

---

## Colour

### 14. Balance shown by colour alone

**Bad**

```jsx
<span className={`amount text-xl ${amount > 0 ? 'text-pos' : 'text-neg'}`}>
  {formatMoney(amount)}
</span>
```

`formatMoney` always returns a positive figure, so "£12.00" in green and "£12.00" in red look the same to colour-blind users and sound the same to screen reader users.

**Good** *(as in `Dashboard.jsx` → `GroupBalance`)*

```jsx
if (amount === 0) return <span className="pill pill-settled">All settled</span>
const owed = amount > 0
return (
  <div className="flex flex-col items-end gap-1.5">
    <span className={`pill ${owed ? 'pill-pos' : 'pill-neg'}`}>
      {owed ? 'You’re owed' : 'You owe'}
    </span>
    <span className={`amount text-xl font-extrabold ${owed ? 'text-pos' : 'text-neg'}`}>
      {formatMoney(amount)}
    </span>
  </div>
)
```

Words carry the meaning and colour only reinforces it. For signed totals, add a real minus (`−`) or `+`, as the net balance card does. *WCAG 1.4.1.*

### 15. Low-contrast text tokens *(current code: `src/index.css`)*

**Bad**

```css
--color-ink-3: #a8a29e;   /* 2.52:1 on white: used for dates, "Loading…", empty states, Delete */
--color-primary: #ea580c; /* 3.56:1: white button text and .link text */
--color-line: #e8e4de;    /* 1.27:1: input borders */
```

```jsx
<p className="mt-0.5 text-xs text-ink-3">{payer} paid · {formatDate(e.date)}</p>
```

**Good**

```jsx
<p className="mt-0.5 text-xs text-ink-2">{payer} paid · {formatDate(e.date)}</p>
```

```css
.btn-primary { background: var(--color-primary-hover); }  /* #c2410c: 5.18:1 with white */
.link        { color: var(--color-primary-hover); }
.input       { border-color: var(--color-ink-3); }          /* 3:1 boundary for form fields */
```

- **Readable text:** use `ink` or `ink-2` (4.8:1). Keep `ink-3` for decoration only (the `›` chevron, dividers).
- **Orange text and buttons:** use the darker orange for text and filled buttons.
- **Input borders:** inputs need a 3:1 border so people can see where the field is. Card borders are decorative and can stay light.
- **`ink-2` on `page`:** it measures 4.48:1, so nudge `ink-2` to `#736d68` (4.76:1) if it's used on the page background.

Re-check with the contrast table in `audit-checklist.md` after changing a token. *WCAG 1.4.3, 1.4.11.*
