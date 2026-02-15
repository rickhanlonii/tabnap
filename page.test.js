const {
  getTimeForThreeHoursFromNowInMs,
  getTimeFor7pmTodayInMs,
  getTimeFor9amTomorrowInMs,
  getTimeForSaturdayAt9am,
  getTimeForNextMondayAt9am,
  getTimeForNextMonthAt9am,
  getTimeFor9amThreeMonthsFromNow,
  getWhenForTime,
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

  test("day rollover", () => {
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

  test("sunday with default weekStartsDay=1 should be 1 day", () => {
    // Feb 19 2023 is Sunday (getDay()=0), weekStartsDay=1 (Monday)
    jest.setSystemTime(new Date(2023, 1, 19, 11, 0, 0));
    expect(getTimeForNextMondayAt9am(DEFAULT)).toBeDate(2023, 1, 20, 9, 0, 0);
  });

  test("non-default weekStartsDay=3 on Thursday", () => {
    // Feb 23 2023 is Thursday (getDay()=4), weekStartsDay=3 (Wednesday)
    jest.setSystemTime(new Date(2023, 1, 23, 11, 0, 0));
    expect(
      getTimeForNextMondayAt9am({ ...DEFAULT, weekStartsDay: 3 })
    ).toBeDate(2023, 2, 1, 9, 0, 0);
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

describe("getWhenForTime", () => {
  beforeEach(() => {
    jest.setSystemTime(new Date(2023, 1, 20, 11, 0, 0));
  });

  test("later returns three hours from now", () => {
    expect(getWhenForTime("later")).toBeDate(2023, 1, 20, 14, 0, 0);
  });

  test("tonight returns 7pm today", () => {
    expect(getWhenForTime("tonight")).toBeDate(2023, 1, 20, 19, 0, 0);
  });

  test("tomorrow returns 9am tomorrow", () => {
    expect(getWhenForTime("tomorrow")).toBeDate(2023, 1, 21, 9, 0, 0);
  });

  test("weekend returns saturday at 9am", () => {
    expect(getWhenForTime("weekend")).toBeDate(2023, 1, 25, 9, 0, 0);
  });

  test("week returns next monday at 9am", () => {
    expect(getWhenForTime("week")).toBeDate(2023, 1, 27, 9, 0, 0);
  });

  test("month returns next month at 9am", () => {
    expect(getWhenForTime("month")).toBeDate(2023, 2, 20, 9, 0, 0);
  });

  test("recurring returns 9am tomorrow", () => {
    expect(getWhenForTime("recurring")).toBeDate(2023, 1, 21, 9, 0, 0);
  });

  test("someday returns 3 months from now at 9am", () => {
    expect(getWhenForTime("someday")).toBeDate(2023, 4, 20, 9, 0, 0);
  });
});

describe("edge cases", () => {
  test("getTimeForNextMonthAt9am on Jan 31 handles Feb overflow", () => {
    jest.setSystemTime(new Date(2023, 0, 31, 11, 0, 0));
    // Jan 31 + 1 month = Mar 3 (Feb has 28 days in 2023)
    expect(getTimeForNextMonthAt9am(DEFAULT)).toBeDate(2023, 2, 3, 9, 0, 0);
  });

  test("getTimeFor9amThreeMonthsFromNow on Nov 30", () => {
    jest.setSystemTime(new Date(2023, 10, 30, 11, 0, 0));
    // Nov 30 + 3 months = Mar 1, 2024 (Feb overflow)
    expect(getTimeFor9amThreeMonthsFromNow(DEFAULT)).toBeDate(
      2024,
      2,
      1,
      9,
      0,
      0
    );
  });

  test("getTimeForSaturdayAt9am on Friday", () => {
    jest.setSystemTime(new Date(2023, 1, 24, 11, 0, 0)); // Friday
    expect(getTimeForSaturdayAt9am(DEFAULT)).toBeDate(2023, 1, 25, 9, 0, 0);
  });

  test("getTimeForSaturdayAt9am on Sunday", () => {
    jest.setSystemTime(new Date(2023, 1, 19, 11, 0, 0)); // Sunday
    expect(getTimeForSaturdayAt9am(DEFAULT)).toBeDate(2023, 1, 25, 9, 0, 0);
  });

  test("getTimeFor7pmTodayInMs at 18:59:59", () => {
    jest.setSystemTime(new Date(2023, 1, 20, 18, 59, 59));
    expect(getTimeFor7pmTodayInMs(DEFAULT)).toBeDate(2023, 1, 20, 19, 0, 0);
  });
});

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
      const pattern = { frequency: "weekly", hour: 9, minute: 0, weekdays: [1, 5] }; // Mon, Fri
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
});
