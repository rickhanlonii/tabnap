function makeDuotoneIcon(key) {
  var d = ICON_DATA[key];
  return function () {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={d.viewBox}>
        <path d={d.secondary} className="fa-secondary" fill="currentColor" />
        <path d={d.primary} className="fa-primary" fill="currentColor" />
      </svg>
    );
  };
}

function useChromeStorage(key, defaultValue) {
  const [value, setValue] = React.useState(defaultValue);
  React.useEffect(() => {
    const listener = (changes, namespace) => {
      for (let [k, { oldValue, newValue }] of Object.entries(changes)) {
        if (k === key) {
          setValue(newValue);
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    chrome.storage.local.get([key]).then((result) => {
      if (result != null && result[key] != null) {
        setValue(result[key]);
      }
    });
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);
  return value;
}

function useTheme(settings) {
  React.useEffect(() => {
    var theme = settings && settings.theme != null ? settings.theme : 0;

    function applyTheme() {
      if (theme === 2) {
        document.documentElement.classList.add("dark");
      } else if (theme === 1) {
        document.documentElement.classList.remove("dark");
      } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }

    applyTheme();

    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      if (theme === 0) applyTheme();
    }
    mql.addEventListener("change", handleChange);
    return function () {
      mql.removeEventListener("change", handleChange);
    };
  }, [settings && settings.theme]);

  React.useEffect(() => {
    var idx =
      settings && settings.colorPalette != null ? settings.colorPalette : 0;
    var palette = COLOR_PALETTES[idx] || COLOR_PALETTES[0];
    var root = document.documentElement.style;
    root.setProperty("--accent", palette.base);
    root.setProperty("--accent-hover", palette.hover);
    root.setProperty("--accent-dark", palette.dark);
    root.setProperty("--accent-light", palette.light);
    root.setProperty("--accent-focus", palette.focus);
    root.setProperty("--accent-darkbg", palette.darkBg);
  }, [settings && settings.colorPalette]);
}

var IconMoon = makeDuotoneIcon("moon");

var IconMug = makeDuotoneIcon("mug");

var IconSun = makeDuotoneIcon("sun");

var IconCouch = makeDuotoneIcon("couch");

var IconBackpack = makeDuotoneIcon("backpack");

var IconMailbox = makeDuotoneIcon("mailbox");

var IconBeach = makeDuotoneIcon("beach");

function getWhenForTime(when, settings) {
  var s = settings || DEFAULT_SETTINGS;
  switch (when) {
    case "later": {
      return getTimeForThreeHoursFromNowInMs(s);
    }
    case "tonight": {
      return getTimeFor7pmTodayInMs(s);
    }
    case "tomorrow": {
      return getTimeFor9amTomorrowInMs(s);
    }
    case "weekend": {
      return getTimeForSaturdayAt9am(s);
    }
    case "week": {
      return getTimeForNextMondayAt9am(s);
    }
    case "month": {
      return getTimeForNextMonthAt9am(s);
    }
    case "recurring": {
      return getTimeFor9amTomorrowInMs(s);
    }
    case "someday":
    default: {
      return getTimeFor9amThreeMonthsFromNow(s);
    }
  }
}

function getTimeForThreeHoursFromNowInMs(setting) {
  var now = new Date();
  var threeHoursFromNow = new Date(
    now.getTime() + setting.laterStartsHour * 60 * 60 * 1000
  );
  return threeHoursFromNow.getTime();
}

function getTimeFor7pmTodayInMs(setting) {
  var now = new Date();
  var sevenPM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    setting.tonightStartsHour,
    0,
    0
  );
  if (sevenPM.getTime() <= now.getTime()) {
    sevenPM.setDate(sevenPM.getDate() + 1);
  }
  return sevenPM.getTime();
}

function getTimeFor9amTomorrowInMs(setting) {
  var now = new Date();
  var tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    setting.tomorrowStartsHour,
    0,
    0
  );
  return tomorrow.getTime();
}

function getTimeForSaturdayAt9am(setting) {
  var now = new Date();
  var add = (setting.weekendStartsDay + 7 - now.getDay()) % 7 || 7;
  var saturday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + add,
    9,
    0,
    0
  );
  return saturday.getTime();
}

function getTimeForNextMondayAt9am(setting) {
  var now = new Date();
  var add = (setting.weekStartsDay + 7 - now.getDay()) % 7 || 7;
  var monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + add,
    9,
    0,
    0
  );
  return monday.getTime();
}

function getTimeFor9amThreeMonthsFromNow(setting) {
  var now = new Date();
  var threeMonthsFromNow = new Date(
    now.getFullYear(),
    now.getMonth() + setting.somedayMonths,
    now.getDate(),
    9,
    0,
    0
  );
  return threeMonthsFromNow.getTime();
}

function getTimeForNextMonthAt9am() {
  var now = new Date();
  var nextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    9,
    0,
    0
  );
  return nextMonth.getTime();
}

function getNextRecurrence(pattern) {
  var now = new Date();
  var hour = pattern.hour || 9;
  var minute = pattern.minute || 0;

  switch (pattern.frequency) {
    case "daily": {
      var candidate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0
      );
      if (candidate.getTime() <= now.getTime()) {
        candidate.setDate(candidate.getDate() + 1);
      }
      return candidate.getTime();
    }
    case "weekly": {
      var days = pattern.weekdays || [1]; // default Monday
      var best = null;
      for (var i = 0; i < days.length; i++) {
        var day = days[i];
        var daysUntil = (day - now.getDay() + 7) % 7;
        var candidate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + daysUntil,
          hour,
          minute,
          0
        );
        if (daysUntil === 0 && candidate.getTime() <= now.getTime()) {
          candidate.setDate(candidate.getDate() + 7);
        }
        if (best === null || candidate.getTime() < best.getTime()) {
          best = candidate;
        }
      }
      return best.getTime();
    }
    case "monthly": {
      var dom = pattern.dayOfMonth || 1;
      var lastDay = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
      var clampedDay = Math.min(dom, lastDay);
      var candidate = new Date(
        now.getFullYear(),
        now.getMonth(),
        clampedDay,
        hour,
        minute,
        0
      );
      if (candidate.getTime() <= now.getTime()) {
        var nextLastDay = new Date(
          now.getFullYear(),
          now.getMonth() + 2,
          0
        ).getDate();
        candidate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          Math.min(dom, nextLastDay),
          hour,
          minute,
          0
        );
      }
      return candidate.getTime();
    }
    case "yearly": {
      var m = pattern.month != null ? pattern.month : 0;
      var d = pattern.dayOfYear || 1;
      var candidate = new Date(now.getFullYear(), m, d, hour, minute, 0);
      if (candidate.getTime() <= now.getTime()) {
        candidate = new Date(now.getFullYear() + 1, m, d, hour, minute, 0);
      }
      return candidate.getTime();
    }
    default:
      return Date.now() + 86400000; // fallback: 24h from now
  }
}

if (typeof jest !== "undefined") {
  module.exports = {
    useChromeStorage,
    useTheme,
    getWhenForTime,
    getTimeForThreeHoursFromNowInMs,
    getTimeFor7pmTodayInMs,
    getTimeFor9amTomorrowInMs,
    getTimeForSaturdayAt9am,
    getTimeForNextMondayAt9am,
    getTimeForNextMonthAt9am,
    getTimeFor9amThreeMonthsFromNow,
    getNextRecurrence,
  };
}

var IconSetting = makeDuotoneIcon("setting");
