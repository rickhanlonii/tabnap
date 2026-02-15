// background.test.js needs the chrome mock before requiring background.js
require("./test-setup.js");

// Make shared.js globals available (in browser, background.js loads via importScripts)
const _shared = require("./build/shared.js");
global.getNextRecurrence = _shared.getNextRecurrence;

const {
  sortedTabs,
  checkTabs,
  setSettings,
  playWakeupSound,
  resetOffscreenCreated,
  setLastWokenTabId,
} = require("./build/background.js");

// Capture listener callbacks registered during require(), before any clearAllMocks
const onInstalledCallback =
  chrome.runtime.onInstalled.addListener.mock.calls[0][0];
const idleCallback = chrome.idle.onStateChanged.addListener.mock.calls[0][0];
const notifCallback =
  chrome.notifications.onClicked.addListener.mock.calls[0][0];

describe("sortedTabs", () => {
  test("sorts tabs ascending by when", () => {
    const tabs = [
      { url: "c", when: 300 },
      { url: "a", when: 100 },
      { url: "b", when: 200 },
    ];
    const result = sortedTabs(tabs);
    expect(result).toEqual([
      { url: "a", when: 100 },
      { url: "b", when: 200 },
      { url: "c", when: 300 },
    ]);
  });

  test("handles empty array", () => {
    expect(sortedTabs([])).toEqual([]);
  });

  test("does not mutate input", () => {
    const tabs = [
      { url: "b", when: 200 },
      { url: "a", when: 100 },
    ];
    const original = [...tabs];
    sortedTabs(tabs);
    expect(tabs).toEqual(original);
  });
});

