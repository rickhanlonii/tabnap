# Recurring Snooze Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current "Repeatedly" button (which hardcodes daily at 9 AM) with a full recurring snooze system supporting daily/weekly/monthly/yearly schedules with user-configurable time, weekday(s), day-of-month, or date.

**Architecture:** The "Repeatedly" button in popup.js currently navigates to `getTimeFor9amTomorrowInMs()` and sets `recurring: true`. We replace this with a new popup route (`recurring`) that shows a configuration screen. The tab storage schema gains a `recurPattern` object describing the schedule. The background.js `checkTabs()` function uses `recurPattern` to compute the next occurrence instead of hardcoding "tomorrow at 9 AM". A new `getNextRecurrence(pattern)` function in shared.js computes the next wake time from a pattern.

**Tech Stack:** React (globals), Chrome Storage API, Jest, Babel JSX transpilation

---

## Storage Schema Change

Current recurring tab object:

```js
{ title, label, when, url, favicon, snoozedAt, recurring: true }
```

New recurring tab object:

```js
{
  title, label, when, url, favicon, snoozedAt,
  recurring: true,
  recurPattern: {
    frequency: "daily" | "weekly" | "monthly" | "yearly",
    hour: 9,        // 0-23
    minute: 0,      // 0-59
    weekdays: [1],  // weekly only: 0=Sun..6=Sat, array of days
    dayOfMonth: 15, // monthly only: 1-31
    month: 2,       // yearly only: 0-11
    dayOfYear: 15,  // yearly only: 1-31
  }
}
```

The `when` field is always set to the next computed occurrence (used by the alarm system as-is). The `recurPattern` is the source of truth for computing future `when` values.

---

### Task 1: Add `getNextRecurrence()` to shared.js — daily

**Files:**

- Modify: `src/shared.js` (add function before the `if (typeof jest` block)
- Test: `page.test.js` (add new describe block)

**Step 1: Write the failing tests for daily recurrence**

Add to the bottom of `page.test.js`, before any closing braces, a new describe block:

```js
describe("getNextRecurrence", () => {
  const { getNextRecurrence } = require("./build/shared.js");

  describe("daily", () => {
    test("returns tomorrow at specified time when today's time has passed", () => {
      jest.useFakeTimers("modern");
      jest.setSystemTime(new Date(2024, 0, 15, 10, 0, 0)); // Jan 15, 10:00 AM
      const pattern = { frequency: "daily", hour: 9, minute: 0 };
      const result = new Date(getNextRecurrence(pattern));
      expect(result).toBeDate(2024, 0, 16, 9, 0, 0);
      jest.useRealTimers();
    });

    test("returns today at specified time when time has not passed", () => {
      jest.useFakeTimers("modern");
      jest.setSystemTime(new Date(2024, 0, 15, 7, 0, 0)); // Jan 15, 7:00 AM
      const pattern = { frequency: "daily", hour: 9, minute: 30 };
      const result = new Date(getNextRecurrence(pattern));
      expect(result).toBeDate(2024, 0, 15, 9, 30, 0);
      jest.useRealTimers();
    });

    test("returns tomorrow when current time equals pattern time", () => {
      jest.useFakeTimers("modern");
      jest.setSystemTime(new Date(2024, 0, 15, 9, 0, 0));
      const pattern = { frequency: "daily", hour: 9, minute: 0 };
      const result = new Date(getNextRecurrence(pattern));
      expect(result).toBeDate(2024, 0, 16, 9, 0, 0);
      jest.useRealTimers();
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run babel && npm test -- --testPathPattern=page.test`
Expected: FAIL — `getNextRecurrence` is not exported / not defined

**Step 3: Implement `getNextRecurrence` for daily pattern**

Add to `src/shared.js` just before the `if (typeof jest !== "undefined")` block:

