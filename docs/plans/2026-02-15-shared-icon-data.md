# Shared Icon Data Between Extension and Website

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate duplicated icon SVG definitions by extracting raw SVG path data into a shared file that both the Chrome extension and Next.js website consume.

**Architecture:** Create a plain JS file (`src/icon-data.js`) containing SVG path data as objects. The extension's shared.js and popup.js read from it via `<script>` tag (global). The website imports it via Next.js. Each side wraps the data into React components using their own pattern (extension: `className="fa-secondary"`, website: `opacity={0.4}`). Constants like month names are also extracted.

**Tech Stack:** Plain JavaScript (no modules, no TypeScript in shared file), Babel (extension), Next.js (website)

---

## Context

### The Problem

The website's `interactive-demo.tsx` duplicates 11 icon components and several constants from the extension's `src/shared.js` and `src/popup.js`. The SVG paths are identical — only the styling differs:

- **Extension:** `className="fa-secondary"` + CSS rule for 0.4 opacity
- **Website:** `opacity={0.4}` inline attribute

### Why Full Component Sharing Won't Work

The extension has no bundler. React/ReactDOM are globals loaded via `<script>` tags. Components use `React.useState()` (not destructured imports). The website uses Next.js with ES module imports. These two module systems are fundamentally incompatible for React components.

### What CAN Be Shared

1. **SVG path data** — viewBox, primary path `d`, secondary path `d` — pure data, no React
2. **Constants** — month names, day names — pure arrays

### Approach: Shared Data File