describe("checkTabs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("opens past-due tabs and keeps future tabs", () => {
    const now = Date.now();
    const pastTab = { url: "http://past.com", when: now - 1000, title: "Past" };
    const futureTab = {
      url: "http://future.com",
      when: now + 100000,
      title: "Future",
    };

    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [pastTab, futureTab],
    });
    chrome.storage.local.set.mockResolvedValueOnce();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: "http://past.com",
        active: false,
      });
      expect(chrome.tabs.create).not.toHaveBeenCalledWith({
        url: "http://future.com",
        active: false,
      });
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        tabs: [futureTab],
      });
      expect(chrome.alarms.create).toHaveBeenCalledWith("tabnap", {
        when: futureTab.when,
      });
    });
  });

  test("does nothing when no tabs", () => {
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.tabs.create).not.toHaveBeenCalled();
    });
  });

  test("batching: opens tabs within 60s window", () => {
    const now = Date.now();
    const soonTab = {
      url: "http://soon.com",
      when: now + 30000,
      title: "Soon",
    };
    const laterTab = {
      url: "http://later.com",
      when: now + 120000,
      title: "Later",
    };

    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [soonTab, laterTab],
    });
    chrome.storage.local.set.mockResolvedValueOnce();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: "http://soon.com",
        active: false,
      });
      expect(chrome.tabs.create).not.toHaveBeenCalledWith({
        url: "http://later.com",
        active: false,
      });
    });
  });

  test("notification includes tab titles and uses tabnap-wakeup ID", () => {
    const now = Date.now();
    const tab1 = { url: "http://a.com", when: now - 1000, title: "Tab A" };
    const tab2 = { url: "http://b.com", when: now - 500, title: "Tab B" };

    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [tab1, tab2],
    });
    chrome.storage.local.set.mockResolvedValueOnce();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.notifications.create).toHaveBeenCalledWith(
        "tabnap-wakeup",
        expect.objectContaining({
          message: expect.stringContaining("Tab A"),
        })
      );
      expect(chrome.notifications.create).toHaveBeenCalledWith(
        "tabnap-wakeup",
        expect.objectContaining({
          message: expect.stringContaining("Tab B"),
        })
      );
    });
  });

  test("no notification when showNotifications is off", () => {
    const now = Date.now();
    const tab = { url: "http://test.com", when: now - 1000, title: "Test" };

    setSettings({ ...DEFAULT_SETTINGS, showNotifications: 0 });
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [tab] });
    chrome.storage.local.set.mockResolvedValueOnce();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.tabs.create).toHaveBeenCalled();
      expect(chrome.notifications.create).not.toHaveBeenCalled();
      setSettings({ ...DEFAULT_SETTINGS });
    });
  });

  test("no sound when playWakeupSound is off", () => {
    const now = Date.now();
    const tab = { url: "http://test.com", when: now - 1000, title: "Test" };

    setSettings({ ...DEFAULT_SETTINGS, playWakeupSound: 0 });
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [tab] });
    chrome.storage.local.set.mockResolvedValueOnce();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.tabs.create).toHaveBeenCalled();
      expect(chrome.offscreen.createDocument).not.toHaveBeenCalled();
      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
      setSettings({ ...DEFAULT_SETTINGS });
    });
  });

  test("recurring tab stays in storage with updated when", () => {
    const now = Date.now();
    const recurringTab = {
      url: "http://recurring.com",
      when: now - 1000,
      title: "Recurring",
      recurring: true,
    };

    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [recurringTab],
    });
    chrome.storage.local.set.mockResolvedValueOnce();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: "http://recurring.com",
        active: false,
      });
      const setCall = chrome.storage.local.set.mock.calls[0][0];
      expect(setCall.tabs).toHaveLength(1);
      expect(setCall.tabs[0].url).toBe("http://recurring.com");
      expect(setCall.tabs[0].recurring).toBe(true);
      expect(setCall.tabs[0].when).toBeGreaterThan(now);
    });
  });

  test("recurring tab with recurPattern uses getNextRecurrence for rescheduling", () => {
    const now = Date.now();

    const recurringTab = {
      url: "http://recurring.com",
      when: now - 1000,
      title: "Recurring",
      recurring: true,
      recurPattern: { frequency: "daily", hour: 14, minute: 30 },
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
      const nextWhen = new Date(rescheduled.when);
      expect(nextWhen.getHours()).toBe(14);
      expect(nextWhen.getMinutes()).toBe(30);
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

  test("shows '+N more' suffix for >5 tabs", () => {
    const now = Date.now();
    const tabs = [];
    for (let i = 0; i < 7; i++) {
      tabs.push({
        url: `http://${i}.com`,
        when: now - 1000,
        title: `Tab ${i}`,
      });
    }

    chrome.storage.local.get.mockResolvedValueOnce({ tabs });
    chrome.storage.local.set.mockResolvedValueOnce();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.notifications.create).toHaveBeenCalledWith(
        "tabnap-wakeup",
        expect.objectContaining({
          message: expect.stringContaining("+ 2 more"),
        })
      );
    });
  });

  test("shows singular 'tab' for 1 tab", () => {
    const now = Date.now();
    const tab = { url: "http://single.com", when: now - 1000, title: "Single" };

    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [tab] });
    chrome.storage.local.set.mockResolvedValueOnce();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.notifications.create).toHaveBeenCalledWith(
        "tabnap-wakeup",
        expect.objectContaining({
          message: expect.stringContaining("1 tab\n"),
        })
      );
    });
  });

  test("shows plural 'tabs' for multiple tabs", () => {
    const now = Date.now();
    const tabs = [
      { url: "http://a.com", when: now - 1000, title: "A" },
      { url: "http://b.com", when: now - 500, title: "B" },
      { url: "http://c.com", when: now - 200, title: "C" },
    ];

    chrome.storage.local.get.mockResolvedValueOnce({ tabs });
    chrome.storage.local.set.mockResolvedValueOnce();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.notifications.create).toHaveBeenCalledWith(
        "tabnap-wakeup",
        expect.objectContaining({
          message: expect.stringContaining("3 tabs"),
        })
      );
    });
  });

  test("writes history entries when tabs wake up", () => {
    const now = Date.now();
    const tab = {
      url: "http://test.com",
      when: now - 1000,
      title: "Test",
      label: "Later Today",
      favicon: "http://test.com/icon.png",
      snoozedAt: now - 10000,
    };

    chrome.storage.local.get
      .mockResolvedValueOnce({ tabs: [tab] })
      .mockResolvedValueOnce({ history: [] });
    chrome.storage.local.set.mockResolvedValue();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      // First set call is for tabs, second get is for history
      const historyCalls = chrome.storage.local.set.mock.calls;
      const historySet = historyCalls.find((c) => c[0].history);
      expect(historySet).toBeDefined();
      expect(historySet[0].history).toHaveLength(1);
      expect(historySet[0].history[0]).toEqual(
        expect.objectContaining({
          title: "Test",
          url: "http://test.com",
          label: "Later Today",
          snoozedAt: now - 10000,
          wokeAt: expect.any(Number),
        })
      );
    });
  });

  test("recurring tabs excluded from history", () => {
    const now = Date.now();
    const recurringTab = {
      url: "http://recurring.com",
      when: now - 1000,
      title: "Recurring",
      recurring: true,
    };

    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [recurringTab] });
    chrome.storage.local.set.mockResolvedValue();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      // history get should not be called since all tabs are recurring
      const getCalls = chrome.storage.local.get.mock.calls;
      const historyGet = getCalls.find(
        (c) => Array.isArray(c[0]) && c[0].includes("history")
      );
      expect(historyGet).toBeUndefined();
    });
  });

  test("history capped at 200 entries", () => {
    const now = Date.now();
    const tab = {
      url: "http://new.com",
      when: now - 1000,
      title: "New",
      label: "Tonight",
    };

    const existingHistory = [];
    for (let i = 0; i < 200; i++) {
      existingHistory.push({
        url: `http://${i}.com`,
        title: `Old ${i}`,
        wokeAt: now - 100000 - i,
      });
    }

    chrome.storage.local.get
      .mockResolvedValueOnce({ tabs: [tab] })
      .mockResolvedValueOnce({ history: existingHistory });
    chrome.storage.local.set.mockResolvedValue();

    checkTabs();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const historyCalls = chrome.storage.local.set.mock.calls;
      const historySet = historyCalls.find((c) => c[0].history);
      expect(historySet).toBeDefined();
      expect(historySet[0].history).toHaveLength(200);
      // New entry should be first
      expect(historySet[0].history[0].url).toBe("http://new.com");
    });
  });
});

