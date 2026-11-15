---
name: Splitmate
description: Shared expenses for groups, settled in the fewest payments.
colors:
  primary: "#ea580c"
  primary-hover: "#c2410c"
  logo-red: "#e8300c"
  page: "#f8f7f4"
  surface: "#ffffff"
  line: "#e8e4de"
  navbar-edge: "#d6d3d1"
  ink: "#1c1917"
  ink-2: "#78716c"
  ink-3: "#a8a29e"
  pos: "#065f46"
  pos-bg: "#ecfdf5"
  neg: "#991b1b"
  neg-bg: "#fef2f2"
  settled: "#57534e"
  settled-bg: "#f5f5f4"
  pending: "#92400e"
  pending-bg: "#fffbeb"
  danger: "#dc2626"
  danger-hover: "#b91c1c"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: "36px"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "26px"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  body-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
  amount:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
rounded:
  md: "8px"
  lg: "12px"
  2xl: "16px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.page}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-danger-hover:
    backgroundColor: "{colors.danger-hover}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  navbar:
    backgroundColor: "{colors.surface}"
    height: "56px"
  pill-pos:
    backgroundColor: "{colors.pos-bg}"
    textColor: "{colors.pos}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  pill-neg:
    backgroundColor: "{colors.neg-bg}"
    textColor: "{colors.neg}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  pill-settled:
    backgroundColor: "{colors.settled-bg}"
    textColor: "{colors.settled}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  badge-pending:
    backgroundColor: "{colors.pending-bg}"
    textColor: "{colors.pending}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  modal:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "24px"
    width: "480px"
---

# Design System: Splitmate

## Overview

**Creative North Star: "The Honest Ledger"**

Splitmate looks like a well-kept household ledger on warm paper: calm, exact, and a little friendly. The page is an off-white stone tone, content sits on white cards with thin warm borders, and the only loud things on screen are the money figures and the single orange action. Splitmate is a working tool, not a showpiece. Brand character lives in small, precise details: the smiling banknote mascot, the red/black wordmark, and tabular figures that line up to the penny.

The palette is warm stone neutrals (the Tailwind stone family) with one orange voice for action and three reserved money colours for balance state. Density is moderate. Pages are wide (about 1150px) so a whole group fits in one view at the user's 1280×610 working size. Depth is almost entirely flat. The navbar is the one deliberate exception.

**Key Characteristics:**
- Warm off-white page, white bordered cards, no gradients.
- One accent (orange) for actions only. Money colours (green, red, grey) for balance states only.
- Money figures are the loudest element in any card: bold and in tabular figures.
- A closed type scale of six sizes in a single family (Inter).
- Friendly identity carried by the mascot logo, not by decoration in the UI.

## Colors

Warm stone neutrals with one orange action colour and a strictly reserved money palette.

### Primary
- **Ember Orange** (`primary`): primary buttons, links, focus rings, active and selected states. Never used for decoration, headings, or money.
- **Deep Ember** (`primary-hover`): hover state for Ember Orange only.

### Secondary
- **Wordmark Red** (`logo-red`): the "Split" half of the logo wordmark, and nothing else.

### Neutral
- **Warm Paper** (`page`): the app background behind everything.
- **Card White** (`surface`): cards, modals, inputs, navbar.
- **Stone Hairline** (`line`): every border and divider (set globally as the default border colour).
- **Navbar Edge** (`navbar-edge`): the slightly darker bottom border of the navbar only.
- **Ink** (`ink`): primary text and headings.
- **Slate Ink** (`ink-2`): secondary text, descriptions, metadata.
- **Faint Ink** (`ink-3`): placeholders, numbering, close icons, the quietest hints.

### Money and status (semantic)
- **Owed Green** (`pos` on `pos-bg`): "owes you" and "You're owed" balances, and the active member badge.
- **Owe Red** (`neg` on `neg-bg`): "You owe" balances.
- **Settled Stone** (`settled` on `settled-bg`): "All settled", default avatars, and muted settlements that don't involve the viewer.
- **Pending Amber** (`pending` on `pending-bg`): the pending member badge only.
- **Danger Red** (`danger`, `danger-hover`): destructive buttons (delete). This is a different red from Owe Red: one is a debt, the other is an action.

### Named Rules
**The One Voice Rule.** Orange means "you can act here". If it isn't a button, link, focus ring or active state, it isn't orange.

**The Money Palette Rule.** Green, red and the settled grey describe balances and nothing else. Don't borrow them for success toasts, charts or decoration.

**The Words Carry It Rule.** Colour never carries a balance on its own. The wording ("You owe", "owes you", "All settled") always says the same thing.

## Typography

**Display Font:** Inter (with ui-sans-serif, system-ui, -apple-system, Segoe UI)
**Body Font:** Inter
**Label/Mono Font:** Inter, with tabular figures for money

**Character:** One neutral, highly legible sans used across the whole app. Hierarchy comes from weight and the closed size scale, not from pairing fonts.

### Hierarchy
- **Display** (800, 30px / 36px): the logo wordmark, top-level page titles and landing section headings.
- **Hero display** (800, 40–64px fluid, line-height 1.04, -0.03em; token `text-display`): the landing hero headline only. Nowhere in the app.
- **Headline** (700, 24px / 32px): page headings, group names, and large summary figures.
- **Title** (600, 18px / 26px): section titles (`.section-title`), card headings, modal titles.
- **Body** (400, 16px / 24px): default running text. Keep lines to about 65–75ch (the landing subheading uses `max-w-lg`).
- **Body Small** (400–500, 14px / 20px): buttons, inputs, labels, list rows, most UI text.
- **Label** (500, 12px / 16px): badges, dates, numbering, fine metadata.
- **Amount** (700, -0.01em, tabular figures): every money figure, at whatever size its context needs.