```js
function getNextRecurrence(pattern) {
  var now = new Date();
  var hour = pattern.hour || 9;
  var minute = pattern.minute || 0;

  switch (pattern.frequency) {
    case "daily": {
      var candidate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0
      );
      if (candidate.getTime() <= now.getTime()) {
        candidate.setDate(candidate.getDate() + 1);
      }
      return candidate.getTime();
    }
    default:
      return Date.now() + 86400000; // fallback: 24h from now
  }
}
```

Also add `getNextRecurrence` to the `module.exports` block in shared.js.

**Step 4: Run tests to verify they pass**

Run: `npm run babel && npm test -- --testPathPattern=page.test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared.js page.test.js
git commit -m "feat: add getNextRecurrence() with daily pattern support"
```

---

### Task 2: Add weekly recurrence to `getNextRecurrence()`

**Files:**

- Modify: `src/shared.js` (extend switch case)
- Test: `page.test.js` (add weekly tests)

**Step 1: Write the failing tests for weekly recurrence**

Add inside the `describe("getNextRecurrence", ...)` block:

```js
describe("weekly", () => {
  test("returns next matching weekday at specified time", () => {
    jest.useFakeTimers("modern");
    // Jan 15, 2024 is a Monday
    jest.setSystemTime(new Date(2024, 0, 15, 10, 0, 0));
    const pattern = { frequency: "weekly", hour: 9, minute: 0, weekdays: [3] }; // Wednesday
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2024, 0, 17, 9, 0, 0); // Wed Jan 17
    jest.useRealTimers();
  });

  test("returns today if weekday matches and time has not passed", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2024, 0, 15, 7, 0, 0)); // Monday 7am
    const pattern = { frequency: "weekly", hour: 9, minute: 0, weekdays: [1] }; // Monday
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2024, 0, 15, 9, 0, 0);
    jest.useRealTimers();
  });

  test("skips to next week if today's weekday time has passed", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2024, 0, 15, 10, 0, 0)); // Monday 10am
    const pattern = { frequency: "weekly", hour: 9, minute: 0, weekdays: [1] }; // Monday
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2024, 0, 22, 9, 0, 0); // next Monday
    jest.useRealTimers();
  });

  test("picks nearest weekday from multiple weekdays", () => {
    jest.useFakeTimers("modern");
    // Jan 15, 2024 is Monday, 10am — Mon already passed
    jest.setSystemTime(new Date(2024, 0, 15, 10, 0, 0));
    const pattern = {
      frequency: "weekly",
      hour: 9,
      minute: 0,
      weekdays: [1, 5],
    }; // Mon, Fri
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2024, 0, 19, 9, 0, 0); // Friday
    jest.useRealTimers();
  });

  test("wraps around week boundary", () => {
    jest.useFakeTimers("modern");
    // Jan 19, 2024 is Friday, 10am
    jest.setSystemTime(new Date(2024, 0, 19, 10, 0, 0));
    const pattern = { frequency: "weekly", hour: 9, minute: 0, weekdays: [1] }; // Monday
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2024, 0, 22, 9, 0, 0); // next Monday
    jest.useRealTimers();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run babel && npm test -- --testPathPattern=page.test`
Expected: FAIL — weekly case hits default fallback

**Step 3: Implement weekly in `getNextRecurrence`**

Add a `case "weekly"` to the switch in `getNextRecurrence`:

```js
case "weekly": {
  var days = pattern.weekdays || [1]; // default Monday
  var best = null;
  for (var i = 0; i < days.length; i++) {
    var day = days[i];
    var daysUntil = (day - now.getDay() + 7) % 7;
    var candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntil, hour, minute, 0);
    if (daysUntil === 0 && candidate.getTime() <= now.getTime()) {
      candidate.setDate(candidate.getDate() + 7);
    }
    if (best === null || candidate.getTime() < best.getTime()) {
      best = candidate;
    }
  }
  return best.getTime();
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run babel && npm test -- --testPathPattern=page.test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared.js page.test.js
git commit -m "feat: add weekly recurrence pattern to getNextRecurrence"
```

---

### Task 3: Add monthly recurrence to `getNextRecurrence()`

