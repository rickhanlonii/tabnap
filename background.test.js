// background.test.js needs the chrome mock before requiring background.js
require("./test-setup.js");

const { sortedTabs, checkTabs } = require("./build/background.js");

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
      });
      expect(chrome.tabs.create).not.toHaveBeenCalledWith({
        url: "http://future.com",
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
      });
      expect(chrome.tabs.create).not.toHaveBeenCalledWith({
        url: "http://later.com",
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
      });
      const setCall = chrome.storage.local.set.mock.calls[0][0];
      expect(setCall.tabs).toHaveLength(1);
      expect(setCall.tabs[0].url).toBe("http://recurring.com");
      expect(setCall.tabs[0].recurring).toBe(true);
      expect(setCall.tabs[0].when).toBeGreaterThan(now);
    });
  });
});
