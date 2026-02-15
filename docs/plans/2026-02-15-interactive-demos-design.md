# Interactive Landing Page Demos

## Overview

Replace the static screenshot placeholders in the landing page with two connected, interactive React demos: a popup snooze button grid and a snoozed tab list. Clicking a snooze button in the popup adds a fake tab to the list, telling the full story of how TabNap works.

## Component Architecture

```
InteractiveDemo (parent — manages shared snoozed tabs state)
├── PopupDemo (3x3 button grid in Chrome popup frame)
│   ├── BrowserFrame (chrome-style wrapper with title bar + dots)
│   └── ButtonGrid (9 snooze buttons with icons + click animations)
└── ListDemo (snoozed tab list in browser tab frame)
    ├── BrowserFrame (tab-style wrapper with URL bar)
    └── TabList (grouped tabs with favicons, relative times, sections)
```

**Single file:** `website/app/components/interactive-demo.tsx` replaces `screenshots.tsx` in `page.tsx`.

**Shared state:** A `useState` array of snoozed tabs lives in `InteractiveDemo`. Pre-populated with 4 sample tabs. Popup button clicks append new tabs. List reads from the same array.

## Popup Demo

### Browser Frame

- Chrome popup style: small rounded rectangle (~320px wide)
- Thin title bar with TabNap icon + "TabNap" text + three colored dots (red/yellow/green)
- Subtle shadow, rounded corners

### Button Grid

3x3 grid with internal borders matching the real popup:

| Later Today  | Tonight    | Tomorrow    |
| ------------ | ---------- | ----------- |
| Next Weekend | Next Week  | In a Month  |
| Someday      | Repeatedly | Pick a Date |

Each button: icon (inline SVG, ported from FA Duotone components) + label text below.

### Click Behavior

1. Button turns accent/yellow with check icon + scale animation
2. Fake tab added to shared state with correct `when` timestamp
3. Button resets after ~2 seconds
4. One button active at a time

### Fake Tab Pool

Cycle through realistic titles on each click:

- "GitHub: Pull Request Review"
- "Flights to Tokyo - Google"
- "React Documentation"
- "How to make sourdough - YouTube"
- "Hacker News"
- "Figma - Dashboard Design"
- "Amazon - Headphones"
- "Wikipedia - Space Exploration"

Each gets a URL, favicon initial letter, and the selected snooze label + calculated `when`.

## Snoozed Tab List Demo

### Browser Frame

- Wider frame (~500-600px) styled as a browser tab/window
- Title bar with dots, a tab labeled "TabNap" with moon icon
- URL bar showing `chrome-extension://tabnap/page.html`

### Header

Matches real page.js: "TabNap" logo left, "Home" tab active with tab count badge.

### Pre-populated Tabs (4 samples)

- "GitHub: Pull Request Review" — Today section
- "Vacation Planning - Google Flights" — Tomorrow section
- "React Documentation" — This Week section
- "How to make sourdough - YouTube" — Next Week section

### Tab Grouping

Tabs grouped under time headers ("Today", "Tomorrow", "This Week", "Next Week", "Later") with tab counts. Matches the real `groupTabsByTimePeriod()` logic.

### Tab Row

- Favicon: colored initial letter in rounded square (no real favicons)
- Title and URL
- Snooze label ("Later Today", "Tomorrow", etc.)
- Relative time ("in 3 hours", "tomorrow at 9am")

### New Tab Animation

When a popup button adds a tab, it slides in with a fade+slide-down animation into the correct time group. New groups appear if needed.

### Scope Limits

Display only — no delete buttons, re-snooze dropdown, or search. Focused on the "here's where your tabs go" story.

## Layout & Styling

### Page Position

Replaces the `Screenshots` section. Section heading: "See it in action" with subtitle "Click a snooze button and watch the tab appear in your list."

### Responsive Layout

- Desktop: side by side, popup left (narrower), list right (wider)
- Mobile: stacked vertically, popup on top

### Styling

- Website's Tailwind v4 theme (chrome-\* colors)
- Demo accent colors match extension's default violet palette via CSS variables
- Browser frames: `chrome-100` title bars, `shadow-lg`, `rounded-xl`
- Demos always render in light mode (no dark mode variant)

### Animations

- **Button check:** CSS keyframe — scale up + accent background, hold, reset (~2s total)
- **Tab appear:** CSS keyframe — slide-down + fade-in on new tab insertion

## Implementation Steps

1. Read the existing `screenshots.tsx` to understand current section structure and props
2. Create `interactive-demo.tsx` with the parent state management and layout
3. Build `BrowserFrame` wrapper component (reused by both demos)
4. Build `PopupDemo` — port the 9 icons as inline SVGs, implement the 3x3 grid, click handler, check animation
5. Build `ListDemo` — tab grouping logic, pre-populated data, tab row component, favicon initials
6. Wire shared state — popup clicks add tabs to list with correct timestamps
7. Add CSS keyframe animations (check + slide-in)
8. Replace `Screenshots` import with `InteractiveDemo` in `page.tsx`
9. Remove `screenshots.tsx`
10. Test responsive layout (desktop side-by-side, mobile stacked)
11. Build and verify (`npm run build` in website/)
