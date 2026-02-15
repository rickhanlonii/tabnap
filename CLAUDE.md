# TabNap

TabNap is a Chrome Extension (Manifest V3) that snoozes browser tabs — close them now, reopen them later. No bundler — React and ReactDOM loaded via `<script>` tags from `lib/` directory. Babel transpiles JSX, Tailwind generates CSS, but there's no webpack/vite/etc. Two UIs: popup (3x3 snooze button grid) and page (full-tab list/settings view).

## Architecture

### File Structure

```
src/popup.js    → Popup UI: snooze buttons, date picker, time calculations
src/page.js     → Full-page UI: snoozed tab list, settings panel
src/background.js → Service worker: alarm handling, tab wake-up, idle detection
src/global.css  → Tailwind directives + FA Duotone icon opacity
popup.html      → Popup entry point (loads lib/react.js, build/popup.js)
page.html       → Page entry point (loads lib/react.js, build/page.js)
manifest.json   → MV3 manifest: alarms, tabs, storage, idle, notifications
page.test.js    → Jest tests for time calculation functions
build/          → Babel + Tailwind output (gitignored, generated)
dist/           → Distribution packaging output
lib/            → Vendored React/ReactDOM (prod + dev builds)
```

### Data Flow

1. User clicks snooze button in popup
2. `sendTabToNapTime()` saves tab info to `chrome.storage.local` (`tabs` array), sorted by `when`
3. Creates alarm `"tabnap"` set to earliest tab's `when` timestamp
4. Plays snooze sound, then closes current tab after sound ends (sound-before-close pattern)
5. Service worker's alarm listener fires `checkTabs()` — opens due tabs, sends notification, reschedules alarm for next tab

### Chrome Storage Schema

```js
// chrome.storage.local
{
  tabs: [{ title, label, when, url, favicon, recurring? }],  // sorted by when ascending
  settings: {
    laterStartsHour: 3,      // hours from now for "Later Today"
    tonightStartsHour: 19,   // hour (24h) for "Tonight"
    tomorrowStartsHour: 9,   // hour (24h) for "Tomorrow"
    weekendStartsDay: 6,     // 0=Sun, 6=Sat
    weekStartsDay: 1,        // 0=Sun, 1=Mon
    somedayMonths: 3          // months for "Someday"
  }
}
```

## Build Commands

```bash
npm run build      # Dev build: babel + tailwind + dist (dev React)
npm run build:prod # Prod build: babel + tailwind + dist (prod React)
npm run babel      # Transpile JSX: src/ → build/
npm run tailwind   # Generate CSS: src/global.css → build/styles.css
npm run dist       # Package for Chrome: copies to dist/TabNap/
npm run start      # Watch mode: babel + tailwind in parallel
npm test           # Jest tests (MUST run npm run babel first)
npm run prettier   # Format all files
```

## Testing

**Always run tests after making changes:** `npm run babel && npm test`

- Tests import from `build/`, not `src/` — **must run `npm run babel` before `npm test`**
- Test files: `page.test.js` (time calculations), `background.test.js` (service worker logic), `sendTabToNapTime.test.js` (snooze flow), `shared.test.js` (useChromeStorage hook)
- Uses Jest with fake timers (`jest.useFakeTimers("modern")`)
- Custom matcher `toBeDate(year, month, date, hours, minutes, seconds)` for date assertions
- Conditional exports: source files only export functions when `typeof jest !== "undefined"`
- `test-setup.js` provides global chrome API mocks and `DEFAULT_SETTINGS`
- Tests mock `document` and `ReactDOM` as `jest.fn()` to avoid DOM errors

## Code Conventions

- **React:** No imports — React/ReactDOM are globals via script tags. Use `React.useState()`, `React.useEffect()` (not destructured imports)
- **Components:** Function components only, no hooks library, inline event handlers
- **Tailwind:** Slate for neutrals, yellow for accents/active states, white backgrounds. No custom theme extensions
- **Icons:** Font Awesome Duotone SVG components — two `<path>` elements with `fa-primary` and `fa-secondary` classes. Secondary paths get 0.4 opacity via `global.css`
- **Chrome APIs:** Promise-style (`.then()`), not async/await. `chrome.storage.local.get/set`, `chrome.alarms.create/get/clear`, `chrome.tabs.create/remove/query`
- **Settings:** `DEFAULT_SETTINGS` defined at top of both `popup.js` and `page.js` (duplicated). Settings loaded from storage on mount, fall back to defaults

## Workflow

- **Always run `npm run build` when done making changes** so the extension is ready to reload in Chrome.

## Key Technical Decisions

- **Single alarm pattern:** Only one alarm named `"tabnap"` exists at a time, set to the earliest pending tab's `when`. After wake-up, reschedules for next tab
- **Idle detection:** Service worker clears alarm when idle, recreates on return to active. Prevents stale alarms
- **Sound-before-close:** Popup plays snooze sound, tracks `played` and `saved` flags, only closes tab after both complete
- **No bundler:** Intentional — keeps the extension simple, no build complexity beyond Babel for JSX

## Common Tasks

### Adding a new snooze option

1. Add a new `<Button>` in `Buttons` component in `src/popup.js`
2. Create an icon component (FA Duotone SVG pattern)
3. Add a case in `getWhenForTime()` switch
4. Add the time calculation function
5. Add tests in `page.test.js`
6. Run `npm run build && npm test`

### Modifying settings

1. Add default value to `DEFAULT_SETTINGS` in both `src/popup.js` AND `src/page.js`
2. Add `<Setting>` component in `Settings()` in `src/page.js`
3. Use the setting value in the relevant time calculation function

### Loading in Chrome for development

1. `npm run build`
2. Chrome → `chrome://extensions` → Enable Developer mode
3. "Load unpacked" → select the project root directory
4. After code changes: `npm run build`, then click reload on the extension card
