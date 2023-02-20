const {
  getTimeForThreeHoursFromNowInMs,
  getTimeFor7pmTodayInMs,
  getTimeFor9amTomorrowInMs,
  getTimeForSaturdayAt9am,
  getTimeForNextMondayAt9am,
  getTimeForNextMonthAt9am,
  getTimeFor9amThreeMonthsFromNow,
} = require("./build/popup.js");

const DEFAULT = {
  laterStartsHour: 3,
  tonightStartsHour: 19,
  tomorrowStartsHour: 9,
  weekendStartsDay: 6,
  weekStartsDay: 1,
  somedayMonths: 3,
};

function toBeDate(actual, year, month, date, hours, minutes, seconds) {
  const options = {
    comment: "Object.is equality",
    isNot: this.isNot,
    promise: this.promise,
  };

  const expectedDate = new Date(year, month, date, hours, minutes, seconds);
  let actualDate = typeof actual === "number" ? new Date(actual) : actual;
  const pass = actualDate.getTime() === expectedDate.getTime();
  if (pass) {
    return {
      message: () =>
        `expected ${this.utils.printReceived(
          actualDate.toLocaleString()
        )} not to be within range ${this.utils.printExpected(
          expectedDate.toLocaleString()
        )}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        this.utils.matcherHint("toBeDate", undefined, undefined, options) +
        `\n\nSys Time: ${this.utils.printExpected(
          new Date().toLocaleString()
        )}\nReceived: ${this.utils.printReceived(
          actualDate.toLocaleString()
        )}\nExpected: ${this.utils.printExpected(
          expectedDate.toLocaleString()
        )}`,
      pass: false,
    };
  }
}

expect.extend({
  toBeDate,
});

beforeAll(() => {
  document = jest.fn();
  ReactDOM = jest.fn();
  jest.useFakeTimers("modern");
  jest.setSystemTime(new Date(2023, 1, 20, 11, 0, 0));
});

afterAll(() => {
  jest.useRealTimers();
});

describe("getTimeForThreeHoursFromNowInMs", () => {
  test("easy", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 11, 0, 0));
    expect(getTimeForThreeHoursFromNowInMs(DEFAULT)).toBeDate(
      2023,
      1,
      20,
      14,
      0,
      0
    );
  });

  test("day rollover", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 23, 0, 0));
    expect(getTimeForThreeHoursFromNowInMs(DEFAULT)).toBeDate(
      2023,
      1,
      21,
      2,
      0,
      0
    );
  });

  test("month rollover", () => {
    jest.setSystemTime(new Date(2023, 1, 28, 23, 0, 0));
    expect(getTimeForThreeHoursFromNowInMs(DEFAULT)).toBeDate(
      2023,
      2,
      1,
      2,
      0,
      0
    );
  });

  test("year rollover", () => {
    jest.setSystemTime(new Date(2023, 11, 31, 23, 0, 0));
    expect(getTimeForThreeHoursFromNowInMs(DEFAULT)).toBeDate(
      2024,
      0,
      1,
      2,
      0,
      0
    );
  });
});

describe("getTimeFor7pmTodayInMs", () => {
  test("easy", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 11, 0, 0));
    expect(getTimeFor7pmTodayInMs(DEFAULT)).toBeDate(2023, 1, 20, 19, 0, 0);
  });

  test("exactly 7pm", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 19, 0, 0));
    expect(getTimeFor7pmTodayInMs(DEFAULT)).toBeDate(2023, 1, 21, 19, 0, 0);
  });

  test("day rolloever", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 20, 0, 0));
    expect(getTimeFor7pmTodayInMs(DEFAULT)).toBeDate(2023, 1, 21, 19, 0, 0);
  });

  test("month rollover", () => {
    jest.setSystemTime(new Date(2023, 1, 28, 20, 0, 0));
    expect(getTimeFor7pmTodayInMs(DEFAULT)).toBeDate(2023, 2, 1, 19, 0, 0);
  });

  test("year rollover", () => {
    jest.setSystemTime(new Date(2023, 11, 31, 20, 0, 0));
    expect(getTimeFor7pmTodayInMs(DEFAULT)).toBeDate(2024, 0, 1, 19, 0, 0);
  });
});

describe("getTimeFor9amTomorrowInMs", () => {
  test("easy", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 11, 0, 0));
    expect(getTimeFor9amTomorrowInMs(DEFAULT)).toBeDate(2023, 1, 21, 9, 0, 0);
  });

  test("before 9am", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 8, 0, 0));
    expect(getTimeFor9amTomorrowInMs(DEFAULT)).toBeDate(2023, 1, 21, 9, 0, 0);
  });

  test("exactly 9am", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 9, 0, 0));
    expect(getTimeFor9amTomorrowInMs(DEFAULT)).toBeDate(2023, 1, 21, 9, 0, 0);
  });

  test("month rollover", () => {
    jest.setSystemTime(new Date(2023, 1, 28, 11, 0, 0));
    expect(getTimeFor9amTomorrowInMs(DEFAULT)).toBeDate(2023, 2, 1, 9, 0, 0);
  });

  test("year rollover", () => {
    jest.setSystemTime(new Date(2023, 11, 31, 11, 0, 0));
    expect(getTimeFor9amTomorrowInMs(DEFAULT)).toBeDate(2024, 0, 1, 9, 0, 0);
  });
});

describe("getTimeForSaturdayAt9am", () => {
  test("easy", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 11, 0, 0));
    expect(getTimeForSaturdayAt9am(DEFAULT)).toBeDate(2023, 1, 25, 9, 0, 0);
  });

  test("exactly saturday", () => {
    jest.setSystemTime(new Date(2023, 1, 18, 11, 0, 0));
    expect(getTimeForSaturdayAt9am(DEFAULT)).toBeDate(2023, 1, 25, 9, 0, 0);
  });

  test("month rollover", () => {
    jest.setSystemTime(new Date(2023, 1, 28, 11, 0, 0));
    expect(getTimeForSaturdayAt9am(DEFAULT)).toBeDate(2023, 2, 4, 9, 0, 0);
  });

  test("year rollover", () => {
    jest.setSystemTime(new Date(2023, 11, 31, 11, 0, 0));
    expect(getTimeForSaturdayAt9am(DEFAULT)).toBeDate(2024, 0, 6, 9, 0, 0);
  });
});

describe("getTimeForNextMondayAt9am", () => {
  test("easy", () => {
    jest.setSystemTime(new Date(2023, 1, 21, 11, 0, 0));
    expect(getTimeForNextMondayAt9am(DEFAULT)).toBeDate(2023, 1, 27, 9, 0, 0);
  });

  test("exactly monday", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 11, 0, 0));
    expect(getTimeForNextMondayAt9am(DEFAULT)).toBeDate(2023, 1, 27, 9, 0, 0);
  });

  test("month rollover", () => {
    jest.setSystemTime(new Date(2023, 1, 27, 11, 0, 0));
    expect(getTimeForNextMondayAt9am(DEFAULT)).toBeDate(2023, 2, 6, 9, 0, 0);
  });

  test("year rollover", () => {
    jest.setSystemTime(new Date(2023, 11, 27, 11, 0, 0));

    expect(getTimeForNextMondayAt9am(DEFAULT)).toBeDate(2024, 0, 1, 9, 0, 0);
  });
});

describe("getTimeForNextMonthAt9am", () => {
  test("easy", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 11, 0, 0));
    expect(getTimeForNextMonthAt9am(DEFAULT)).toBeDate(2023, 2, 20, 9, 0, 0);
  });

  test("year rollover", () => {
    jest.setSystemTime(new Date(2023, 11, 20, 11, 0, 0));
    expect(getTimeForNextMonthAt9am(DEFAULT)).toBeDate(2024, 0, 20, 9, 0, 0);
  });
});

describe("getTimeFor9amThreeMonthsFromNow", () => {
  test("easy", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 11, 0, 0));
    expect(getTimeFor9amThreeMonthsFromNow(DEFAULT)).toBeDate(
      2023,
      4,
      20,
      9,
      0,
      0
    );
  });

  test("year rollover", () => {
    jest.setSystemTime(new Date(2023, 11, 20, 11, 0, 0));
    expect(getTimeFor9amThreeMonthsFromNow(DEFAULT)).toBeDate(
      2024,
      2,
      20,
      9,
      0,
      0
    );
  });
});