**Files:**

- Modify: `src/shared.js`
- Test: `page.test.js`

**Step 1: Write the failing tests for monthly recurrence**

```js
describe("monthly", () => {
  test("returns this month if day/time have not passed", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2024, 0, 10, 7, 0, 0)); // Jan 10
    const pattern = {
      frequency: "monthly",
      hour: 9,
      minute: 0,
      dayOfMonth: 15,
    };
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2024, 0, 15, 9, 0, 0);
    jest.useRealTimers();
  });

  test("returns next month if day has passed", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2024, 0, 20, 10, 0, 0)); // Jan 20
    const pattern = {
      frequency: "monthly",
      hour: 9,
      minute: 0,
      dayOfMonth: 15,
    };
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2024, 1, 15, 9, 0, 0); // Feb 15
    jest.useRealTimers();
  });

  test("returns next month if same day but time has passed", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2024, 0, 15, 10, 0, 0)); // Jan 15, 10am
    const pattern = {
      frequency: "monthly",
      hour: 9,
      minute: 0,
      dayOfMonth: 15,
    };
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2024, 1, 15, 9, 0, 0);
    jest.useRealTimers();
  });

  test("handles day 31 in month with fewer days (clamps to last day)", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2024, 1, 1, 7, 0, 0)); // Feb 1 (leap year)
    const pattern = {
      frequency: "monthly",
      hour: 9,
      minute: 0,
      dayOfMonth: 31,
    };
    const result = new Date(getNextRecurrence(pattern));
    // Feb has 29 days in 2024. Date constructor handles overflow by rolling to next month.
    // We want to clamp: Feb 29 at 9am.
    expect(result).toBeDate(2024, 1, 29, 9, 0, 0);
    jest.useRealTimers();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run babel && npm test -- --testPathPattern=page.test`
Expected: FAIL

**Step 3: Implement monthly in `getNextRecurrence`**

```js
case "monthly": {
  var dom = pattern.dayOfMonth || 1;
  var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  var clampedDay = Math.min(dom, lastDay);
  var candidate = new Date(now.getFullYear(), now.getMonth(), clampedDay, hour, minute, 0);
  if (candidate.getTime() <= now.getTime()) {
    var nextLastDay = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate();
    candidate = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(dom, nextLastDay), hour, minute, 0);
  }
  return candidate.getTime();
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run babel && npm test -- --testPathPattern=page.test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared.js page.test.js
git commit -m "feat: add monthly recurrence pattern to getNextRecurrence"
```

---

### Task 4: Add yearly recurrence to `getNextRecurrence()`

**Files:**

- Modify: `src/shared.js`
- Test: `page.test.js`

**Step 1: Write the failing tests for yearly recurrence**

```js
describe("yearly", () => {
  test("returns this year if date/time have not passed", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2024, 0, 1, 7, 0, 0)); // Jan 1
    const pattern = {
      frequency: "yearly",
      hour: 9,
      minute: 0,
      month: 5,
      dayOfYear: 15,
    }; // Jun 15
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2024, 5, 15, 9, 0, 0);
    jest.useRealTimers();
  });

  test("returns next year if date has passed", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2024, 6, 1, 10, 0, 0)); // Jul 1
    const pattern = {
      frequency: "yearly",
      hour: 9,
      minute: 0,
      month: 5,
      dayOfYear: 15,
    }; // Jun 15
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2025, 5, 15, 9, 0, 0);
    jest.useRealTimers();
  });

  test("returns next year if same date but time has passed", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2024, 5, 15, 10, 0, 0)); // Jun 15, 10am
    const pattern = {
      frequency: "yearly",
      hour: 9,
      minute: 0,
      month: 5,
      dayOfYear: 15,
    };
    const result = new Date(getNextRecurrence(pattern));
    expect(result).toBeDate(2025, 5, 15, 9, 0, 0);
    jest.useRealTimers();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run babel && npm test -- --testPathPattern=page.test`
Expected: FAIL

