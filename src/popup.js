let CURRENT_SETTINGS = DEFAULT_SETTINGS;

const DEBUG_BUTTONS = [
  { text: "15 seconds", ms: 15000 },
  { text: "30 seconds", ms: 30000 },
  { text: "1 minute", ms: 60000 },
  { text: "1m 30s", ms: 90000 },
  { text: "2 minutes", ms: 120000 },
  { text: "3 minutes", ms: 180000 },
  { text: "5 minutes", ms: 300000 },
  { text: "10 minutes", ms: 600000 },
  { text: "15 minutes", ms: 900000 },
];

function App() {
  const [route, setRoute] = React.useState("home");
  const settings = useChromeStorage("settings", DEFAULT_SETTINGS);
  useTheme(settings);

  return (
    <div
      className={
        CURRENT_SETTINGS.debugMode
          ? "bg-red-100 dark:bg-red-900"
          : "bg-white dark:bg-chrome-900"
      }
    >
      <div className="w-96 h-96">
        {route === "home" ? (
          <Buttons onSelectDate={() => setRoute("date")} />
        ) : (
          <DatePicker
            onDateSelected={() => setRoute("home")}
            onCancel={() => setRoute("home")}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DatePicker({ onDateSelected, onCancel }) {
  const [month, setMonth] = React.useState(new Date());

  function getNoOfDays() {
    let daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();

    let dayOfWeek = new Date(month.getFullYear(), month.getMonth()).getDay();

    let blankdaysArray = [];
    for (let i = 1; i <= dayOfWeek; i++) {
      blankdaysArray.push(i);
    }
    let daysArray = [];
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    return [blankdaysArray, daysArray];
  }

  function isToday(date) {
    const today = new Date();
    const d = new Date(month.getFullYear(), month.getMonth(), date);
    return today.toDateString() === d.toDateString();
  }

  function isBeforeToday(date) {
    const today = new Date();
    const d = new Date(month.getFullYear(), month.getMonth(), date);
    return d < today;
  }

  const [blankDays, days] = getNoOfDays();

  return (
    <div className="bg-white dark:bg-chrome-900 p-4 w-96 h-96">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <button
            type="button"
            className="focus:outline-none transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-chrome-100 dark:hover:bg-chrome-700 p-1 rounded-full mr-2"
            onClick={onCancel}
          >
            <svg
              className="h-5 w-5 text-chrome-700 dark:text-chrome-200 inline-flex"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-lg font-bold text-chrome-900 dark:text-chrome-50">
            {MONTH_NAMES[month.getMonth()]}
          </span>
          <span className="ml-1 text-lg text-chrome-700 dark:text-chrome-200 font-normal">
            {month.getFullYear()}
          </span>
        </div>
        <div>
          <button
            type="button"
            className="focus:outline-none focus:shadow-outline transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-chrome-100 dark:hover:bg-chrome-700 p-1 rounded-full"
            onClick={() => {
              setMonth(() => {
                const newMonth = new Date(month);
                newMonth.setMonth(month.getMonth() - 1);
                return newMonth;
              });
            }}
          >
            <svg
              className="h-6 w-6 text-chrome-700 dark:text-chrome-200 inline-flex"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            className="focus:outline-none focus:shadow-outline transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-chrome-100 dark:hover:bg-chrome-700 p-1 rounded-full"
            onClick={() => {
              setMonth(() => {
                const newMonth = new Date(month);
                newMonth.setMonth(month.getMonth() + 1);
                return newMonth;
              });
            }}
          >
            <svg
              className="h-6 w-6 text-chrome-700 dark:text-chrome-200 inline-flex"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap mb-3 -mx-1">
        {DAYS.map((day, index) => {
          return (
            <div key={day} style={{ width: "14.26%" }} className="px-0.5">
              <div className="text-chrome-900 dark:text-chrome-50 font-medium text-center text-xs">
                {day}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap -mx-1">
        {blankDays.map((blankday, index) => {
          return (
            <div
              key={blankday}
              style={{ width: "14.28%" }}
              className="text-center border p-1 border-transparent text-sm"
            ></div>
          );
        })}
        {days.map((date, dateIndex) => {
          return (
            <div
              key={date}
              style={{ width: "14.28%" }}
              className={`py-2 rounded-full ${
                isToday(date)
                  ? "ring-1 ring-accent"
                  : !isBeforeToday(date)
                  ? "cursor-pointer text-chrome-700 dark:text-chrome-200 hover:bg-chrome-100 dark:hover:bg-chrome-700"
                  : "text-chrome-400 dark:text-chrome-500"
              }`}
              onClick={() => {
                if (isBeforeToday(date)) return;
                const selectedDate = new Date(
                  month.getFullYear(),
                  month.getMonth(),
                  date,
                  9,
                  0,
                  0
                );
                snoozeSound.play();

                sendTabToNapTime(
                  selectedDate.toLocaleDateString(),
                  selectedDate.getTime()
                );
                onDateSelected();
              }}
            >
              <div className="text-center text-sm leading-loose">{date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Buttons({ onSelectDate }) {
  if (CURRENT_SETTINGS.debugMode) {
    return (
      <div className="h-full w-full grid grid-cols-3 grid-rows-3 grid-borders overflow-hidden">
        {DEBUG_BUTTONS.map((btn) => (
          <Button
            key={btn.text}
            text={btn.text}
            Icon={IconMug}
            time="debug"
            when={() => Date.now() + btn.ms}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="h-full w-full grid grid-cols-3 grid-rows-3 grid-borders overflow-hidden">
      <Button text="Later Today" Icon={IconMug} time="later"></Button>
      <Button text="Tonight" Icon={IconMoon} time="tonight"></Button>
      <Button text="Tomorrow" Icon={IconSun} time="tomorrow"></Button>
      <Button text="Next Weekend" Icon={IconCouch} time="weekend"></Button>
      <Button text="Next Week" Icon={IconBackpack} time="week"></Button>
      <Button text="In a month" Icon={IconMailbox} time="month"></Button>
      <Button text="Someday" Icon={IconBeach} time="someday"></Button>
      <Button text="Repeatedly" Icon={IconRepeat} time="recurring"></Button>
      <Button
        text="Pick a Date"
        Icon={IconCalendar}
        time="pick"
        onSelect={onSelectDate}
      ></Button>
    </div>
  );
}

function Button({ text, Icon, time, onSelect, when }) {
  const [selected, setSelected] = React.useState(false);
  function handleClick() {
    if (time === "pick") {
      onSelect();
      return;
    }

    snoozeSound.play();
    setSelected(true);
    sendTabToNapTime(
      text,
      when ? when() : getWhenForTime(time, CURRENT_SETTINGS),
      time === "recurring"
    );
    setTimeout(() => {
      setSelected(false);
    }, 3000);
  }
  return (
    <div
      className={`group flex flex-col justify-center items-center ${
        selected
          ? "bg-accent-light dark:bg-accent-darkbg text-accent dark:text-accent-dark"
          : "bg-white dark:bg-chrome-900 text-chrome-700 dark:text-chrome-200 hover:bg-chrome-100 dark:hover:bg-chrome-700 cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <div
        className={`h-16 w-16 p-3 flex flex-col justify-center items-center ${
          selected
            ? "-mt-2 transition ease-in-out scale-110 translate-y-2 duration-100"
            : "mt-2 transition ease-in-out group-hover:scale-110 group-hover:-translate-y-1 duration-300"
        }`}
      >
        {selected ? <IconCheck className="animate-check" /> : <Icon />}
      </div>
      {!selected && <div className="text-sm font-medium">{text}</div>}
    </div>
  );
}

function Footer() {
  const tabs = useChromeStorage("tabs", []);
  return (
    <div className="w-full text-base bg-white dark:bg-chrome-900 border-t border-chrome-300 dark:border-chrome-700 flex items-center text-chrome-700 dark:text-chrome-200">
      <div
        className="flex-1 py-4 px-4 hover:bg-chrome-100 dark:hover:bg-chrome-700 cursor-pointer"
        onClick={() => {
          chrome.tabs.create({
            url: "page.html#list",
          });
        }}
      >
        <span className="px-2 py-1 mr-2 bg-accent text-white text-xs rounded min-w-fit">
          {tabs.length}
        </span>
        Tabs Napping
      </div>
      <div
        className="py-4 px-4 hover:bg-chrome-100 dark:hover:bg-chrome-700 cursor-pointer"
        onClick={() => {
          chrome.tabs.create({
            url: "page.html#settings",
          });
        }}
      >
        <div className="h-5 w-5 ">
          <IconSetting />
        </div>
      </div>
    </div>
  );
}

function IconRepeat() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M422.66 422.66a12 12 0 0 1 0 17l-.49.46A247.11 247.11 0 0 1 256 504C119 504 8 393 8 256 8 119.19 119.65 7.76 256.46 8a247.12 247.12 0 0 1 170.85 68.69l-56.62 56.56A166.73 166.73 0 0 0 257.49 88C165.09 87.21 87.21 162 88 257.45 88.76 348 162.18 424 256 424a166.77 166.77 0 0 0 110.63-41.56A12 12 0 0 1 383 383z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M504 57.94V192a24 24 0 0 1-24 24H345.94c-21.38 0-32.09-25.85-17-41L463 41c15.15-15.15 41-4.44 41 16.94z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path
        d="M0 192v272a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V192zm192 176a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-96a16 16 0 0 1 16-16h96a16 16 0 0 1 16 16zm112-240h32a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16zm-192 0h32a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M448 112v80H0v-80a48 48 0 0 1 48-48h48v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V64h128v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V64h48a48 48 0 0 1 48 48z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCheck({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path
        d="M504.5 144.42L264.75 385.5 192 312.59l240.11-241a25.49 25.49 0 0 1 36.06-.14l.14.14L504.5 108a25.86 25.86 0 0 1 0 36.42z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M264.67 385.59l-54.57 54.87a25.5 25.5 0 0 1-36.06.14l-.14-.14L7.5 273.1a25.84 25.84 0 0 1 0-36.41l36.2-36.41a25.49 25.49 0 0 1 36-.17l.16.17z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}
function sendTabToNapTime(label, when, recurring) {
  let queryOptions = { active: true, currentWindow: true };
  let tab;

  chrome.tabs
    .query(queryOptions)
    .then((data) => {
      tab = data[0];
      return chrome.storage.local.get(["tabs"]);
    })
    .then((result) => {
      if (result.tabs == null) {
        result.tabs = [];
      }
      const tabInfo = {
        title: tab.title,
        label,
        when,
        url: tab.url,
        favicon: tab.favIconUrl,
        snoozedAt: Date.now(),
      };
      if (recurring) {
        tabInfo.recurring = true;
      }
      result.tabs.push(tabInfo);
      const sortedByWhenIncreasing = result.tabs.sort((a, b) => {
        return a.when - b.when;
      });
      return chrome.storage.local.set({ tabs: sortedByWhenIncreasing });
    })
    .then(() => {
      saved = true;
      playCallback = () => {
        chrome.tabs.remove(tab.id);
        window.close();
      };
      if (played) {
        playCallback();
      }
      return chrome.storage.local.get(["tabs"]);
    })
    .then((result) => {
      if (result.tabs && result.tabs.length > 0) {
        chrome.alarms.create("tabnap", {
          when: result.tabs[0].when,
        });
      }
    })
    .catch(console.error);
}

if (typeof jest === "undefined") {
  var snoozeSound = new Audio("/lib/snooze.wav");
  var playCallback = () => {};
  snoozeSound.onended = () => {
    played = true;
    if (saved) {
      playCallback();
    }
  };

  var played = false;
  var saved = false;

  chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key === "settings") {
        CURRENT_SETTINGS = newValue;
      }
    }
  });
  chrome.storage.local.get(["settings"]).then((result) => {
    if (result != null && result.settings != null) {
      CURRENT_SETTINGS = result.settings;
    }
  });

  const domContainer = document.querySelector("#root");
  const root = ReactDOM.createRoot(domContainer);
  root.render(<App />);
} else {
  var _shared = require("./shared.js");
  module.exports = {
    getTimeForThreeHoursFromNowInMs: _shared.getTimeForThreeHoursFromNowInMs,
    getTimeFor7pmTodayInMs: _shared.getTimeFor7pmTodayInMs,
    getTimeFor9amTomorrowInMs: _shared.getTimeFor9amTomorrowInMs,
    getTimeForSaturdayAt9am: _shared.getTimeForSaturdayAt9am,
    getTimeForNextMondayAt9am: _shared.getTimeForNextMondayAt9am,
    getTimeForNextMonthAt9am: _shared.getTimeForNextMonthAt9am,
    getTimeFor9amThreeMonthsFromNow: _shared.getTimeFor9amThreeMonthsFromNow,
    getWhenForTime: _shared.getWhenForTime,
    sendTabToNapTime: sendTabToNapTime,
  };
}
