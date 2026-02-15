# TabNap Product Roadmap

## Guiding Principles

1. **Reliability over features.** A snooze extension that loses tabs is worse than no extension at all. Every feature must be tested, and data integrity is non-negotiable.

2. **Give away what competitors charge for.** Recurring snooze, history, configurable times, wake-up sounds — all free. This builds trust and goodwill that money can't buy.

3. **Keep the no-bundler simplicity.** The architecture (Babel + Tailwind, React via script tags, no webpack/vite) is an intentional choice. It makes the codebase approachable for contributors and fast to iterate on.

4. **Everything works offline and locally.** No accounts, no servers, no data collection. Cloud sync may come later as an opt-in addition, never a requirement.

---

## Phase 1: Near-Term (1-3 months) — Differentiate with Minimal Effort

Focus: Close the most visible feature gaps, get on the Chrome Web Store, and establish TabNap as the go-to free snooze extension.

| Feature                          | Effort | Impact   | Price | Notes                                                                                                                    |
| -------------------------------- | ------ | -------- | ----- | ------------------------------------------------------------------------------------------------------------------------ |
| **Chrome Web Store listing**     | S      | Critical | Free  | Can't grow without distribution. Write compelling listing copy, prepare screenshots, submit for review.                  |
| **Export/import**                | S      | High     | Free  | JSON export of snoozed tabs. Import to restore. Addresses the #1 user pain point (data loss). Include in settings page.  |
| **Keyboard shortcuts**           | S      | High     | Free  | Use `chrome.commands` API. Default: Alt+Shift+S to snooze current tab. Configurable via `chrome://extensions/shortcuts`. |
| **Multi-tab snooze**             | S      | Medium   | Free  | "Snooze all tabs in window" and/or "Snooze selected tabs" from context menu or popup.                                    |
| **Context menu integration**     | S      | Medium   | Free  | Right-click a tab → snooze options (Later Today, Tomorrow, Pick a Date). Uses `chrome.contextMenus` API.                 |
| **Expanded recurring intervals** | M      | High     | Free  | Currently daily-only. Add: weekly (same day/time), weekdays (Mon-Fri), first of month, custom interval (every N days).   |
| **Snooze tab groups**            | S      | Medium   | Free  | Detect if current tab is in a Chrome tab group. Option to snooze the entire group, reopening as a group.                 |

### Phase 1 Definition of Done

- [ ] Listed on Chrome Web Store with screenshots, description, and privacy policy
- [ ] Users can export all snoozed tabs as JSON and import them back
- [ ] At least one keyboard shortcut works for quick snoozing
- [ ] Right-click context menu offers snooze options
- [ ] Multiple tabs can be snoozed at once
- [ ] Recurring supports at least: daily, weekly, weekdays
- [ ] All existing tests still pass, new features have test coverage

---

## Phase 2: Medium-Term (3-6 months) — Polish and Power-User Features

Focus: Deepen the product, add polish, and expand to Firefox.

| Feature                           | Effort | Impact | Price         | Notes                                                                                                                                                                                     |
| --------------------------------- | ------ | ------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Landing page**                  | S      | High   | Free          | Simple static site. Explain what TabNap does, link to CWS listing, show screenshots. Useful for SEO and sharing.                                                                          |
| **Local usage statistics**        | M      | Medium | Free          | "You've snoozed 47 tabs this month. Average snooze: 2.3 days. Most-snoozed site: github.com." Displayed in settings or a new stats tab. All data stays local.                             |
| **Custom time in date picker**    | S      | Medium | Free          | The existing date picker defaults to 9am. Add a time selector (hour/minute dropdowns or input) below the calendar.                                                                        |
| **Customizable snooze presets**   | M      | Medium | Free          | Let users replace the default 3x3 grid labels and times. E.g., swap "Someday" for "In 2 weeks" or change "Later Today" to 1 hour instead of 3.                                            |
| **Re-snooze from notification**   | S      | Medium | Free          | When a tab wakes up, add a "Snooze again" button to the notification (Chrome notification API supports buttons).                                                                          |
| **Badge count on extension icon** | S      | Medium | Free          | Show number of currently snoozed tabs as a badge on the extension icon. Uses `chrome.action.setBadgeText`.                                                                                |
| **Firefox port**                  | L      | High   | Free          | Firefox supports MV3 (with WebExtension polyfills). Port the extension, adapting any Chrome-specific APIs. No active snooze extension exists for Firefox — this is an uncontested market. |
| **Optional cloud sync**           | L      | High   | Potential Pro | See Monetization Exploration below. Sync snoozed tabs across devices via a lightweight backend.                                                                                           |