**Step 3: Implement yearly in `getNextRecurrence`**

```js
case "yearly": {
  var m = pattern.month != null ? pattern.month : 0;
  var d = pattern.dayOfYear || 1;
  var candidate = new Date(now.getFullYear(), m, d, hour, minute, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate = new Date(now.getFullYear() + 1, m, d, hour, minute, 0);
  }
  return candidate.getTime();
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run babel && npm test -- --testPathPattern=page.test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared.js page.test.js
git commit -m "feat: add yearly recurrence pattern to getNextRecurrence"
```

---

### Task 5: Update background.js to use `getNextRecurrence`

**Files:**

- Modify: `src/background.js` (the recurring block inside `checkTabs`)
- Test: `background.test.js`

The background.js service worker loads `build/defaults.js` via `importScripts` but does NOT load shared.js. We need to also load shared.js so `getNextRecurrence` is available.

**Step 1: Write failing tests for pattern-based rescheduling**

Add a new test in `background.test.js` inside the `describe("checkTabs", ...)` block:

```js
test("recurring tab with recurPattern uses getNextRecurrence for rescheduling", () => {
  jest.useFakeTimers("modern");
  jest.setSystemTime(new Date(2024, 0, 15, 10, 0, 0)); // Mon Jan 15, 10am
  const now = Date.now();

  const recurringTab = {
    url: "http://recurring.com",
    when: now - 1000,
    title: "Recurring",
    recurring: true,
    recurPattern: { frequency: "weekly", hour: 14, minute: 30, weekdays: [3] }, // Wed 2:30pm
  };

  chrome.storage.local.get.mockResolvedValueOnce({ tabs: [recurringTab] });
  chrome.storage.local.set.mockResolvedValueOnce();

  checkTabs();

  return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
    const setCall = chrome.storage.local.set.mock.calls[0][0];
    expect(setCall.tabs).toHaveLength(1);
    const rescheduled = setCall.tabs[0];
    expect(rescheduled.recurring).toBe(true);
    expect(rescheduled.recurPattern).toEqual(recurringTab.recurPattern);
    // Should be Wed Jan 17 at 14:30
    const nextWhen = new Date(rescheduled.when);
    expect(nextWhen.getDay()).toBe(3); // Wednesday
    expect(nextWhen.getHours()).toBe(14);
    expect(nextWhen.getMinutes()).toBe(30);
    jest.useRealTimers();
  });
});

test("recurring tab WITHOUT recurPattern still uses legacy tomorrow-at-9am", () => {
  const now = Date.now();
  const recurringTab = {
    url: "http://legacy.com",
    when: now - 1000,
    title: "Legacy Recurring",
    recurring: true,
  };

  chrome.storage.local.get.mockResolvedValueOnce({ tabs: [recurringTab] });
  chrome.storage.local.set.mockResolvedValueOnce();

  checkTabs();

  return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
    const setCall = chrome.storage.local.set.mock.calls[0][0];
    expect(setCall.tabs).toHaveLength(1);
    expect(setCall.tabs[0].when).toBeGreaterThan(now);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run babel && npm test -- --testPathPattern=background.test`
Expected: FAIL — the current code ignores recurPattern

**Step 3: Update background.js**

First, add shared.js import at the top of `src/background.js` (after the defaults import):

```js
if (typeof importScripts !== "undefined") {
  importScripts("/build/defaults.js");
  importScripts("/build/shared.js");
}
```

Then replace the recurring block in `checkTabs()` (lines 91-96):

**Old:**

```js
if (tab.recurring) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  remainingTabs.push({ ...tab, when: tomorrow.getTime() });
}
```

**New:**

```js
if (tab.recurring) {
  var nextWhen;
  if (tab.recurPattern) {
    nextWhen = getNextRecurrence(tab.recurPattern);
  } else {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    nextWhen = tomorrow.getTime();
  }
  remainingTabs.push({ ...tab, when: nextWhen });
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run babel && npm test -- --testPathPattern=background.test`
Expected: PASS

