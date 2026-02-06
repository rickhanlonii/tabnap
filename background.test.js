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
});
