const DEFAULT_SETTINGS = {
  laterStartsHour: 3,
  tonightStartsHour: 19,
  tomorrowStartsHour: 9,
  weekendStartsDay: 6,
  weekStartsDay: 1,
  somedayMonths: 3,
};

let CURRENT_SETTINGS = DEFAULT_SETTINGS;

console.log("#chrome", this);

function App() {
  const [route, setRoute] = React.useState("home");

  return (
    <div className="bg-slate-200">
      <div className="w-96 h-96">
        {route === "home" ? (
          <Buttons onSelectDate={() => setRoute("date")} />
        ) : (
          <DatePicker onDateSelected={() => setRoute("home")} />
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

function DatePicker({ onDateSelected }) {
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
    return today.toDateString() === d.toDateString() ? true : false;
  }

  function isBeforeToday(date) {
    const today = new Date();
    const d = new Date(month.getFullYear(), month.getMonth(), date);
    return d < today;
  }

  console.log(getNoOfDays());

  return (
    <div className="bg-white p-4 w-96 h-96">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-lg font-bold text-slate-800">
            {MONTH_NAMES[month.getMonth()]}
          </span>
          <span className="ml-1 text-lg text-slate-600 font-normal">
            {month.getFullYear()}
          </span>
        </div>
        <div>
          <button
            type="button"
            className="focus:outline-none focus:shadow-outline transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-slate-100 p-1 rounded-full"
            onClick={() => {
              setMonth(() => {
                const newMonth = new Date(month);
                newMonth.setMonth(month.getMonth() - 1);
                return newMonth;
              });
            }}
          >
            <svg
              className="h-6 w-6 text-slate-400 inline-flex"
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
            className="focus:outline-none focus:shadow-outline transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-slate-100 p-1 rounded-full"
            onClick={() => {
              setMonth(() => {
                const newMonth = new Date(month);
                newMonth.setMonth(month.getMonth() + 1);
                return newMonth;
              });
            }}
          >
            <svg
              className="h-6 w-6 text-slate-400 inline-flex"
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
              <div className="text-slate-800 font-medium text-center text-xs">
                {day}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap -mx-1">
        {getNoOfDays()[0].map((blankday, index) => {
          return (
            <div
              key={blankday}
              style={{ width: "14.28%" }}
              className="text-center border p-1 border-transparent text-sm"
            ></div>
          );
        })}
        {getNoOfDays()[1].map((date, dateIndex) => {
          console.log(date, isToday(date));
          return (
            <div
              key={date}
              style={{ width: "14.28%" }}
              className={`py-2 rounded-full ${
                isToday(date)
                  ? "bg-slate-100"
                  : !isBeforeToday(date)
                  ? "cursor-pointer text-slate-500 hover:bg-slate-100"
                  : "text-slate-300"
              }`}
              onClick={() => {
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
              }}
            >
              <div className="text-center text-sm leading-none leading-loose">
                {date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Buttons({ onSelectDate }) {
  return (
    <div className="h-full w-full grid gap-px grid-cols-3 grid-rows-3 ">
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

function Button({ text, Icon, time, onSelect }) {
  const [selected, setSelected] = React.useState(false);
  function handleClick() {
    if (time === "pick") {
      onSelect();
      return;
    }

    snoozeSound.play();
    setSelected(true);
    sendTabToNapTime(text, getWhenForTime(time), time === "recurring");
    setTimeout(() => {
      setSelected(false);
    }, 3000);
  }
  return (
    <div
      className={`flex flex-col justify-center items-center ${
        selected
          ? "bg-yellow-200 text-yellow-500"
          : "bg-white text-slate-500 hover:bg-slate-100 cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <div
        className={`h-16 w-16 p-3 flex flex-col justify-center items-center ${
          selected
            ? "-mt-2 transition ease-in-out scale-110 translate-y-2 duration-100"
            : "mt-2 transition ease-in-out hover:scale-110 hover:-translate-y-1 duration-300"
        }`}
      >
        {selected ? <IconCheck /> : <Icon />}
      </div>
      {!selected && <div className="text-sm">{text}</div>}
    </div>
  );
}

function Footer() {
  const [tabs, setTabs] = React.useState([]);
  React.useEffect(() => {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log("tabs", tabs);
        if (key === "tabs") {
          setTabs(newValue);
        }
      }
    });
    chrome.storage.local.get(["tabs"]).then((result) => {
      console.log("tabs", result.tabs);
      if (result != null && result.tabs != null) {
        console.log("setting tabs");
        setTabs(result.tabs);
      }
    });
  }, []);
  return (
    <div className="w-full text-base bg-white mt-px flex items-center text-slate-500">
      <div
        className="py-4 px-4 hover:bg-slate-100 cursor-pointer"
        onClick={() => {
          chrome.tabs.create({
            url: "page.html#list",
          });
        }}
      >
        <span className="px-2 py-1 mr-2 bg-slate-500 text-white text-xs rounded min-w-fit">
          {tabs.length > 0 ? tabs.length : "0"}
        </span>
        Tabs Napping
      </div>
      <div className="flex-1"></div>
      <div
        className="py-4 px-4 hover:bg-slate-100 cursor-pointer"
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

function IconMoon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M320 32L304 0l-16 32-32 16 32 16 16 32 16-32 32-16zm138.7 149.3L432 128l-26.7 53.3L352 208l53.3 26.7L432 288l26.7-53.3L512 208z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M332.2 426.4c8.1-1.6 13.9 8 8.6 14.5a191.18 191.18 0 0 1-149 71.1C85.8 512 0 426 0 320c0-120 108.7-210.6 227-188.8 8.2 1.6 10.1 12.6 2.8 16.7a150.3 150.3 0 0 0-76.1 130.8c0 94 85.4 165.4 178.5 147.7z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMug() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M139.3 67.3a94.83 94.83 0 0 1-26.4-53.5A16.11 16.11 0 0 0 96.8 0H80.4a16.31 16.31 0 0 0-16.3 18 145.36 145.36 0 0 0 40.6 84.4 81.22 81.22 0 0 1 22.4 44.1 16.23 16.23 0 0 0 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18a130.72 130.72 0 0 0-36.6-74.7zM287.9 142a130.72 130.72 0 0 0-36.6-74.7 94.83 94.83 0 0 1-26.4-53.5A16.11 16.11 0 0 0 208.8 0h-16.4c-9.8 0-17.5 8.5-16.3 18a145.36 145.36 0 0 0 40.6 84.4 81.22 81.22 0 0 1 22.4 44.1 16.23 16.23 0 0 0 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M400 192H32a32 32 0 0 0-32 32v192a96 96 0 0 0 96 96h192a96 96 0 0 0 96-96h16a112 112 0 0 0 0-224zm0 160h-16v-96h16a48 48 0 0 1 0 96z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconSun() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M502.42 240.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.41-94.8a17.31 17.31 0 0 0-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4a17.31 17.31 0 0 0 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.41-33.5 47.3 94.7a17.31 17.31 0 0 0 31 0l47.31-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3a17.33 17.33 0 0 0 .2-31.1zm-155.9 106c-49.91 49.9-131.11 49.9-181 0a128.13 128.13 0 0 1 0-181c49.9-49.9 131.1-49.9 181 0a128.13 128.13 0 0 1 0 181z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M352 256a96 96 0 1 1-96-96 96.15 96.15 0 0 1 96 96z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCouch() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
      <path
        d="M96 160H64a96 96 0 0 1 96-96h320a96 96 0 0 1 96 96h-32a64.06 64.06 0 0 0-64 64v64H160v-64a64.06 64.06 0 0 0-64-64z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M640 256a63.84 63.84 0 0 1-32 55.1V432a16 16 0 0 1-16 16h-64a16 16 0 0 1-16-16v-16H128v16a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V311.1A63.79 63.79 0 0 1 64 192h32a32 32 0 0 1 32 32v96h384v-96a32 32 0 0 1 32-32h32a64.06 64.06 0 0 1 64 64z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconBackpack() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path
        d="M320 320H128a32 32 0 0 0-32 32v32h256v-32a32 32 0 0 0-32-32zM136 208h176a8 8 0 0 0 8-8v-16a8 8 0 0 0-8-8H136a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M96 512h256v-96H96zM320 80h-8V56a56.06 56.06 0 0 0-56-56h-64a56.06 56.06 0 0 0-56 56v24h-8A128 128 0 0 0 0 208v240a64 64 0 0 0 64 64V352a64.07 64.07 0 0 1 64-64h192a64.07 64.07 0 0 1 64 64v160a64 64 0 0 0 64-64V208A128 128 0 0 0 320 80zM184 56a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v24h-80zm136 144a8 8 0 0 1-8 8H136a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMailbox() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path
        d="M432 64H144a144 144 0 0 1 144 144v208a32 32 0 0 1-32 32h288a32 32 0 0 0 32-32V208A144 144 0 0 0 432 64zm80 208a16 16 0 0 1-16 16h-32a16 16 0 0 1-16-16v-48h-56a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h104a16 16 0 0 1 16 16z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M143.93 64C64.2 64 0 129.65 0 209.38V416a32 32 0 0 0 32 32h224a32 32 0 0 0 32-32V208A144 144 0 0 0 143.93 64zM224 240a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16zm272-48H392a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h56v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconBeach() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path
        d="M284.91 358.8a144 144 0 0 0-43.71-6.8h-45.07c10-42.85 25-122.77 21-202.33L238.89 128h27.39c11.16 48 28.58 142.41 18.63 230.8z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M241.2 352h-98.4A144 144 0 0 0 .36 474.78C-2.53 494.3 12.39 512 32.12 512h319.76c19.73 0 34.65-17.7 31.76-37.22A144 144 0 0 0 241.2 352zm206.62-238.36C439.69 67.43 393 32 336.53 32c-34.88 0-65.66 13.82-86.3 35.08C235.78 28.29 193.72 0 143.47 0 87 0 40.31 35.43 32.18 81.64a12.37 12.37 0 0 0 10.24 14.2 12.24 12.24 0 0 0 2.18.16H80l16-32 16 32h30.17c-34.21 35-39.62 86.88-14.54 122.58 4.36 6.2 13.14 7.31 18.5 1.95L238.89 128H368l16-32 16 32h35.4a12.38 12.38 0 0 0 12.6-12.18 12.24 12.24 0 0 0-.18-2.18z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
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

function IconSetting() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M487.75 315.6l-42.6-24.6a192.62 192.62 0 0 0 0-70.2l42.6-24.6a12.11 12.11 0 0 0 5.5-14 249.2 249.2 0 0 0-54.7-94.6 12 12 0 0 0-14.8-2.3l-42.6 24.6a188.83 188.83 0 0 0-60.8-35.1V25.7A12 12 0 0 0 311 14a251.43 251.43 0 0 0-109.2 0 12 12 0 0 0-9.4 11.7v49.2a194.59 194.59 0 0 0-60.8 35.1L89.05 85.4a11.88 11.88 0 0 0-14.8 2.3 247.66 247.66 0 0 0-54.7 94.6 12 12 0 0 0 5.5 14l42.6 24.6a192.62 192.62 0 0 0 0 70.2l-42.6 24.6a12.08 12.08 0 0 0-5.5 14 249 249 0 0 0 54.7 94.6 12 12 0 0 0 14.8 2.3l42.6-24.6a188.54 188.54 0 0 0 60.8 35.1v49.2a12 12 0 0 0 9.4 11.7 251.43 251.43 0 0 0 109.2 0 12 12 0 0 0 9.4-11.7v-49.2a194.7 194.7 0 0 0 60.8-35.1l42.6 24.6a11.89 11.89 0 0 0 14.8-2.3 247.52 247.52 0 0 0 54.7-94.6 12.36 12.36 0 0 0-5.6-14.1zm-231.4 36.2a95.9 95.9 0 1 1 95.9-95.9 95.89 95.89 0 0 1-95.9 95.9z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M256.35 319.8a63.9 63.9 0 1 1 63.9-63.9 63.9 63.9 0 0 1-63.9 63.9z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
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
function getWhenForTime(when) {
  switch (when) {
    case "later": {
      return getTimeForThreeHoursFromNowInMs(CURRENT_SETTINGS);
    }
    case "tonight": {
      return getTimeFor7pmTodayInMs(CURRENT_SETTINGS);
    }
    case "tomorrow": {
      return getTimeFor9amTomorrowInMs(CURRENT_SETTINGS);
    }
    case "weekend": {
      return getTimeForSaturdayAt9am(CURRENT_SETTINGS);
    }
    case "week": {
      return getTimeForNextMondayAt9am(CURRENT_SETTINGS);
    }
    case "month": {
      return getTimeForNextMonthAt9am(CURRENT_SETTINGS);
    }
    case "recurring": {
      return getTimeFor9amTomorrowInMs(CURRENT_SETTINGS);
    }
    case "someday":
    default: {
      return getTimeFor9amThreeMonthsFromNow(CURRENT_SETTINGS);
    }
  }
}

function getTimeForThreeHoursFromNowInMs(setting) {
  const now = new Date();
  const threeHoursFromNow = new Date(
    now.getTime() + setting.laterStartsHour * 60 * 60 * 1000
  );
  return threeHoursFromNow.getTime();
  // return now.getTime() + 15 * 60 * 1000;
}

function getTimeFor7pmTodayInMs(setting) {
  const now = new Date();
  const sevenPM = new Date(
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
  // return now.getTime() + 5000;
}

function getTimeFor9amTomorrowInMs(setting) {
  const now = new Date();
  const tomorrow = new Date(
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
  const now = new Date();
  const add = (setting.weekendStartsDay + 7 - now.getDay()) % 7 || 7;
  const saturday = new Date(
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
  const now = new Date();
  const add = setting.weekStartsDay + 7 - (now.getDay() % 7) || 7;
  const monday = new Date(
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
  const now = new Date();
  const threeMonthsFromNow = new Date(
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
  const now = new Date();
  const nextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    9,
    0,
    0
  );
  return nextMonth.getTime();
}

function sendTabToNapTime(label, when, recurring) {
  let queryOptions = { active: true, currentWindow: true };

  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  chrome.tabs.query(queryOptions).then((data) => {
    console.log(data, arguments);
    const [tab] = data;

    const tabInfo = {
      title: tab.title,
      label,
      when,
      url: tab.url,
      favicon: tab.favIconUrl,
    };

    if (recurring) {
      tabInfo.recurring = true;
    }

    chrome.storage.local.get(["tabs"]).then((result) => {
      console.log("Value currently is " + result.tabs);
      if (result.tabs == null) {
        result.tabs = [];
      }
      result.tabs.push(tabInfo);
      const sortedByWhenIncreasing = result.tabs.sort((a, b) => {
        return a.when - b.when;
      });
      console.log("## sorted", sortedByWhenIncreasing);

      chrome.storage.local
        .set({ tabs: sortedByWhenIncreasing })
        .then((value) => {
          console.log("Value is set to " + value);
          saved = true;
          console.log("closing", played, saved, playCallback);
          playCallback = () => {
            console.log("closing tab", tab.id);
            chrome.tabs.remove(tab.id);
            window.close();
          };
          if (played) {
            console.log("already played, calling now");
            playCallback();
          }
        });
      if (sortedByWhenIncreasing.length > 0) {
        chrome.alarms.create("tabnap", {
          when: sortedByWhenIncreasing[0].when,
        });
      }
    });
  });
}

if (typeof jest === "undefined") {
  var snoozeSound = new Audio("/lib/snooze.mp3");
  var playCallback = () => {};
  snoozeSound.onended = () => {
    console.log("ended", played, saved, playCallback);
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
    console.log("tabs", result.settings);
    if (result != null && result.settings != null) {
      console.log("setting tabs");
      CURRENT_SETTINGS = result.settings;
    }
  });

  const domContainer = document.querySelector("#root");
  const root = ReactDOM.createRoot(domContainer);
  root.render(<App />);
} else {
  module.exports = {
    getTimeForThreeHoursFromNowInMs: getTimeForThreeHoursFromNowInMs,
    getTimeFor7pmTodayInMs: getTimeFor7pmTodayInMs,
    getTimeFor9amTomorrowInMs: getTimeFor9amTomorrowInMs,
    getTimeForSaturdayAt9am: getTimeForSaturdayAt9am,
    getTimeForNextMondayAt9am: getTimeForNextMondayAt9am,
    getTimeForNextMonthAt9am,
    getTimeForNextMonthAt9am,
    getTimeFor9amThreeMonthsFromNow: getTimeFor9amThreeMonthsFromNow,
  };
}