**Step 5: Also run all tests**

Run: `npm run babel && npm test`
Expected: All pass

**Step 6: Commit**

```bash
git add src/background.js background.test.js
git commit -m "feat: use recurPattern for recurring tab rescheduling in background"
```

---

### Task 6: Build the recurring configuration popup UI

**Files:**

- Modify: `src/popup.js` (add `RecurringPicker` component, new route)

This is the largest UI task. When the user clicks "Repeatedly", instead of immediately snoozing, we show a configuration screen in the popup (similar to how "Pick a Date" shows the `DatePicker`).

**Step 1: Add route handling for "recurring" in App component**

In `src/popup.js`, modify the `App` component to add a `recurring` route:

```js
function App() {
  const [route, setRoute] = React.useState("home");
  const settings = useChromeStorage("settings", DEFAULT_SETTINGS);
  useTheme(settings);

  return (
    <div
      className={
        CURRENT_SETTINGS.debugMode
          ? "bg-red-100 dark:bg-red-900"
          : "bg-white dark:bg-chrome-900"
      }
    >
      <div className="w-96 h-96">
        {route === "home" ? (
          <Buttons
            onSelectDate={() => setRoute("date")}
            onSelectRecurring={() => setRoute("recurring")}
          />
        ) : route === "date" ? (
          <DatePicker
            onDateSelected={() => setRoute("home")}
            onCancel={() => setRoute("home")}
          />
        ) : (
          <RecurringPicker
            onScheduled={() => setRoute("home")}
            onCancel={() => setRoute("home")}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
```

**Step 2: Update the "Repeatedly" button to navigate instead of snooze**

In the `Buttons` component, change the "Repeatedly" button from a regular `Button` to navigate to the recurring picker:

```js
function Buttons({ onSelectDate, onSelectRecurring }) {
  // ... existing code ...
  return (
    <div className="...">
      {/* ... other buttons unchanged ... */}
      <Button
        text="Repeatedly"
        Icon={IconRepeat}
        time="pick"
        onSelect={onSelectRecurring}
      ></Button>
      <Button
        text="Pick a Date"
        Icon={IconCalendar}
        time="pick"
        onSelect={onSelectDate}
      ></Button>
    </div>
  );
}
```

**Step 3: Create the `RecurringPicker` component**

Add this component to `src/popup.js` (after `DatePicker`, before `Buttons`):

