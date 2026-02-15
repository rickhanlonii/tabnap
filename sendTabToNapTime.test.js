const { sendTabToNapTime } = require("./build/popup.js");

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("sendTabToNapTime", () => {
  const mockTab = {
    title: "Example Page",
    url: "http://example.com",
    favIconUrl: "http://example.com/icon.png",
    id: 42,
  };

  test("saves tab info with correct fields", () => {
    chrome.tabs.query.mockResolvedValueOnce([mockTab]);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });
    chrome.storage.local.set.mockResolvedValueOnce();
    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [{ when: 1000, url: "http://example.com" }],
    });

    sendTabToNapTime("Later Today", 1000);

    return flush().then(() => {
      const setCall = chrome.storage.local.set.mock.calls[0][0];
      expect(setCall.tabs[0]).toEqual({
        title: "Example Page",
        label: "Later Today",
        when: 1000,
        url: "http://example.com",
        favicon: "http://example.com/icon.png",
        snoozedAt: expect.any(Number),
      });
    });
  });

  test("initializes tabs array when storage returns null", () => {
    chrome.tabs.query.mockResolvedValueOnce([mockTab]);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: null });
    chrome.storage.local.set.mockResolvedValueOnce();
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [{ when: 2000 }] });

    sendTabToNapTime("Tonight", 2000);

    return flush().then(() => {
      const setCall = chrome.storage.local.set.mock.calls[0][0];
      expect(setCall.tabs).toHaveLength(1);
    });
  });

  test("sorts tabs by when ascending after adding", () => {
    const existingTab = {
      title: "Existing",
      label: "Tomorrow",
      when: 5000,
      url: "http://existing.com",
      favicon: null,
    };

    chrome.tabs.query.mockResolvedValueOnce([mockTab]);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [existingTab] });
    chrome.storage.local.set.mockResolvedValueOnce();
    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [{ when: 1000 }, { when: 5000 }],
    });

    sendTabToNapTime("Later Today", 1000);

    return flush().then(() => {
      const setCall = chrome.storage.local.set.mock.calls[0][0];
      expect(setCall.tabs[0].when).toBe(1000);
      expect(setCall.tabs[1].when).toBe(5000);
    });
  });

  test("creates alarm with earliest tab's when", () => {
    chrome.tabs.query.mockResolvedValueOnce([mockTab]);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });
    chrome.storage.local.set.mockResolvedValueOnce();
    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [{ when: 3000 }, { when: 9000 }],
    });

    sendTabToNapTime("Later Today", 3000);

    return flush().then(() => {
      expect(chrome.alarms.create).toHaveBeenCalledWith("tabnap", {
        when: 3000,
      });
    });
  });

  test("sets recurring: true when recurring param is true", () => {
    chrome.tabs.query.mockResolvedValueOnce([mockTab]);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });
    chrome.storage.local.set.mockResolvedValueOnce();
    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [{ when: 4000 }],
    });

    sendTabToNapTime("Repeatedly", 4000, true);

    return flush().then(() => {
      const setCall = chrome.storage.local.set.mock.calls[0][0];
      expect(setCall.tabs[0].recurring).toBe(true);
    });
  });

  test("omits recurring property when recurring is falsy", () => {
    chrome.tabs.query.mockResolvedValueOnce([mockTab]);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });
    chrome.storage.local.set.mockResolvedValueOnce();
    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [{ when: 5000 }],
    });

    sendTabToNapTime("Later Today", 5000);

    return flush().then(() => {
      const setCall = chrome.storage.local.set.mock.calls[0][0];
      expect(setCall.tabs[0]).not.toHaveProperty("recurring");
    });
  });

  test("queries active tab in current window", () => {
    chrome.tabs.query.mockResolvedValueOnce([mockTab]);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });
    chrome.storage.local.set.mockResolvedValueOnce();
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [{ when: 1000 }] });

    sendTabToNapTime("Later Today", 1000);

    return flush().then(() => {
      expect(chrome.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      });
    });
  });

  test("handles existing tabs in storage — adds to array and re-sorts", () => {
    const existing1 = {
      title: "A",
      label: "A",
      when: 2000,
      url: "a",
      favicon: null,
    };
    const existing2 = {
      title: "B",
      label: "B",
      when: 6000,
      url: "b",
      favicon: null,
    };

    chrome.tabs.query.mockResolvedValueOnce([mockTab]);
    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [existing1, existing2],
    });
    chrome.storage.local.set.mockResolvedValueOnce();
    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [{ when: 2000 }, { when: 4000 }, { when: 6000 }],
    });

    sendTabToNapTime("New", 4000);

    return flush().then(() => {
      const setCall = chrome.storage.local.set.mock.calls[0][0];
      expect(setCall.tabs).toHaveLength(3);
      expect(setCall.tabs[0].when).toBe(2000);
      expect(setCall.tabs[1].when).toBe(4000);
      expect(setCall.tabs[2].when).toBe(6000);
    });
  });

  test("catches errors from query rejection", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const err = new Error("query failed");
    chrome.tabs.query.mockRejectedValueOnce(err);

    sendTabToNapTime("Later Today", 1000);

    return flush().then(() => {
      expect(consoleSpy).toHaveBeenCalledWith(err);
      consoleSpy.mockRestore();
    });
  });

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

  test("does not call tabs.remove or window.close in test env", () => {
    chrome.tabs.query.mockResolvedValueOnce([mockTab]);
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [] });
    chrome.storage.local.set.mockResolvedValueOnce();
    chrome.storage.local.get.mockResolvedValueOnce({
      tabs: [{ when: 1000 }],
    });

    sendTabToNapTime("Later Today", 1000);

    return flush().then(() => {
      // In test env, saved/played/playCallback are undefined,
      // so tab close logic doesn't execute
      expect(chrome.tabs.remove).not.toHaveBeenCalled();
      expect(window.close).not.toHaveBeenCalled();
    });
  });
});