Create `src/icon-data.js` as a plain JS file that assigns to a global `ICON_DATA` variable (for extension's script-tag loading). The website imports it via a Next.js-compatible wrapper. Each side has a thin factory that turns data into React components.

### Files Involved

| File | Role |
|------|------|
| `src/icon-data.js` (CREATE) | Raw SVG data + constants, assigned to global |
| `src/shared.js` (MODIFY) | Replace 8 icon function bodies with factory calls |
| `src/popup.js` (MODIFY) | Replace 3 icon function bodies with factory calls |
| `popup.html` (MODIFY) | Add `<script src="build/icon-data.js">` before shared.js |
| `page.html` (MODIFY) | Add `<script src="build/icon-data.js">` before shared.js |
| `website/app/components/icons.tsx` (CREATE) | Website icon factory + re-exports |
| `website/app/components/interactive-demo.tsx` (MODIFY) | Import icons from icons.tsx, delete inline definitions |
| `dist` script in `package.json` (MODIFY) | Include icon-data.js in dist copy |

---

### Task 1: Create the shared icon data file

**Files:**
- Create: `src/icon-data.js`

**Step 1: Create icon-data.js with all SVG path data**

```js
var ICON_DATA = {
  moon: {
    viewBox: "0 0 512 512",
    secondary: "M320 32L304 0l-16 32-32 16 32 16 16 32 16-32 32-16zm138.7 149.3L432 128l-26.7 53.3L352 208l53.3 26.7L432 288l26.7-53.3L512 208z",
    primary: "M332.2 426.4c8.1-1.6 13.9 8 8.6 14.5a191.18 191.18 0 0 1-149 71.1C85.8 512 0 426 0 320c0-120 108.7-210.6 227-188.8 8.2 1.6 10.1 12.6 2.8 16.7a150.3 150.3 0 0 0-76.1 130.8c0 94 85.4 165.4 178.5 147.7z",
  },
  mug: {
    viewBox: "0 0 512 512",
    secondary: "M139.3 67.3a94.83 94.83 0 0 1-26.4-53.5A16.11 16.11 0 0 0 96.8 0H80.4a16.31 16.31 0 0 0-16.3 18 145.36 145.36 0 0 0 40.6 84.4 81.22 81.22 0 0 1 22.4 44.1 16.23 16.23 0 0 0 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18a130.72 130.72 0 0 0-36.6-74.7zM287.9 142a130.72 130.72 0 0 0-36.6-74.7 94.83 94.83 0 0 1-26.4-53.5A16.11 16.11 0 0 0 208.8 0h-16.4c-9.8 0-17.5 8.5-16.3 18a145.36 145.36 0 0 0 40.6 84.4 81.22 81.22 0 0 1 22.4 44.1 16.23 16.23 0 0 0 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18z",
    primary: "M400 192H32a32 32 0 0 0-32 32v192a96 96 0 0 0 96 96h192a96 96 0 0 0 96-96h16a112 112 0 0 0 0-224zm0 160h-16v-96h16a48 48 0 0 1 0 96z",
  },
  sun: {
    viewBox: "0 0 512 512",
    secondary: "M502.42 240.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.41-94.8a17.31 17.31 0 0 0-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4a17.31 17.31 0 0 0 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.41-33.5 47.3 94.7a17.31 17.31 0 0 0 31 0l47.31-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3a17.33 17.33 0 0 0 .2-31.1zm-155.9 106c-49.91 49.9-131.11 49.9-181 0a128.13 128.13 0 0 1 0-181c49.9-49.9 131.1-49.9 181 0a128.13 128.13 0 0 1 0 181z",
    primary: "M352 256a96 96 0 1 1-96-96 96.15 96.15 0 0 1 96 96z",
  },
  couch: {
    viewBox: "0 0 640 512",
    secondary: "M96 160H64a96 96 0 0 1 96-96h320a96 96 0 0 1 96 96h-32a64.06 64.06 0 0 0-64 64v64H160v-64a64.06 64.06 0 0 0-64-64z",
    primary: "M640 256a63.84 63.84 0 0 1-32 55.1V432a16 16 0 0 1-16 16h-64a16 16 0 0 1-16-16v-16H128v16a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V311.1A63.79 63.79 0 0 1 64 192h32a32 32 0 0 1 32 32v96h384v-96a32 32 0 0 1 32-32h32a64.06 64.06 0 0 1 64 64z",
  },
  backpack: {
    viewBox: "0 0 448 512",
    secondary: "M320 320H128a32 32 0 0 0-32 32v32h256v-32a32 32 0 0 0-32-32zM136 208h176a8 8 0 0 0 8-8v-16a8 8 0 0 0-8-8H136a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8z",
    primary: "M96 512h256v-96H96zM320 80h-8V56a56.06 56.06 0 0 0-56-56h-64a56.06 56.06 0 0 0-56 56v24h-8A128 128 0 0 0 0 208v240a64 64 0 0 0 64 64V352a64.07 64.07 0 0 1 64-64h192a64.07 64.07 0 0 1 64 64v160a64 64 0 0 0 64-64V208A128 128 0 0 0 320 80zM184 56a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v24h-80zm136 144a8 8 0 0 1-8 8H136a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8z",
  },
  mailbox: {
    viewBox: "0 0 576 512",
    secondary: "M432 64H144a144 144 0 0 1 144 144v208a32 32 0 0 1-32 32h288a32 32 0 0 0 32-32V208A144 144 0 0 0 432 64zm80 208a16 16 0 0 1-16 16h-32a16 16 0 0 1-16-16v-48h-56a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h104a16 16 0 0 1 16 16z",
    primary: "M143.93 64C64.2 64 0 129.65 0 209.38V416a32 32 0 0 0 32 32h224a32 32 0 0 0 32-32V208A144 144 0 0 0 143.93 64zM224 240a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16zm272-48H392a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h56v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16z",
  },
  beach: {
    viewBox: "0 0 448 512",
    secondary: "M284.91 358.8a144 144 0 0 0-43.71-6.8h-45.07c10-42.85 25-122.77 21-202.33L238.89 128h27.39c11.16 48 28.58 142.41 18.63 230.8z",
    primary: "M241.2 352h-98.4A144 144 0 0 0 .36 474.78C-2.53 494.3 12.39 512 32.12 512h319.76c19.73 0 34.65-17.7 31.76-37.22A144 144 0 0 0 241.2 352zm206.62-238.36C439.69 67.43 393 32 336.53 32c-34.88 0-65.66 13.82-86.3 35.08C235.78 28.29 193.72 0 143.47 0 87 0 40.31 35.43 32.18 81.64a12.37 12.37 0 0 0 10.24 14.2 12.24 12.24 0 0 0 2.18.16H80l16-32 16 32h30.17c-34.21 35-39.62 86.88-14.54 122.58 4.36 6.2 13.14 7.31 18.5 1.95L238.89 128H368l16-32 16 32h35.4a12.38 12.38 0 0 0 12.6-12.18 12.24 12.24 0 0 0-.18-2.18z",
  },
  repeat: {
    viewBox: "0 0 512 512",
    secondary: "M422.66 422.66a12 12 0 0 1 0 17l-.49.46A247.11 247.11 0 0 1 256 504C119 504 8 393 8 256 8 119.19 119.65 7.76 256.46 8a247.12 247.12 0 0 1 170.85 68.69l-56.62 56.56A166.73 166.73 0 0 0 257.49 88C165.09 87.21 87.21 162 88 257.45 88.76 348 162.18 424 256 424a166.77 166.77 0 0 0 110.63-41.56A12 12 0 0 1 383 383z",
    primary: "M504 57.94V192a24 24 0 0 1-24 24H345.94c-21.38 0-32.09-25.85-17-41L463 41c15.15-15.15 41-4.44 41 16.94z",
  },
  calendar: {
    viewBox: "0 0 448 512",
    secondary: "M0 192v272a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V192zm192 176a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-96a16 16 0 0 1 16-16h96a16 16 0 0 1 16 16zm112-240h32a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16zm-192 0h32a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16z",
    primary: "M448 112v80H0v-80a48 48 0 0 1 48-48h48v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V64h128v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V64h48a48 48 0 0 1 48 48z",
  },
  check: {
    viewBox: "0 0 512 512",
    secondary: "M504.5 144.42L264.75 385.5 192 312.59l240.11-241a25.49 25.49 0 0 1 36.06-.14l.14.14L504.5 108a25.86 25.86 0 0 1 0 36.42z",
    primary: "M264.67 385.59l-54.57 54.87a25.5 25.5 0 0 1-36.06.14l-.14-.14L7.5 273.1a25.84 25.84 0 0 1 0-36.41l36.2-36.41a25.49 25.49 0 0 1 36-.17l.16.17z",
  },
  setting: {
    viewBox: "0 0 512 512",
    secondary: "M487.75 315.6l-42.6-24.6a192.62 192.62 0 0 0 0-70.2l42.6-24.6a12.11 12.11 0 0 0 5.5-14 249.2 249.2 0 0 0-54.7-94.6 12 12 0 0 0-14.8-2.3l-42.6 24.6a188.83 188.83 0 0 0-60.8-35.1V25.7A12 12 0 0 0 311 14a251.43 251.43 0 0 0-109.2 0 12 12 0 0 0-9.4 11.7v49.2a194.59 194.59 0 0 0-60.8 35.1L89.05 85.4a11.88 11.88 0 0 0-14.8 2.3 247.66 247.66 0 0 0-54.7 94.6 12 12 0 0 0 5.5 14l42.6 24.6a192.62 192.62 0 0 0 0 70.2l-42.6 24.6a12.08 12.08 0 0 0-5.5 14 249 249 0 0 0 54.7 94.6 12 12 0 0 0 14.8 2.3l42.6-24.6a188.54 188.54 0 0 0 60.8 35.1v49.2a12 12 0 0 0 9.4 11.7 251.43 251.43 0 0 0 109.2 0 12 12 0 0 0 9.4-11.7v-49.2a194.7 194.7 0 0 0 60.8-35.1l42.6 24.6a11.89 11.89 0 0 0 14.8-2.3 247.52 247.52 0 0 0 54.7-94.6 12.36 12.36 0 0 0-5.6-14.1zm-231.4 36.2a95.9 95.9 0 1 1 95.9-95.9 95.89 95.89 0 0 1-95.9 95.9z",
    primary: "M256.35 319.8a63.9 63.9 0 1 1 63.9-63.9 63.9 63.9 0 0 1-63.9 63.9z",
  },
  tabnap: {
    viewBox: "0 0 512 512",
    secondary: "M320 32L304 0l-16 32-32 16 32 16 16 32 16-32 32-16zm138.7 149.3L432 128l-26.7 53.3L352 208l53.3 26.7L432 288l26.7-53.3L512 208z",
    primary: "M332.2 426.4c8.1-1.6 13.9 8 8.6 14.5a191.18 191.18 0 0 1-149 71.1C85.8 512 0 426 0 320c0-120 108.7-210.6 227-188.8 8.2 1.6 10.1 12.6 2.8 16.7a150.3 150.3 0 0 0-76.1 130.8c0 94 85.4 165.4 178.5 147.7z",
  },
};

var MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
var MONTH_SHORT_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { ICON_DATA, MONTH_NAMES, MONTH_SHORT_NAMES, DAY_NAMES };
}
```

Note: `tabnap` is same paths as `moon` — that's correct, the TabNap logo IS the moon icon.

**Step 2: Verify file was created**

Run: `cat src/icon-data.js | head -5`
Expected: Shows `var ICON_DATA = {`

**Step 3: Commit**

```bash
git add src/icon-data.js
git commit -m "feat: extract shared icon SVG data and constants into icon-data.js"
```

---

### Task 2: Add icon-data.js to extension's HTML files and build

**Files:**
- Modify: `popup.html:4` (add script tag)
- Modify: `page.html:4` (add script tag)
- Modify: `package.json:12` (update dist script to include icon-data.js)

**Step 1: Add script tag to popup.html**

In `popup.html`, add `<script src="build/icon-data.js"></script>` after `defaults.js` and before `theme-init.js`:

```html
<html>
  <head>
    <link href="/build/styles.css" rel="stylesheet" />
    <script src="build/defaults.js"></script>
    <script src="build/icon-data.js"></script>
    <script src="build/theme-init.js"></script>
  </head>
  <body>
    <div id="root" />
  </body>
  <script src="lib/react.js"></script>
  <script src="lib/react-dom.js"></script>
  <script src="build/shared.js"></script>
  <script src="build/popup.js"></script>
</html>
```

**Step 2: Add script tag to page.html**

Same pattern — add `<script src="build/icon-data.js"></script>` after `defaults.js`:

```html
<!-- Add after the defaults.js line, before theme-init.js -->
<script src="build/icon-data.js"></script>
```

**Step 3: Build and verify the script is in build/**

Run: `cd /Users/ricky/oss/tabnap && npm run babel`
Expected: `build/icon-data.js` exists (Babel just copies it through since it has no JSX)

Run: `ls build/icon-data.js`
Expected: File exists

**Step 4: Commit**

```bash
git add popup.html page.html package.json
git commit -m "chore: load icon-data.js in extension HTML files"
```

---

### Task 3: Create icon factory function in shared.js and replace icon definitions

**Files:**
- Modify: `src/shared.js:66-182` (replace 8 icon components + add factory)

**Step 1: Add factory function and replace icons in shared.js**

At the top of `src/shared.js` (before `useChromeStorage`), add a factory function. Then replace each `IconXxx` function body to use it.

Add this factory at the very top of `src/shared.js`:

```js
function makeDuotoneIcon(key) {
  var d = ICON_DATA[key];
  return function () {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={d.viewBox}>
        <path d={d.secondary} className="fa-secondary" fill="currentColor" />
        <path d={d.primary} className="fa-primary" fill="currentColor" />
      </svg>
    );
  };
}
```

Then replace each icon function. For example, replace `IconMoon` (lines 66-81) with:

```js
var IconMoon = makeDuotoneIcon("moon");
```

Replace all 8 shared icons:
- `IconMoon` → `var IconMoon = makeDuotoneIcon("moon");`
- `IconMug` → `var IconMug = makeDuotoneIcon("mug");`
- `IconSun` → `var IconSun = makeDuotoneIcon("sun");`
- `IconCouch` → `var IconCouch = makeDuotoneIcon("couch");`
- `IconBackpack` → `var IconBackpack = makeDuotoneIcon("backpack");`
- `IconMailbox` → `var IconMailbox = makeDuotoneIcon("mailbox");`
- `IconBeach` → `var IconBeach = makeDuotoneIcon("beach");`
- `IconSetting` → `var IconSetting = makeDuotoneIcon("setting");`

**Step 2: Build and run tests**

Run: `cd /Users/ricky/oss/tabnap && npm run babel && npm test`
Expected: All tests pass (icons aren't tested, but nothing should break)

**Step 3: Commit**

```bash
git add src/shared.js
git commit -m "refactor: use icon factory from shared icon data in shared.js"
```

---

### Task 4: Replace popup.js icon definitions with factory calls

**Files:**
- Modify: `src/popup.js:658-711` (replace 3 icon functions)

**Step 1: Replace IconRepeat, IconCalendar, and IconCheck**

Replace `IconRepeat` (lines 658-673) with:
```js
var IconRepeat = makeDuotoneIcon("repeat");
```

Replace `IconCalendar` (lines 675-690) with:
```js
var IconCalendar = makeDuotoneIcon("calendar");
```

Replace `IconCheck` (lines 692-711). Note: `IconCheck` accepts a `className` prop that the others don't. It needs a custom wrapper:

```js
function IconCheck({ className }) {
  var d = ICON_DATA.check;
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox={d.viewBox}>
      <path d={d.secondary} className="fa-secondary" fill="currentColor" />
      <path d={d.primary} className="fa-primary" fill="currentColor" />
    </svg>
  );
}
```

Also replace the `MONTH_NAMES`, `MONTH_SHORT_NAMES`, and `DAYS` constants (lines 59-87) — they now come from `icon-data.js` globals. Delete these lines:

```js
// DELETE these — now provided by icon-data.js
const MONTH_NAMES = [...];
const MONTH_SHORT_NAMES = [...];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
```

Update any reference to `DAYS` in popup.js to use `DAY_NAMES` (the name used in icon-data.js). Search for `DAYS` usage in popup.js — it's used in the DatePicker (line 211). Change `DAYS.map` to `DAY_NAMES.map`.

**Step 2: Build and run tests**

Run: `cd /Users/ricky/oss/tabnap && npm run babel && npm test`
Expected: All tests pass

**Step 3: Manually verify in Chrome**

Run: `npm run build`
Then reload the extension in Chrome. Verify:
- Popup opens and shows all 9 icon buttons
- Icons render correctly
- DatePicker shows day names
- Snooze works end-to-end

**Step 4: Commit**

```bash
git add src/popup.js
git commit -m "refactor: use shared icon data and constants in popup.js"
```

---

### Task 5: Check page.js for duplicated icons/constants and update

**Files:**
- Modify: `src/page.js` (if it has duplicated month/day name arrays or icon definitions)

**Step 1: Search page.js for duplicated constants**

Run: `grep -n "MONTH_NAMES\|MONTH_SHORT\|DAY_NAMES\|DAYS\b" src/page.js`

If page.js has its own `MONTH_NAMES`, `MONTH_SHORT_NAMES`, or `DAYS` arrays, delete them (they're now globals from icon-data.js). Update any variable name mismatches (e.g., if page.js uses `DAYS` but icon-data.js exports `DAY_NAMES`).

Also check for any icon definitions in page.js that use icons already in icon-data.js. The page-only icons (`IconBed`, `IconTrash`, etc.) should be added to icon-data.js if they're also used in the website. If they're only used in page.js (not the website), leave them as-is.

**Step 2: Build and run tests**

Run: `cd /Users/ricky/oss/tabnap && npm run babel && npm test`
Expected: All tests pass

**Step 3: Commit (if changes were needed)**

```bash
git add src/page.js
git commit -m "refactor: use shared constants from icon-data.js in page.js"
```

---

### Task 6: Create website icon wrapper and update interactive-demo.tsx

**Files:**
- Create: `website/app/components/icons.tsx`
- Modify: `website/app/components/interactive-demo.tsx`

**Step 1: Create icons.tsx**

This file imports the shared data and creates React components using the website's inline-opacity pattern:

```tsx
// Icon data from the extension's shared icon-data.js
// This is the single source of truth for all SVG paths
const ICON_DATA = require("../../../src/icon-data.js").ICON_DATA;

function makeDuotoneIcon(key: string) {
  const d = ICON_DATA[key];
  return function DuotoneIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={d.viewBox}>
        <path d={d.secondary} fill="currentColor" opacity={0.4} />
        <path d={d.primary} fill="currentColor" />
      </svg>
    );
  };
}

export const IconMoon = makeDuotoneIcon("moon");
export const IconMug = makeDuotoneIcon("mug");
export const IconSun = makeDuotoneIcon("sun");
export const IconCouch = makeDuotoneIcon("couch");
export const IconBackpack = makeDuotoneIcon("backpack");
export const IconMailbox = makeDuotoneIcon("mailbox");
export const IconBeach = makeDuotoneIcon("beach");
export const IconRepeat = makeDuotoneIcon("repeat");
export const IconCalendar = makeDuotoneIcon("calendar");
export const IconCheck = makeDuotoneIcon("check");
export const TabNapIcon = makeDuotoneIcon("tabnap");
```

Note: The `require("../../../src/icon-data.js")` path works because Next.js can resolve files outside `website/` and `icon-data.js` uses `module.exports` at the bottom. Verify the relative path is correct (`website/app/components/` → `src/` is `../../../src/`).

**Step 2: Verify the import path resolves**

Run: `cd /Users/ricky/oss/tabnap/website && node -e "console.log(require('../src/icon-data.js').ICON_DATA.moon.viewBox)"`
Expected: `0 0 512 512`

**Step 3: Update interactive-demo.tsx to import from icons.tsx**

At the top of `interactive-demo.tsx`, add:

```tsx
import {
  IconMoon, IconMug, IconSun, IconCouch, IconBackpack,
  IconMailbox, IconBeach, IconRepeat, IconCalendar, IconCheck,
  TabNapIcon,
} from "./icons";
```

Then delete all 11 inline icon function definitions from the bottom of the file (approximately lines 1251-1425):
- `TabNapIcon` (lines 1251-1265)
- `IconMug` (lines 1267-1281)
- `IconMoon` (lines 1283-1297)
- `IconSun` (lines 1299-1313)
- `IconCouch` (lines 1315-1329)
- `IconBackpack` (lines 1331-1345)
- `IconMailbox` (lines 1347-1361)
- `IconBeach` (lines 1363-1377)
- `IconRepeat` (lines 1379-1393)
- `IconCalendar` (lines 1395-1409)
- `IconCheck` (lines 1411-1425)

Also delete the duplicated `MONTH_NAMES_FULL` and `MONTH_NAMES_SHORT` arrays (lines 598-625) and import them:

```tsx
const { MONTH_NAMES, MONTH_SHORT_NAMES } = require("../../../src/icon-data.js");
```

Then replace references:
- `MONTH_NAMES_FULL` → `MONTH_NAMES`
- `MONTH_NAMES_SHORT` → `MONTH_SHORT_NAMES`

**Step 4: Build the website**

Run: `cd /Users/ricky/oss/tabnap/website && npx next build`
Expected: Build succeeds with no errors

**Step 5: Commit**

```bash
git add website/app/components/icons.tsx website/app/components/interactive-demo.tsx
git commit -m "refactor: use shared icon data from extension in website demo"
```

---

### Task 7: Update test-setup.js if needed

**Files:**
- Modify: `test-setup.js` (if tests rely on ICON_DATA global)

**Step 1: Check if tests need ICON_DATA**

Run: `grep -r "ICON_DATA\|makeDuotoneIcon" *.test.js test-setup.js`

If any test references `ICON_DATA` or `makeDuotoneIcon`, add to `test-setup.js`:

```js
global.ICON_DATA = require("./build/icon-data.js").ICON_DATA;
global.MONTH_NAMES = require("./build/icon-data.js").MONTH_NAMES;
global.MONTH_SHORT_NAMES = require("./build/icon-data.js").MONTH_SHORT_NAMES;
global.DAY_NAMES = require("./build/icon-data.js").DAY_NAMES;
```

The `makeDuotoneIcon` function lives in `shared.js` which is loaded by the test files that need it, so it should already work.

**Step 2: Run all tests**

Run: `cd /Users/ricky/oss/tabnap && npm run babel && npm test`
Expected: All tests pass

**Step 3: Commit (if changes needed)**

```bash
git add test-setup.js
git commit -m "chore: add icon-data globals to test setup"
```

---

### Task 8: Final build and verification

**Step 1: Full extension build**

Run: `cd /Users/ricky/oss/tabnap && npm run build`
Expected: Builds successfully, `dist/TabNap/build/icon-data.js` exists

**Step 2: Full website build**

Run: `cd /Users/ricky/oss/tabnap/website && npx next build`
Expected: Builds successfully

**Step 3: Run all tests**

Run: `cd /Users/ricky/oss/tabnap && npm run babel && npm test`
Expected: All tests pass

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final verification of shared icon data"
```

---

## What's NOT Shared (and Why)

| Item | Why not shared |
|------|----------------|
| React components (Button, DatePicker, etc.) | Extension uses React globals, website uses ES imports — fundamentally different |
| `useChromeStorage` hook | Chrome-specific, website doesn't use Chrome APIs |
| Time calculation functions | Could be shared in future, but the website demo uses simplified inline calculations (hours from now) rather than the extension's settings-aware functions |
| Page-only icons (IconBed, IconTrash, etc.) | Not used in website demo — add to icon-data.js when/if needed |
| Tailwind classes | Same framework but different configs and color schemes |

## Future Improvements

If the website demo grows to need more extension logic (e.g., settings-aware time calculations), the same pattern can be extended: extract pure functions into a shared `.js` file with `var` globals + `module.exports`, load via `<script>` in extension and `require()` in website.
