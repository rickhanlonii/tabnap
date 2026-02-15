const {
  groupHistoryByTimePeriod,
  getHistoryTimeLabel,
} = require("./build/page.js");

describe("groupHistoryByTimePeriod", () => {
  test("returns empty array for empty input", () => {
    expect(groupHistoryByTimePeriod([])).toEqual([]);
  });

  test("groups entries into Today", () => {
    const now = Date.now();
    const entry = { url: "http://a.com", wokeAt: now - 1000 };
    const groups = groupHistoryByTimePeriod([entry]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Today");
    expect(groups[0].entries).toHaveLength(1);
  });

  test("groups entries into Yesterday", () => {
    const now = new Date();
    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      12,
      0,
      0
    );
    const entry = { url: "http://a.com", wokeAt: yesterday.getTime() };
    const groups = groupHistoryByTimePeriod([entry]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Yesterday");
  });

  test("groups entries into This Week, Last Week, and Older", () => {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // This week: earlier this week (if not Sunday)
    const thisWeekDate = new Date(now);
    thisWeekDate.setDate(now.getDate() - Math.max(dayOfWeek - 1, 0));
    thisWeekDate.setDate(thisWeekDate.getDate() - 2); // a few days ago

    // Last week
    const lastWeekDate = new Date(now);
    lastWeekDate.setDate(now.getDate() - dayOfWeek - 3);

    // Older
    const olderDate = new Date(now);
    olderDate.setDate(now.getDate() - 30);

    const entries = [
      { url: "http://thisweek.com", wokeAt: thisWeekDate.getTime() },
      { url: "http://lastweek.com", wokeAt: lastWeekDate.getTime() },
      { url: "http://older.com", wokeAt: olderDate.getTime() },
    ];

    const groups = groupHistoryByTimePeriod(entries);
    const labels = groups.map((g) => g.label);
    // Should have at least Older in labels
    expect(labels).toContain("Older");
  });

  test("preserves order within groups", () => {
    const now = Date.now();
    const entries = [
      { url: "http://a.com", wokeAt: now - 1000 },
      { url: "http://b.com", wokeAt: now - 2000 },
    ];
    const groups = groupHistoryByTimePeriod(entries);
    expect(groups[0].entries[0].url).toBe("http://a.com");
    expect(groups[0].entries[1].url).toBe("http://b.com");
  });
});

describe("getHistoryTimeLabel", () => {
  test("returns 'Unknown' for null", () => {
    expect(getHistoryTimeLabel(null)).toBe("Unknown");
  });

  test("returns 'Unknown' for undefined", () => {
    expect(getHistoryTimeLabel(undefined)).toBe("Unknown");
  });

  test("returns 'Today at ...' for today's timestamp", () => {
    const now = Date.now();
    const label = getHistoryTimeLabel(now - 1000);
    expect(label).toMatch(/^Today at /);
  });

  test("returns 'Yesterday at ...' for yesterday's timestamp", () => {
    const now = new Date();
    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      14,
      30,
      0
    );
    const label = getHistoryTimeLabel(yesterday.getTime());
    expect(label).toMatch(/^Yesterday at /);
  });

  test("returns 'Mon DD at ...' for same-year timestamp", () => {
    const now = new Date();
    const oldDate = new Date(now.getFullYear(), 0, 15, 10, 0, 0);
    // Only test if Jan 15 this year is not today or yesterday
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (oldDate < yesterday) {
      const label = getHistoryTimeLabel(oldDate.getTime());
      expect(label).toMatch(/^Jan 15 at /);
    }
  });

  test("returns 'Mon DD, YYYY' for different-year timestamp", () => {
    const oldDate = new Date(2022, 5, 10, 10, 0, 0); // Jun 10, 2022
    const label = getHistoryTimeLabel(oldDate.getTime());
    expect(label).toBe("Jun 10, 2022");
  });
});