### Named Rules
**The Six Sizes Rule.** Only 12, 14, 16, 18, 24 and 30px exist in the app; the landing hero headline (`text-display`) is the single sanctioned exception. The default Tailwind scale is cleared on purpose. One known deviation: balance pills use 13px. Treat it as legacy and don't copy it elsewhere.

**The Tabular Money Rule.** Every amount uses tabular figures and bold weight so columns of pence line up.

## Layout

- **Container:** content is centred at `max-w-6xl` (about 1150px) with 24px side padding. This deliberately overrides the original 680px spec. The `--container-page: 680px` token is stale and unused.
- **Target viewport:** about 1280×610 (a desktop browser at 150% zoom). Pages should fit without scrolling where the content allows, so prefer horizontal grids over long stacks.
- **Rhythm:** 4px base. Common gaps are 8, 12, 16, 24 and 32px. Cards use 20px padding, or 24–28px on spacious landing cards. Page sections are separated by 40–64px vertically.
- **Grids:** feature and group card grids use three columns from the `sm` breakpoint (640px) and collapse to one column below it.
- **Modals:** a bottom sheet on small screens (rounded top corners, full width), centred and up to 480px wide from `sm` upward.

## Elevation & Depth

The system is flat. Depth comes from tonal layering: white cards on Warm Paper, separated by Stone Hairline borders. There are exactly two exceptions, and both are deliberate.

### Shadow Vocabulary
- **Navbar lift** (`box-shadow: 0 2px 8px rgb(28 25 23 / 0.08)`): only on the sticky navbar, so it stays distinct while content scrolls under it.
- **Focus halo** (`box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.12)`): on focused inputs. This is a state, not elevation.
- **Modal scrim** (`black / 40%`): behind dialogs. The dialog itself has no shadow.

### Named Rules
**The Borders Not Shadows Rule.** Cards are separated by a 1px Stone Hairline border, never by a drop shadow. No gradients anywhere.

## Shapes

Soft, friendly corners with a small set of radii. Controls use 8px, cards 12px, modals 16px, and badges, pills and avatars are fully round. Every container has a 1px border in a single border colour. There's no clipping, angled geometry or decorative shapes: the mascot is the only illustration.

## Components

### Buttons
Compact, quiet and clear: one solid button per view, everything else outlined.
- **Shape:** gently rounded (8px), 1px border, 14px/500 text, 10px × 16px padding, 8px gap for icons.
- **Primary:** Ember Orange with white text. Hover changes to Deep Ember over 120ms.
- **Secondary:** Card White with a Stone Hairline border and Ink text. Hover changes to Warm Paper.
- **Danger:** Danger Red with white text, for confirming deletion only.
- **Outlined accent (Sign in / Sign out):** an orange border and orange text on white, with a leading icon. On hover it fills orange with white text.
- **Focus:** 2px Ember Orange outline, 2px offset. **Disabled:** 60% opacity with a not-allowed cursor.
- **Icon button:** 32px square, 8px radius, Faint Ink icon. On hover the background goes Warm Paper and the icon goes Ink.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Card White on Warm Paper.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px Stone Hairline.
- **Internal Padding:** 20px by default.

### Inputs / Fields
- **Style:** Card White, 1px Stone Hairline, 8px radius, 10px × 14px padding, 14px text. Placeholders in Faint Ink.
- **Focus:** the border turns Ember Orange and a 3px orange halo at 12% opacity appears. There's no outline.
- **Select:** custom chevron in Slate Ink, inset 14px from the right.
- **Label:** 14px/500 in Ink, 6px above the field.

### Balance pills (signature)
Rounded pills that state a balance in words and colour together: Owed Green, Owe Red or Settled Stone on their tinted backgrounds, 600 weight, 4px × 12px padding.

### Member badges
Small pills (12px/500, 2px × 8px). Active members get Owed Green and pending members get Pending Amber.

### Avatars
28px circles in Settled Stone showing initials (11px/600).

### Navigation
- **Navbar:** sticky, 56px tall, Card White, with a Navbar Edge bottom border and the navbar lift shadow. The logo is on the left and the outlined Sign in / Sign out button is on the right.
- **Logo:** the banknote mascot (about 40px tall) plus the wordmark at 30px/800 with tight tracking: "Split" in Wordmark Red, "mate" in Ink.

### Modal
A centred white dialog up to 480px wide with a 16px radius and 24px padding. Its header row holds the title and an icon-button close, with a hairline divider underneath. It closes on Escape, the close button, or a click on the scrim. On small screens it becomes a bottom sheet.

## Do's and Don'ts

### Do:
- **Do** make the money figure the most prominent element in its card, using `.amount` (bold, tabular figures).
- **Do** list settlements that involve the current user first, in full colour, and mute the rest in Settled Stone.
- **Do** use the theme tokens (`page`, `surface`, `line`, `ink`/`ink-2`/`ink-3`, `primary`, `pos`/`neg`/`settled`) and the component recipes, not raw Tailwind colours.
- **Do** keep every page within the `max-w-6xl` container and check that it fits at about 1280×610.
- **Do** pair every balance colour with explicit wording.

### Don't:
- **Don't** add drop shadows to cards or use gradients. The navbar is the only shadowed element.
- **Don't** use orange for anything other than actions, links, focus and active states.
- **Don't** use the money colours outside balance states, or Wordmark Red outside the logo.
- **Don't** introduce text sizes outside the six-step scale, or a second typeface.
- **Don't** shrink content back to the original 680px column.
- **Don't** display the seeded test-account credentials anywhere in the UI.