describe("playWakeupSound", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetOffscreenCreated();
  });

  test("creates offscreen document on first call and sends message", () => {
    chrome.offscreen.createDocument.mockResolvedValueOnce();

    playWakeupSound();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.offscreen.createDocument).toHaveBeenCalledWith({
        url: "offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Playing wake-up sound for snoozed tabs",
      });
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: "play-sound",
        url: "/lib/wakeup.wav",
      });
    });
  });

  test("sends message directly when already created", () => {
    // First call to set offscreenCreated = true
    chrome.offscreen.createDocument.mockResolvedValueOnce();
    playWakeupSound();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      jest.clearAllMocks();

      // Second call should skip createDocument
      playWakeupSound();

      expect(chrome.offscreen.createDocument).not.toHaveBeenCalled();
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: "play-sound",
        url: "/lib/wakeup.wav",
      });
    });
  });

  test("handles 'already exists' error — still sends message and sets flag", () => {
    const err = new Error(
      "Only a single offscreen document may be created for a given extension. One already exists."
    );
    chrome.offscreen.createDocument.mockRejectedValueOnce(err);

    playWakeupSound();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: "play-sound",
        url: "/lib/wakeup.wav",
      });
    });
  });

  test("logs other errors to console and does not send message", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const err = new Error("some other error");
    chrome.offscreen.createDocument.mockRejectedValueOnce(err);

    playWakeupSound();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(consoleSpy).toHaveBeenCalledWith(err);
      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  test("sends correct sound URL", () => {
    chrome.offscreen.createDocument.mockResolvedValueOnce();

    playWakeupSound();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const msg = chrome.runtime.sendMessage.mock.calls[0][0];
      expect(msg.url).toBe("/lib/wakeup.wav");
    });
  });
});

describe("onInstalled listener", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates alarm if none exists", () => {
    chrome.alarms.get.mockResolvedValueOnce(null);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });

    onInstalledCallback();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.alarms.get).toHaveBeenCalledWith("tabnap");
      expect(chrome.alarms.create).toHaveBeenCalledWith(
        "tabnap",
        expect.objectContaining({ periodInMinutes: 1.0 })
      );
    });
  });

  test("skips alarm creation if one already exists", () => {
    chrome.alarms.get.mockResolvedValueOnce({ name: "tabnap" });
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });

    onInstalledCallback();

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.alarms.create).not.toHaveBeenCalled();
    });
  });

  test("calls checkTabs on install", () => {
    chrome.alarms.get.mockResolvedValueOnce(null);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });

    onInstalledCallback();

    // checkTabs calls storage.local.get
    expect(chrome.storage.local.get).toHaveBeenCalledWith(["tabs"]);
  });
});

describe("idle.onStateChanged listener", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("clears alarm when idle", () => {
    idleCallback("idle");
    expect(chrome.alarms.clear).toHaveBeenCalledWith("tabnap");
  });

  test("clears alarm when locked", () => {
    idleCallback("locked");
    expect(chrome.alarms.clear).toHaveBeenCalledWith("tabnap");
  });

  test("recreates alarm on active with 60s WiFi delay for past-due tab", () => {
    const now = Date.now();
    const pastTab = { url: "http://past.com", when: now - 5000 };

    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [pastTab],
    });

    idleCallback("active");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.alarms.create).toHaveBeenCalledWith("tabnap", {
        when: expect.any(Number),
      });
      const alarmWhen = chrome.alarms.create.mock.calls[0][1].when;
      // Should be ~60s from now, not the past tab's when
      expect(alarmWhen).toBeGreaterThanOrEqual(now + 59000);
      expect(alarmWhen).toBeLessThanOrEqual(now + 61000);
    });
  });

  test("uses tab's when if >60s away", () => {
    const now = Date.now();
    const futureWhen = now + 300000; // 5 min in future
    const futureTab = { url: "http://future.com", when: futureWhen };

    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [futureTab],
    });

    idleCallback("active");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.alarms.create).toHaveBeenCalledWith("tabnap", {
        when: futureWhen,
      });
    });
  });
});

describe("notifications.onClicked listener", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("focuses last woken tab on tabnap-wakeup click", () => {
    setLastWokenTabId(99);
    chrome.tabs.update.mockResolvedValueOnce({ id: 99, windowId: 5 });

    notifCallback("tabnap-wakeup");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.tabs.update).toHaveBeenCalledWith(99, { active: true });
      expect(chrome.windows.update).toHaveBeenCalledWith(5, { focused: true });
    });
  });

  test("ignores other notification IDs", () => {
    setLastWokenTabId(99);

    notifCallback("some-other-notification");

    expect(chrome.tabs.update).not.toHaveBeenCalled();
  });

  test("ignores when lastWokenTabId is null", () => {
    setLastWokenTabId(null);

    notifCallback("tabnap-wakeup");

    expect(chrome.tabs.update).not.toHaveBeenCalled();
  });
});
