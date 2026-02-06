# Tab Snooze vs TabNap — Feature Comparison

## Snooze Options

| Feature | Tab Snooze | TabNap |
|---------|-----------|--------|
| Later Today | Yes | Yes |
| Tonight | Yes | Yes |
| Tomorrow | Yes | Yes |
| This Weekend | Yes | Yes |
| Next Week | Yes | Yes |
| Someday | Yes | Yes |
| Custom Date/Time | Yes | Yes |
| Recurring Snooze | No | Yes |
| Configurable Times | Yes | Yes |

## Wake-Up Experience

| Feature | Tab Snooze | TabNap | Status |
|---------|-----------|--------|--------|
| 1-minute batching window | Yes — wakes tabs within ~1 min of each other together | Yes | Implemented |
| Clickable notifications | Yes — clicking focuses the woken tab | Yes | Implemented |
| Tab titles in notifications | Yes — shows which tabs woke up | Yes | Implemented |
| 60-second idle delay | Yes — waits for WiFi after sleep/lock | Yes | Implemented |
| Wake-up sound | Yes — plays audio on tab wake | Yes (via offscreen document) | Implemented |
| Notification toggle | Yes — can disable notifications | Yes | Implemented |
| Sound toggle | Yes — can disable wake-up sound | Yes | Implemented |

## Architecture

| Aspect | Tab Snooze | TabNap |
|--------|-----------|--------|
| Manifest Version | MV2 (legacy) | MV3 |
| Build System | Bundled (webpack) | No bundler (Babel + Tailwind only) |
| UI Framework | Custom | React (globals via script tags) |
| Audio Playback | Background page (MV2) | Offscreen document (MV3) |
| Alarm Strategy | Per-tab alarms | Single alarm (earliest tab) |
| Storage | chrome.storage.local | chrome.storage.local |

## Implementation Summary

All 6 planned wake-up improvements have been implemented:

1. **1-minute batching window** — Tabs due within 60 seconds of the current time are woken together, reducing notification spam when multiple tabs are scheduled close together.

2. **Clickable notifications** — Clicking the wake-up notification focuses the first woken tab and brings its window to the front.

3. **Tab titles in notifications** — Notifications now list up to 5 tab titles (with a "+N more" suffix), so you know what woke up without checking.

4. **60-second idle delay** — After returning from idle/sleep, TabNap waits 60 seconds before waking tabs, giving WiFi time to reconnect so pages load properly.

5. **Wake-up sound** — Plays an audio cue when tabs wake up, using an MV3-compatible offscreen document for audio playback (since service workers can't play audio directly).

6. **Notification & sound settings** — Both notifications and wake-up sound can be toggled on/off in the settings page.

## Key Architectural Differences

- **Single alarm vs per-tab alarms:** TabNap uses one alarm set to the earliest pending tab, then reschedules after each wake. Tab Snooze creates individual alarms per tab. The single-alarm approach is simpler but requires careful rescheduling.

- **MV3 offscreen audio:** Since MV3 service workers can't access the DOM or Audio API, TabNap creates an offscreen document specifically for audio playback. Tab Snooze's MV2 background page can play audio directly.

- **Settings merge pattern:** TabNap uses `{ ...DEFAULT_SETTINGS, ...storedSettings }` to ensure existing users get new default values when upgrading, without requiring a migration step.
