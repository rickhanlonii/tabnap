var iconData = require("./build/icon-data.js");
global.ICON_DATA = iconData.ICON_DATA;
global.MONTH_NAMES = iconData.MONTH_NAMES;
global.MONTH_SHORT_NAMES = iconData.MONTH_SHORT_NAMES;
global.DAY_NAMES = iconData.DAY_NAMES;

global.makeDuotoneIcon = function (key) {
  var d = ICON_DATA[key];
  return function () {
    return null;
  };
};

global.DEFAULT_SETTINGS = {
  laterStartsHour: 3,
  tonightStartsHour: 19,
  tomorrowStartsHour: 9,
  weekendStartsDay: 6,
  weekStartsDay: 1,
  somedayMonths: 3,
  showNotifications: 1,
  playWakeupSound: 1,
  debugMode: 0,
  theme: 0,
  colorPalette: 4,
};

global.COLOR_PALETTES = [
  {
    id: "blue",
    name: "Blue",
    base: "#1A73E8",
    hover: "#1967D2",
    dark: "#8AB4F8",
    light: "#E8F0FE",
    focus: "#D2E3FC",
    darkBg: "#1E3A5F",
  },
];

global.window = {
  close: jest.fn(),
  matchMedia: jest.fn(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
};

global.chrome = {
  storage: {
    local: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(() => Promise.resolve([])),
    create: jest.fn(() => Promise.resolve({ id: 1, windowId: 1 })),
    update: jest.fn(() => Promise.resolve({ id: 1, windowId: 1 })),
    remove: jest.fn(() => Promise.resolve()),
  },
  alarms: {
    create: jest.fn(),
    get: jest.fn(() => Promise.resolve(null)),
    clear: jest.fn(),
    onAlarm: {
      addListener: jest.fn(),
    },
  },
  notifications: {
    create: jest.fn(() => Promise.resolve()),
    onClicked: { addListener: jest.fn() },
  },
  windows: {
    update: jest.fn(() => Promise.resolve()),
  },
  offscreen: {
    createDocument: jest.fn(() => Promise.resolve()),
  },
  runtime: {
    sendMessage: jest.fn(),
    onInstalled: {
      addListener: jest.fn(),
    },
    onMessage: { addListener: jest.fn() },
  },
  idle: {
    onStateChanged: {
      addListener: jest.fn(),
    },
  },
};