### Phase 2 Definition of Done

- [ ] Landing page live and linked from CWS listing
- [ ] Stats page shows local usage data
- [ ] Date picker supports custom time selection
- [ ] Users can customize snooze presets
- [ ] Wake-up notifications include re-snooze action
- [ ] Badge count appears on extension icon
- [ ] Firefox version published on AMO (addons.mozilla.org)
- [ ] Cloud sync prototype functional (if pursuing monetization)

---

## Phase 3: Ambitious Long-Term (6-12+ months) — Platform Expansion

Focus: Transform TabNap from a utility into a platform. These features are speculative and depend on user demand and developer capacity.

| Feature                       | Effort | Notes                                                                                                                                                 |
| ----------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Safari port**               | L      | Safari Web Extensions use a similar model to Chrome MV3. Potential to reach macOS/iOS users.                                                          |
| **Edge port**                 | S      | Edge uses the Chromium extension system. Should be a near-direct port from the Chrome version.                                                        |
| **AI snooze suggestions**     | L      | "You snooze this site every weekday at 9am — want to make it recurring?" Learn patterns, suggest optimizations. Runs locally, no cloud AI dependency. |
| **Natural language input**    | M      | Type "next Tuesday at 3pm" or "in 2 hours" and parse it to a snooze time. Libraries like chrono-node make this feasible.                              |
| **Workspaces**                | L      | Group related snoozed tabs into projects/workspaces. Wake an entire workspace at once.                                                                |
| **Shared snooze lists**       | L      | Share a set of snoozed tabs with someone else (via link or export). Useful for teams: "Here are the tabs for Monday's meeting."                       |
| **Mobile companion**          | L      | A simple mobile web app or PWA that shows your snoozed tabs and lets you manage them. Requires cloud sync.                                            |
| **URL content monitoring**    | L      | "Snooze this tab until the page changes." Monitor the URL's content and wake the tab when it detects a meaningful change.                             |
| **Task manager integrations** | M      | Connect to Todoist, Notion, Linear, etc. Snoozing a tab creates a linked task, and completing the task wakes the tab (or vice versa).                 |

---

## Monetization Exploration

TabNap is free and open source. This section explores monetization hypothetically — whether and how revenue could be generated while staying true to the project's values.

### Option A: One-Time Payment for Cloud Sync (Recommended if monetizing)

| Aspect              | Details                                                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Price**           | $9 one-time                                                                                                                                                                  |
| **What's included** | Cross-device sync of snoozed tabs, automatic cloud backup, restore on new devices                                                                                            |
| **What stays free** | Everything else — all snooze features, recurring, history, export/import, themes, sounds, keyboard shortcuts                                                                 |
| **Why this works**  | Cloud sync has real server costs. Users understand paying for infrastructure. One-time pricing matches market expectations. No resentment because the free tier is complete. |
| **Technical cost**  | Requires backend infrastructure (auth, database, sync API). Significant development and operational overhead.                                                                |

### Option B: Stay Free with GitHub Sponsors / Tip Jar

| Aspect             | Details                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **Price**          | $0 (voluntary tips)                                                                              |
| **Revenue**        | Minimal but non-zero. Session Buddy, Tab Wrangler, and similar OSS extensions receive donations. |
| **Why this works** | Zero friction, zero user resentment, zero infrastructure cost. Aligns perfectly with OSS ethos.  |
| **Downside**       | Won't fund a cloud sync backend. Won't replace income.                                           |

### Option C: Freemium with Feature Gating

| Aspect                | Details                                                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Price**             | Free base / $9-15 one-time Pro                                                                                                                                                                |
| **Pro features**      | Cloud sync + customizable presets + usage statistics                                                                                                                                          |
| **Why this is risky** | Gating features that don't cost money to operate (presets, stats) feels arbitrary and generates resentment. The market has shown that users dislike paywalled features in utility extensions. |

### Pricing Comparison

| Model                          | Revenue Potential | User Goodwill | Development Cost      | Operational Cost      |
| ------------------------------ | ----------------- | ------------- | --------------------- | --------------------- |
| **A: $9 one-time (sync only)** | Medium            | High          | High (backend needed) | Medium (server costs) |
| **B: Free + Sponsors**         | Low               | Very High     | None                  | None                  |
| **C: Freemium feature-gated**  | Medium-High       | Medium-Low    | Medium                | Medium                |

### Recommendation

If the goal is sustainability without compromising values: **start with Option B** (free + GitHub Sponsors) and evaluate demand for cloud sync. If users actively request cloud sync, implement it as a $9 one-time purchase (Option A). Never gate features that run purely on the user's machine.
