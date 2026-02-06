global.DEFAULT_SETTINGS = {
  laterStartsHour: 3,
  tonightStartsHour: 19,
  tomorrowStartsHour: 9,
  weekendStartsDay: 6,
  weekStartsDay: 1,
  somedayMonths: 3,
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
    create: jest.fn(),
    onClicked: { addListener: jest.fn() },
  },
  windows: {
    update: jest.fn(() => Promise.resolve()),
  },
  runtime: {
    onInstalled: {
      addListener: jest.fn(),
    },
  },
  idle: {
    onStateChanged: {
      addListener: jest.fn(),
    },
  },
};