```js
function RecurringPicker({ onScheduled, onCancel }) {
  const [frequency, setFrequency] = React.useState("daily");
  const [hour, setHour] = React.useState(9);
  const [minute, setMinute] = React.useState(0);
  const [weekdays, setWeekdays] = React.useState([1]); // Monday
  const [dayOfMonth, setDayOfMonth] = React.useState(1);
  const [yearMonth, setYearMonth] = React.useState(0);
  const [yearDay, setYearDay] = React.useState(1);

  function buildPattern() {
    var pattern = { frequency: frequency, hour: hour, minute: minute };
    if (frequency === "weekly") {
      pattern.weekdays = weekdays;
    } else if (frequency === "monthly") {
      pattern.dayOfMonth = dayOfMonth;
    } else if (frequency === "yearly") {
      pattern.month = yearMonth;
      pattern.dayOfYear = yearDay;
    }
    return pattern;
  }

  function handleSchedule() {
    var pattern = buildPattern();
    var when = getNextRecurrence(pattern);
    snoozeSound.play();
    sendTabToNapTime("Repeatedly", when, true, pattern);
    onScheduled();
  }

  function toggleWeekday(day) {
    setWeekdays(function (prev) {
      if (prev.includes(day)) {
        if (prev.length === 1) return prev; // must keep at least 1
        return prev.filter(function (d) {
          return d !== day;
        });
      }
      return prev.concat(day).sort();
    });
  }

  var timeOptions = [];
  for (var h = 0; h < 24; h++) {
    for (var m = 0; m < 60; m += 15) {
      var d = new Date(2024, 0, 1, h, m);
      var label = d.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      timeOptions.push({ hour: h, minute: m, label: label });
    }
  }

  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="bg-white dark:bg-chrome-900 p-4 w-96 h-96 flex flex-col">
      <div className="flex items-center mb-4">
        <button
          type="button"
          className="focus:outline-none transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-chrome-100 dark:hover:bg-chrome-700 p-1 rounded-full mr-2"
          onClick={onCancel}
        >
          <svg
            className="h-5 w-5 text-chrome-700 dark:text-chrome-200 inline-flex"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-lg font-bold text-chrome-900 dark:text-chrome-50">
          Repeat Schedule
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          <div className="text-xs font-semibold text-chrome-500 dark:text-chrome-400 uppercase tracking-wider mb-1">
            Frequency
          </div>
          <div className="flex gap-1">
            {["daily", "weekly", "monthly", "yearly"].map(function (f) {
              return (
                <div
                  key={f}
                  className={
                    "px-3 py-1.5 rounded-full text-sm cursor-pointer border " +
                    (frequency === f
                      ? "border-accent bg-accent-light dark:bg-accent-darkbg text-accent dark:text-accent-dark"
                      : "border-chrome-300 dark:border-chrome-700 text-chrome-700 dark:text-chrome-200 hover:border-chrome-400 dark:hover:border-chrome-500")
                  }
                  onClick={function () {
                    setFrequency(f);
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </div>
              );
            })}
          </div>
        </div>

        {frequency === "weekly" && (
          <div>
            <div className="text-xs font-semibold text-chrome-500 dark:text-chrome-400 uppercase tracking-wider mb-1">
              Days
            </div>
            <div className="flex gap-1">
              {dayNames.map(function (name, i) {
                var active = weekdays.includes(i);
                return (
                  <div
                    key={i}
                    className={
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm cursor-pointer border " +
                      (active
                        ? "border-accent bg-accent-light dark:bg-accent-darkbg text-accent dark:text-accent-dark"
                        : "border-chrome-300 dark:border-chrome-700 text-chrome-700 dark:text-chrome-200 hover:border-chrome-400 dark:hover:border-chrome-500")
                    }
                    onClick={function () {
                      toggleWeekday(i);
                    }}
                  >
                    {name.charAt(0)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {frequency === "monthly" && (
          <div>
            <div className="text-xs font-semibold text-chrome-500 dark:text-chrome-400 uppercase tracking-wider mb-1">
              Day of month
            </div>
            <select
              className="py-1 px-2 rounded-md bg-white dark:bg-chrome-800 border border-chrome-300 dark:border-chrome-900 cursor-pointer outline-none text-chrome-900 dark:text-chrome-50"
              value={dayOfMonth}
              onChange={function (e) {
                setDayOfMonth(parseInt(e.target.value));
              }}
            >
              {Array.from({ length: 31 }, function (_, i) {
                return i + 1;
              }).map(function (d) {
                return (
                  <option key={d} value={d}>
                    {d}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {frequency === "yearly" && (
          <div className="flex gap-4">
            <div>
              <div className="text-xs font-semibold text-chrome-500 dark:text-chrome-400 uppercase tracking-wider mb-1">
                Month
              </div>
              <select
                className="py-1 px-2 rounded-md bg-white dark:bg-chrome-800 border border-chrome-300 dark:border-chrome-900 cursor-pointer outline-none text-chrome-900 dark:text-chrome-50"
                value={yearMonth}
                onChange={function (e) {
                  setYearMonth(parseInt(e.target.value));
                }}
              >
                {monthNames.map(function (name, i) {
                  return (
                    <option key={i} value={i}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-chrome-500 dark:text-chrome-400 uppercase tracking-wider mb-1">
                Day
              </div>
              <select
                className="py-1 px-2 rounded-md bg-white dark:bg-chrome-800 border border-chrome-300 dark:border-chrome-900 cursor-pointer outline-none text-chrome-900 dark:text-chrome-50"
                value={yearDay}
                onChange={function (e) {
                  setYearDay(parseInt(e.target.value));
                }}
              >
                {Array.from({ length: 31 }, function (_, i) {
                  return i + 1;
                }).map(function (d) {
                  return (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

        <div>
          <div className="text-xs font-semibold text-chrome-500 dark:text-chrome-400 uppercase tracking-wider mb-1">
            Time
          </div>
          <select
            className="py-1 px-2 rounded-md bg-white dark:bg-chrome-800 border border-chrome-300 dark:border-chrome-900 cursor-pointer outline-none text-chrome-900 dark:text-chrome-50"
            value={hour + ":" + minute}
            onChange={function (e) {
              var parts = e.target.value.split(":");
              setHour(parseInt(parts[0]));
              setMinute(parseInt(parts[1]));
            }}
          >
            {timeOptions.map(function (opt) {
              return (
                <option
                  key={opt.hour + ":" + opt.minute}
                  value={opt.hour + ":" + opt.minute}
                >
                  {opt.label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <button
        className="w-full mt-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover cursor-pointer"
        onClick={handleSchedule}
      >
        Schedule
      </button>
    </div>
  );
}
```

