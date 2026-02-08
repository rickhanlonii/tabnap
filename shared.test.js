let mockState;
let effectCallback;
let effectCleanup;

global.React = {
  useState: jest.fn((init) => {
    mockState = jest.fn();
    return [init, mockState];
  }),
  useEffect: jest.fn((fn) => {
    effectCleanup = fn();
  }),
  createElement: jest.fn(),
};

require("./test-setup.js");

const { useChromeStorage } = require("./build/shared.js");

beforeEach(() => {
  jest.clearAllMocks();
  mockState = null;
  effectCleanup = null;
});

describe("useChromeStorage", () => {
  test("returns default value initially", () => {
    chrome.storage.local.get.mockResolvedValueOnce({});
    const result = useChromeStorage("tabs", []);
    expect(result).toEqual([]);
  });

  test("loads value from chrome storage on mount", () => {
    chrome.storage.local.get.mockResolvedValueOnce({ tabs: [{ url: "a" }] });

    useChromeStorage("tabs", []);

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(chrome.storage.local.get).toHaveBeenCalledWith(["tabs"]);
      expect(mockState).toHaveBeenCalledWith([{ url: "a" }]);
    });
  });

  test("updates value on storage change", () => {
    chrome.storage.local.get.mockResolvedValueOnce({});

    useChromeStorage("tabs", []);

    // Extract the listener passed to onChanged.addListener
    const listener = chrome.storage.onChanged.addListener.mock.calls[0][0];
    listener({ tabs: { oldValue: [], newValue: [{ url: "b" }] } }, "local");

    expect(mockState).toHaveBeenCalledWith([{ url: "b" }]);
  });

  test("ignores changes for other keys", () => {
    chrome.storage.local.get.mockResolvedValueOnce({});

    useChromeStorage("tabs", []);

    const listener = chrome.storage.onChanged.addListener.mock.calls[0][0];
    listener(
      { settings: { oldValue: null, newValue: { laterStartsHour: 5 } } },
      "local"
    );

    // mockState should not have been called (only the initial useEffect get may call it)
    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      // Only call from get resolution (if any), never from the listener
      const callsFromListener = mockState.mock.calls.filter(
        (call) => call[0] && call[0].laterStartsHour
      );
      expect(callsFromListener).toHaveLength(0);
    });
  });

  test("removes listener on cleanup", () => {
    chrome.storage.local.get.mockResolvedValueOnce({});

    useChromeStorage("tabs", []);

    expect(typeof effectCleanup).toBe("function");
    effectCleanup();
    expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled();
  });
});