**Step 4: Run build to verify no syntax errors**

Run: `npm run babel`
Expected: No errors

**Step 5: Commit**

```bash
git add src/popup.js
git commit -m "feat: add RecurringPicker UI component in popup"
```

---

### Task 7: Update `sendTabToNapTime` to accept and store `recurPattern`

**Files:**

- Modify: `src/popup.js` (the `sendTabToNapTime` function)
- Test: `sendTabToNapTime.test.js`

**Step 1: Write the failing test**

Add to `sendTabToNapTime.test.js`:

```js
test("stores recurPattern when provided", () => {
  chrome.tabs.query.mockResolvedValueOnce([mockTab]);
  chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });
  chrome.storage.local.set.mockResolvedValueOnce();
  chrome.storage.local.get.mockResolvedValueOnce({ tabs: [{ when: 4000 }] });

  const pattern = {
    frequency: "weekly",
    hour: 14,
    minute: 0,
    weekdays: [1, 3, 5],
  };
  sendTabToNapTime("Repeatedly", 4000, true, pattern);

  return flush().then(() => {
    const setCall = chrome.storage.local.set.mock.calls[0][0];
    expect(setCall.tabs[0].recurring).toBe(true);
    expect(setCall.tabs[0].recurPattern).toEqual(pattern);
  });
});

test("omits recurPattern when not provided", () => {
  chrome.tabs.query.mockResolvedValueOnce([mockTab]);
  chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });
  chrome.storage.local.set.mockResolvedValueOnce();
  chrome.storage.local.get.mockResolvedValueOnce({ tabs: [{ when: 5000 }] });

  sendTabToNapTime("Later Today", 5000);

  return flush().then(() => {
    const setCall = chrome.storage.local.set.mock.calls[0][0];
    expect(setCall.tabs[0]).not.toHaveProperty("recurPattern");
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run babel && npm test -- --testPathPattern=sendTabToNapTime`
Expected: FAIL — recurPattern not stored

**Step 3: Update `sendTabToNapTime` signature and body**

In `src/popup.js`, change the function signature:

```js
function sendTabToNapTime(label, when, recurring, recurPattern) {
```

And in the `.then` block where `tabInfo` is created, add after the recurring check:

```js
if (recurring) {
  tabInfo.recurring = true;
}
if (recurPattern) {
  tabInfo.recurPattern = recurPattern;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run babel && npm test -- --testPathPattern=sendTabToNapTime`
Expected: PASS

**Step 5: Also update the test module.exports if needed**

The `sendTabToNapTime` is already exported. No change needed.

**Step 6: Run all tests**

Run: `npm run babel && npm test`
Expected: All pass

**Step 7: Commit**

```bash
git add src/popup.js sendTabToNapTime.test.js
git commit -m "feat: store recurPattern in tab data when snoozing"
```

---

### Task 8: Show recurring indicator in page.js tab list

**Files:**

- Modify: `src/page.js` (the tab list item rendering)

**Step 1: Add a recurring badge to the tab list item**

In `src/page.js`, in the `List` component where each tab is rendered (around line 481-488 where label and relative time are shown), add a recurring indicator:

Find the `<div className="flex">` block that shows `tab.label` and `getRelativeTimeLabel(tab.when)`. Add a recurring badge:

```js
<div className="flex">
  <div className="text-sm text-chrome-500 dark:text-chrome-400 mr-4">
    {tab.label}
  </div>
  <div className="text-sm text-chrome-500 dark:text-chrome-400">
    {getRelativeTimeLabel(tab.when)}
  </div>
  {tab.recurring && (
    <div className="ml-2 text-xs px-1.5 py-0.5 rounded bg-accent-light dark:bg-accent-darkbg text-accent dark:text-accent-dark">
      {tab.recurPattern ? describeRecurPattern(tab.recurPattern) : "Daily"}
    </div>
  )}
</div>
```

**Step 2: Add `describeRecurPattern` helper function**

Add this to `src/page.js` near the top helper functions:

```js
function describeRecurPattern(pattern) {
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  switch (pattern.frequency) {
    case "daily":
      return "Daily";
    case "weekly":
      var days = (pattern.weekdays || [1]).map(function (d) {
        return dayNames[d];
      });
      return "Every " + days.join(", ");
    case "monthly":
      return "Monthly on the " + ordinal(pattern.dayOfMonth || 1);
    case "yearly":
      var monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return (
        "Yearly on " +
        monthNames[pattern.month || 0] +
        " " +
        (pattern.dayOfYear || 1)
      );
    default:
      return "Recurring";
  }
}

function ordinal(n) {
  var s = ["th", "st", "nd", "rd"];
  var v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
```

**Step 3: Run build to verify**

Run: `npm run babel`
Expected: No errors

**Step 4: Commit**

```bash
git add src/page.js
git commit -m "feat: show recurring schedule badge on snoozed tabs"
```

---

### Task 9: Final integration test and build

**Files:**

- All modified files

**Step 1: Run the full test suite**

Run: `npm run babel && npm test`
Expected: All tests pass

**Step 2: Run production build**

Run: `npm run build`
Expected: Clean build with no errors

**Step 3: Run prettier**

Run: `npm run prettier`

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: format and finalize recurring snooze feature"
```

---

## Summary of Changes

| File                       | Change                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/shared.js`            | Add `getNextRecurrence(pattern)` function with daily/weekly/monthly/yearly support                                                                           |
| `src/background.js`        | Import shared.js; use `recurPattern` for rescheduling recurring tabs                                                                                         |
| `src/popup.js`             | Add `RecurringPicker` component; add `recurring` route; update `sendTabToNapTime` to accept `recurPattern`; change "Repeatedly" button to navigate to picker |
| `src/page.js`              | Add `describeRecurPattern` helper; show recurring badge on tab list items                                                                                    |
| `page.test.js`             | Add tests for `getNextRecurrence` (daily, weekly, monthly, yearly)                                                                                           |
| `background.test.js`       | Add tests for pattern-based rescheduling                                                                                                                     |
| `sendTabToNapTime.test.js` | Add tests for storing recurPattern                                                                                                                           |

## Notes for the Implementer

- **No async/await** — all Chrome APIs use `.then()` chains
- **No React imports** — React is a global, use `React.useState()` etc.
- **Babel required before tests** — always `npm run babel && npm test`
- **shared.js is loaded via `<script>` tag** in popup.html/page.html, AND via `importScripts` in background.js. Functions defined at top level are globals — no import/export needed in production, only for Jest.
- **The `getNextRecurrence` function must be available globally** (defined at top level of shared.js) for both UI and background to use it.
- **Backward compatibility**: Old recurring tabs without `recurPattern` fall back to the legacy "tomorrow at 9 AM" behavior. No migration needed.
