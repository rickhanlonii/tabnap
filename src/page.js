function getRelativeTimeLabel(when) {
  const now = new Date();
  const target = new Date(when);
  const diffMs = when - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (diffMs < 0) {
    return "Overdue";
  }

  const isToday =
    target.getDate() === now.getDate() &&
    target.getMonth() === now.getMonth() &&
    target.getFullYear() === now.getFullYear();

  if (isToday) {
    const h = Math.floor(diffHours);
    const m = Math.round((diffHours - h) * 60);
    if (h === 0) return `in ${m} min`;
    if (m === 0) return `in ${h}h`;
    return `in ${h}h ${m}m`;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    target.getDate() === tomorrow.getDate() &&
    target.getMonth() === tomorrow.getMonth() &&
    target.getFullYear() === tomorrow.getFullYear();

  if (isTomorrow) {
    return "Tomorrow at " + formatTime(target);
  }

  if (diffHours < 7 * 24) {
    const dayName = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][target.getDay()];
    return dayName + " at " + formatTime(target);
  }

  const monthShort = [
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
  ][target.getMonth()];

  if (target.getFullYear() === now.getFullYear()) {
    return monthShort + " " + target.getDate() + " at " + formatTime(target);
  }

  return monthShort + " " + target.getDate() + ", " + target.getFullYear();
}

function groupTabsByTimePeriod(tabs) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const dayOfWeek = now.getDay();
  const daysUntilEndOfWeek = 7 - dayOfWeek;
  const endOfThisWeek = new Date(today);
  endOfThisWeek.setDate(endOfThisWeek.getDate() + daysUntilEndOfWeek);
  const endOfNextWeek = new Date(endOfThisWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

  const groups = [];
  const groupMap = {};

  tabs.forEach((tab) => {
    const when = new Date(tab.when);
    let label;
    if (when < tomorrow) {
      label = "Today";
    } else if (when < dayAfterTomorrow) {
      label = "Tomorrow";
    } else if (when < endOfThisWeek) {
      label = "This Week";
    } else if (when < endOfNextWeek) {
      label = "Next Week";
    } else {
      label = "Later";
    }
    if (!groupMap[label]) {
      groupMap[label] = { label, tabs: [] };
      groups.push(groupMap[label]);
    }
    groupMap[label].tabs.push(tab);
  });

  return groups;
}

function groupHistoryByTimePeriod(history) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dayOfWeek = now.getDay();
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(startOfThisWeek.getDate() - dayOfWeek);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const groups = [];
  const groupMap = {};

  history.forEach((entry) => {
    const wokeAt = new Date(entry.wokeAt);
    let label;
    if (wokeAt >= today) {
      label = "Today";
    } else if (wokeAt >= yesterday) {
      label = "Yesterday";
    } else if (wokeAt >= startOfThisWeek) {
      label = "This Week";
    } else if (wokeAt >= startOfLastWeek) {
      label = "Last Week";
    } else {
      label = "Older";
    }
    if (!groupMap[label]) {
      groupMap[label] = { label, entries: [] };
      groups.push(groupMap[label]);
    }
    groupMap[label].entries.push(entry);
  });

  return groups;
}

const HISTORY_LABEL_MAP = {
  "Later Today": "later today",
  "In a month": "next month",
};

function historyLabel(label) {
  if (!label) return "?";
  return HISTORY_LABEL_MAP[label] || label;
}

function getHistoryTimeLabel(timestamp) {
  if (timestamp == null) return "Unknown";

  const now = new Date();
  const date = new Date(timestamp);
  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) {
    return "Today at " + formatTime(date);
  }
  if (date >= yesterday) {
    return "Yesterday at " + formatTime(date);
  }

  const monthShort = [
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
  ][date.getMonth()];

  if (date.getFullYear() === now.getFullYear()) {
    return monthShort + " " + date.getDate() + " at " + formatTime(date);
  }

  return monthShort + " " + date.getDate() + ", " + date.getFullYear();
}

function describeRecurPattern(pattern) {
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  switch (pattern.frequency) {
    case "daily":
      return "Daily";
    case "weekly":
      var days = (pattern.weekdays || [1]).map(function (d) { return dayNames[d]; });
      return "Every " + days.join(", ");
    case "monthly":
      return "Monthly on the " + ordinal(pattern.dayOfMonth || 1);
    case "yearly":
      var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return "Yearly on " + monthNames[pattern.month || 0] + " " + (pattern.dayOfYear || 1);
    default:
      return "Recurring";
  }
}

function ordinal(n) {
  var s = ["th", "st", "nd", "rd"];
  var v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function Favicon({ tab }) {
  const [error, setError] = React.useState(false);

  if (!tab.favicon || error) {
    let letter = "?";
    try {
      letter = new URL(tab.url).hostname[0].toUpperCase();
    } catch (e) {}
    return (
      <div className="h-6 w-6 rounded bg-chrome-200 dark:bg-chrome-700 text-chrome-600 dark:text-chrome-300 text-xs font-medium flex items-center justify-center flex-shrink-0">
        {letter}
      </div>
    );
  }

  return (
    <img
      src={tab.favicon}
      alt=""
      className="h-6 w-6 flex-shrink-0"
      onError={() => setError(true)}
    />
  );
}

function App() {
  const [route, setRoute] = React.useState(() => {
    const hash = window.location.hash;
    if (hash.includes("#settings")) return "settings";
    if (hash.includes("#history")) return "history";
    return "list";
  });
  const tabs = useChromeStorage("tabs", []);
  const settings = useChromeStorage("settings", DEFAULT_SETTINGS);
  useTheme(settings);
  function onNavigate(route) {
    window.location.hash = `#${route}`;
    setRoute(route);
  }
  return (
    <div className="h-full w-full bg-chrome-50 dark:bg-chrome-900">
      <Header route={route} onNavigate={onNavigate} tabCount={tabs.length} />
      {route === "list" && <List tabs={tabs} />}
      {route === "history" && <History />}
      {route === "settings" && <Settings />}
    </div>
  );
}

function Header({ route, onNavigate, tabCount }) {
  return (
    <div className="fixed h-14 w-full flex bg-white dark:bg-chrome-900 text-chrome-900 dark:text-chrome-50 px-6 border-b border-chrome-300 dark:border-chrome-700 items-center z-10">
      <div className="flex text-xl mr-6 items-center">
        <div className="-mt-1 h-8 w-8 mr-2 text-accent dark:text-accent-dark">
          <IconMoon />
        </div>
        TabNap
      </div>
      <div
        className={`h-full flex text-base items-center px-4 cursor-pointer ${
          route === "list"
            ? "border-b-2 border-accent text-accent dark:border-accent-dark dark:text-accent-dark"
            : "border-b-2 border-transparent text-chrome-700 dark:text-chrome-200 hover:text-chrome-900 dark:hover:text-chrome-50"
        }`}
        onClick={() => {
          onNavigate("list");
        }}
      >
        Home
        {tabCount > 0 && (
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-accent text-white rounded-full">
            {tabCount}
          </span>
        )}
      </div>
      <div
        className={`h-full flex text-base items-center px-4 cursor-pointer ${
          route === "history"
            ? "border-b-2 border-accent text-accent dark:border-accent-dark dark:text-accent-dark"
            : "border-b-2 border-transparent text-chrome-700 dark:text-chrome-200 hover:text-chrome-900 dark:hover:text-chrome-50"
        }`}
        onClick={() => {
          onNavigate("history");
        }}
      >
        History
      </div>
      <div
        className={`h-full flex text-base items-center px-4 cursor-pointer ${
          route === "settings"
            ? "border-b-2 border-accent text-accent dark:border-accent-dark dark:text-accent-dark"
            : "border-b-2 border-transparent text-chrome-700 dark:text-chrome-200 hover:text-chrome-900 dark:hover:text-chrome-50"
        }`}
        onClick={() => {
          onNavigate("settings");
        }}
      >
        Settings
      </div>
    </div>
  );
}

function SnoozeDropdown({ tab, onClose }) {
  const settings = useChromeStorage("settings", DEFAULT_SETTINGS);
  const options = [
    { label: "Later Today", time: "later" },
    { label: "Tonight", time: "tonight" },
    { label: "Tomorrow", time: "tomorrow" },
    { label: "Next Weekend", time: "weekend" },
    { label: "Next Week", time: "week" },
    { label: "Someday", time: "someday" },
  ];

  function handleSelect(option) {
    const when = getWhenForTime(option.time, settings);
    chrome.storage.local.get(["tabs"]).then((result) => {
      const current = result.tabs || [];
      const updated = current.map((t) => {
        if (t.url === tab.url && t.when === tab.when) {
          return { ...t, when: when, label: option.label };
        }
        return t;
      });
      const sorted = updated.sort((a, b) => a.when - b.when);
      chrome.storage.local.set({ tabs: sorted });
    });
    onClose();
  }

  return (
    <div className="absolute right-12 top-0 z-20 bg-white dark:bg-chrome-800 border border-chrome-300 dark:border-chrome-900 rounded-lg shadow-lg py-1 w-40">
      {options.map((option) => (
        <div
          key={option.time}
          className="px-3 py-1.5 text-sm text-chrome-700 dark:text-chrome-200 hover:bg-chrome-100 dark:hover:bg-chrome-700 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(option);
          }}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}

function IconSnooze() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M332.2 426.4c8.1-1.6 13.9 8 8.6 14.5a191.18 191.18 0 0 1-149 71.1C85.8 512 0 426 0 320c0-120 108.7-210.6 227-188.8 8.2 1.6 10.1 12.6 2.8 16.7a150.3 150.3 0 0 0-76.1 130.8c0 94 85.4 165.4 178.5 147.7z"
        className="fa-primary"
        fill="currentColor"
      />
      <path
        d="M320 32L304 0l-16 32-32 16 32 16 16 32 16-32 32-16zm138.7 149.3L432 128l-26.7 53.3L352 208l53.3 26.7L432 288l26.7-53.3L512 208z"
        className="fa-secondary"
        fill="currentColor"
      />
    </svg>
  );
}

function List({ tabs }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [deletedTab, setDeletedTab] = React.useState(null);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [snoozeDropdownTab, setSnoozeDropdownTab] = React.useState(null);
  const toastTimerRef = React.useRef(null);

  function deleteTab(tab) {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    chrome.storage.local.get(["tabs"]).then((result) => {
      const current = result.tabs || [];
      const newTabs = current.filter(
        (t) => t.url !== tab.url || t.when !== tab.when
      );
      chrome.storage.local.set({ tabs: newTabs });
    });
    setDeletedTab(tab);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
      setDeletedTab(null);
    }, 5000);
  }

  function undoDelete() {
    if (!deletedTab) return;
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    chrome.storage.local.get(["tabs"]).then((result) => {
      const current = result.tabs || [];
      current.push(deletedTab);
      const sorted = current.sort((a, b) => a.when - b.when);
      chrome.storage.local.set({ tabs: sorted });
    });
    setToastVisible(false);
    setDeletedTab(null);
  }

  const filteredTabs =
    searchQuery.length > 0
      ? tabs.filter((tab) => {
          const q = searchQuery.toLowerCase();
          return (
            (tab.title && tab.title.toLowerCase().includes(q)) ||
            (tab.url && tab.url.toLowerCase().includes(q))
          );
        })
      : tabs;

  const groups = groupTabsByTimePeriod(filteredTabs);

  return (
    <div className="pt-16 w-full h-full flex justify-center text-base text-chrome-900 dark:text-chrome-50 py-10">
      <div className="w-full px-6">
        <h1 className="text-lg font-semibold text-chrome-900 dark:text-chrome-50 mb-4">
          Snoozed Tabs
        </h1>
        {tabs.length === 0 && (
          <div className="flex flex-col items-center text-center py-16">
            <div className="h-12 w-12 text-chrome-300 dark:text-chrome-600 mb-4">
              <IconMoon />
            </div>
            <div className="text-lg font-medium text-chrome-700 dark:text-chrome-200">
              No tabs napping
            </div>
            <div className="text-sm text-chrome-500 dark:text-chrome-400 mt-1">
              Snooze a tab from the popup to see it here
            </div>
          </div>
        )}
        {tabs.length > 0 && (
          <input
            type="text"
            className="w-full px-4 py-2 border border-chrome-300 dark:border-chrome-900 rounded-md text-sm bg-white dark:bg-chrome-800 text-chrome-900 dark:text-chrome-50 placeholder-chrome-400 dark:placeholder-chrome-500 focus:ring-2 focus:ring-accent focus:border-transparent outline-none mb-4"
            placeholder="Search snoozed tabs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        {tabs.length > 0 && filteredTabs.length === 0 && (
          <div className="flex flex-col items-center text-center py-16">
            <div className="text-lg font-medium text-chrome-700 dark:text-chrome-200">
              No matching tabs
            </div>
          </div>
        )}
        {groups.map((group) => (
          <div key={group.label}>
            <div className="text-xs font-semibold text-chrome-500 dark:text-chrome-400 uppercase tracking-wider py-2 mt-6 first:mt-0">
              {group.label} &middot; {group.tabs.length}{" "}
              {group.tabs.length === 1 ? "tab" : "tabs"}
            </div>
            {group.tabs.map((tab) => (
              <div
                key={`${tab.url}-${tab.when}`}
                className="group relative flex items-center border-b border-chrome-300 dark:border-chrome-700 cursor-pointer hover:bg-chrome-100 dark:hover:bg-chrome-700 rounded"
                onClick={() => {
                  chrome.tabs.create({ url: tab.url });
                }}
              >
                <div className="flex p-4 items-center flex-1 min-w-0">
                  <div className="mr-4">
                    <Favicon tab={tab} />
                  </div>
                  <div className="flex-1 min-w-0 mr-2 flex flex-col">
                    <div className="font-medium text-chrome-900 dark:text-chrome-50 truncate">
                      {tab.title || tab.url}
                    </div>
                    <div className="flex">
                      <div className="text-sm text-chrome-500 dark:text-chrome-400 mr-4">
                        {tab.label}
                      </div>
                      <div className="text-sm text-chrome-500 dark:text-chrome-400">
                        {getRelativeTimeLabel(tab.when)}
                      </div>
                      {tab.recurring && (
                        <div className="ml-2 text-xs px-1.5 py-0.5 rounded bg-accent-light dark:bg-accent-darkbg text-accent dark:text-accent-dark">
                          {tab.recurPattern ? describeRecurPattern(tab.recurPattern) : "Daily"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className="relative p-2 rounded hover:bg-chrome-200 dark:hover:bg-chrome-600 cursor-pointer text-chrome-500 dark:text-chrome-400 hover:text-chrome-700 dark:hover:text-chrome-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSnoozeDropdownTab(
                        snoozeDropdownTab &&
                          snoozeDropdownTab.url === tab.url &&
                          snoozeDropdownTab.when === tab.when
                          ? null
                          : tab
                      );
                    }}
                  >
                    <div className="h-4 w-4">
                      <IconSnooze />
                    </div>
                    {snoozeDropdownTab &&
                      snoozeDropdownTab.url === tab.url &&
                      snoozeDropdownTab.when === tab.when && (
                        <SnoozeDropdown
                          tab={tab}
                          onClose={() => setSnoozeDropdownTab(null)}
                        />
                      )}
                  </div>
                  <div
                    className="p-2 rounded hover:bg-chrome-200 dark:hover:bg-chrome-600 cursor-pointer text-chrome-500 dark:text-chrome-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTab(tab);
                    }}
                  >
                    <div className="h-4 w-4">
                      <IconTrash />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {toastVisible && (
        <Toast onUndo={undoDelete} onDismiss={() => setToastVisible(false)} />
      )}
    </div>
  );
}

function Toast({ onUndo, onDismiss }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-chrome-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up">
      <span className="text-sm">Tab deleted</span>
      <button
        className="text-sm font-medium text-accent-dark hover:text-white cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onUndo();
        }}
      >
        Undo
      </button>
    </div>
  );
}

function Dropdown({ children, value, onChange }) {
  return (
    <select
      className="ml-6 py-1 px-2 rounded-md bg-white dark:bg-chrome-800 border border-chrome-300 dark:border-chrome-900 cursor-pointer outline-none text-chrome-900 dark:text-chrome-50"
      onChange={onChange}
      value={value}
    >
      {children}
    </select>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      className={`ml-6 w-10 h-5 rounded-full cursor-pointer transition-colors flex items-center px-0.5 ${
        checked ? "bg-accent" : "bg-chrome-300 dark:bg-chrome-600"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div
        className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );
}

function Setting({
  icon,
  text,
  description,
  value,
  onChange,
  toggle,
  children,
}) {
  return (
    <div className="flex items-center border-b border-chrome-300 dark:border-chrome-700 py-4">
      <div className="h-6 w-6 mr-6 -mt-1">{icon}</div>
      <div className="flex-1">
        <div className="text-base text-chrome-900 dark:text-chrome-50">
          {text}
        </div>
        {description && (
          <div className="text-xs text-chrome-500 dark:text-chrome-400 mt-0.5">
            {description}
          </div>
        )}
      </div>
      <div className="w-16"></div>
      {toggle ? (
        <Toggle checked={!!value} onChange={onChange} />
      ) : (
        <Dropdown value={value} onChange={onChange}>
          {children}
        </Dropdown>
      )}
    </div>
  );
}

function updateSettings(settings) {
  chrome.storage.local.set({ settings });
}

function ColorPalettePicker({ settings }) {
  var current =
    settings.colorPalette != null ? settings.colorPalette : 0;
  return (
    <div className="flex items-center border-b border-chrome-300 dark:border-chrome-700 py-4">
      <div className="h-6 w-6 mr-6 -mt-1">
        <IconPalette />
      </div>
      <div className="flex-1">
        <div className="text-base text-chrome-900 dark:text-chrome-50">
          Accent color
        </div>
        <div className="text-xs text-chrome-500 dark:text-chrome-400 mt-0.5">
          Sets the primary color across the extension
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {COLOR_PALETTES.map((palette, index) => (
            <div
              key={palette.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer border transition-colors ${
                current === index
                  ? "border-accent bg-accent-light dark:bg-accent-darkbg"
                  : "border-chrome-300 dark:border-chrome-700 hover:border-chrome-400 dark:hover:border-chrome-500"
              }`}
              onClick={() => {
                updateSettings({
                  ...settings,
                  colorPalette: index,
                });
              }}
            >
              <div
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: palette.base }}
              />
              <span className="text-sm text-chrome-900 dark:text-chrome-50">
                {palette.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IconPalette() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M256 0C114.6 0 0 100.3 0 224c0 70.1 36.9 132.6 94.5 173.7 9.6 6.9 15.2 18.1 13.5 29.9l-9.4 66.2c-3.4 23.8 17.7 44.2 41.5 40.1l72.4-12.4c6.3-1.1 12.8-.4 18.7 2 20.1 7.9 41.8 12.4 64.8 12.4 141.4 0 256-100.3 256-224S397.4 0 256 0z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M144 256a32 32 0 1 1-64 0 32 32 0 0 1 64 0zm80-96a32 32 0 1 1-64 0 32 32 0 0 1 64 0zm112 0a32 32 0 1 1-64 0 32 32 0 0 1 64 0zm80 96a32 32 0 1 1-64 0 32 32 0 0 1 64 0z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function Settings() {
  const settings = useChromeStorage("settings", DEFAULT_SETTINGS);
  return (
    <div className="pt-16 w-full h-full flex flex-col items-center text-base text-chrome-900 dark:text-chrome-50 py-10">
      <div className="w-full px-6 flex flex-col">
        <h1 className="text-sm font-semibold text-chrome-900 dark:text-chrome-50 uppercase tracking-wider mt-8 mb-3">
          Appearance
        </h1>
        <Setting
          value={settings.theme != null ? settings.theme : 0}
          icon={<IconSun />}
          text="Theme"
          description="Choose light, dark, or match your system"
          onChange={(e) => {
            updateSettings({
              ...settings,
              theme: parseInt(e.target.value),
            });
          }}
        >
          <option value="0">System default</option>
          <option value="1">Light</option>
          <option value="2">Dark</option>
        </Setting>
        <ColorPalettePicker settings={settings} />
        <h1 className="text-sm font-semibold text-chrome-900 dark:text-chrome-50 uppercase tracking-wider mt-8 mb-3">
          Snooze Settings
        </h1>
        <Setting
          value={settings.laterStartsHour}
          icon={<IconMug />}
          text="Later Today starts"
          description="How far from now 'Later Today' wakes the tab"
          onChange={(e) => {
            updateSettings({
              ...settings,
              laterStartsHour: parseInt(e.target.value),
            });
          }}
        >
          <option value="1">in 1 hour</option>
          <option value="2">in 2 hours</option>
          <option value="3">in 3 hours</option>
          <option value="4">in 4 hours</option>
          <option value="5">in 5 hours</option>
        </Setting>
        <Setting
          value={settings.tonightStartsHour}
          icon={<IconMoon />}
          text="Tonight starts at"
          onChange={(e) => {
            updateSettings({
              ...settings,
              tonightStartsHour: parseInt(e.target.value),
            });
          }}
        >
          <option value="15">3:00 PM</option>
          <option value="16">4:00 PM</option>
          <option value="17">5:00 PM</option>
          <option value="18">6:00 PM</option>
          <option value="19">7:00 PM</option>
          <option value="20">8:00 PM</option>
          <option value="21">9:00 PM</option>
          <option value="22">10:00 PM</option>
          <option value="23">11:00 PM</option>
        </Setting>
        <Setting
          value={settings.tomorrowStartsHour}
          icon={<IconSun />}
          text="Tomorrow starts at"
          onChange={(e) => {
            updateSettings({
              ...settings,
              tomorrowStartsHour: parseInt(e.target.value),
            });
          }}
        >
          <option value="4">4:00 AM</option>
          <option value="5">5:00 AM</option>
          <option value="6">6:00 AM</option>
          <option value="7">7:00 AM</option>
          <option value="8">8:00 AM</option>
          <option value="9">9:00 AM</option>
          <option value="10">10:00 AM</option>
          <option value="11">11:00 AM</option>
        </Setting>
        <Setting
          value={settings.weekendStartsDay}
          icon={<IconCouch />}
          text="Weekend starts on"
          description="Day used for the 'Next Weekend' option"
          onChange={(e) => {
            updateSettings({
              ...settings,
              weekendStartsDay: parseInt(e.target.value),
            });
          }}
        >
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
        </Setting>
        <Setting
          value={settings.weekStartsDay}
          icon={<IconBackpack />}
          text="Week starts on"
          onChange={(e) => {
            updateSettings({
              ...settings,
              weekStartsDay: parseInt(e.target.value),
            });
          }}
        >
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
        </Setting>
        <Setting
          value={settings.somedayMonths}
          icon={<IconBeach />}
          text="Someday is in"
          onChange={(e) => {
            updateSettings({
              ...settings,
              somedayMonths: parseInt(e.target.value),
            });
          }}
        >
          <option value="2">2 months</option>
          <option value="3">3 months</option>
          <option value="4">4 months</option>
          <option value="5">5 months</option>
          <option value="6">6 months</option>
        </Setting>
        <h1 className="text-sm font-semibold text-chrome-900 dark:text-chrome-50 uppercase tracking-wider mt-8 mb-3">
          Wake-Up Settings
        </h1>
        <Setting
          value={settings.showNotifications}
          icon={<IconBell />}
          text="Show notifications"
          toggle={true}
          onChange={(checked) => {
            updateSettings({
              ...settings,
              showNotifications: checked ? 1 : 0,
            });
          }}
        />
        <Setting
          value={settings.playWakeupSound}
          icon={<IconVolume />}
          text="Play wake-up sound"
          toggle={true}
          onChange={(checked) => {
            updateSettings({
              ...settings,
              playWakeupSound: checked ? 1 : 0,
            });
          }}
        />
        <h1 className="text-sm font-semibold text-chrome-900 dark:text-chrome-50 uppercase tracking-wider mt-8 mb-3">
          Developer Settings
        </h1>
        <Setting
          value={settings.debugMode}
          icon={<IconSetting />}
          text="Debug mode"
          description="Uses short snooze times for testing"
          toggle={true}
          onChange={(checked) => {
            updateSettings({ ...settings, debugMode: checked ? 1 : 0 });
          }}
        />
      </div>
    </div>
  );
}
function IconHistory() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M256 64C150 64 64 150 64 256s86 192 192 192 192-86 192-192S362 64 256 64zm112 216H248a16 16 0 0 1-16-16V128a16 16 0 0 1 32 0v120h104a16 16 0 0 1 0 32z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M256 0C123.45 0 13.47 105.09 4.57 236.34A16 16 0 0 0 20.54 254H44a16.11 16.11 0 0 0 15.9-14.43C68.65 131.83 153.2 52 256 52c113.22 0 204 91.78 204 204 0 113.22-90.78 204-204 204-46.78 0-91.68-16-127.48-44.69l34.84-34.84C176.34 368.16 165.1 344 148.69 344H24a24 24 0 0 0-24 24v124.69c0 16.41 24.16 27.65 36.47 15.34l33.4-33.4C116 516.47 184.09 540 256 540c152.93 0 276-123.07 276-276S408.93-4 256 0z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function History() {
  const history = useChromeStorage("history", []);
  const [searchQuery, setSearchQuery] = React.useState("");

  function clearHistory() {
    if (window.confirm("Clear all history?")) {
      chrome.storage.local.set({ history: [] });
    }
  }

  const filteredHistory =
    searchQuery.length > 0
      ? history.filter((entry) => {
          const q = searchQuery.toLowerCase();
          return (
            (entry.title && entry.title.toLowerCase().includes(q)) ||
            (entry.url && entry.url.toLowerCase().includes(q))
          );
        })
      : history;

  const groups = groupHistoryByTimePeriod(filteredHistory);

  return (
    <div className="pt-16 w-full h-full flex justify-center text-base text-chrome-900 dark:text-chrome-50 py-10">
      <div className="w-full px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-chrome-900 dark:text-chrome-50">
            History
          </h1>
          {history.length > 0 && (
            <button
              className="text-sm text-chrome-500 dark:text-chrome-400 hover:text-red-500 cursor-pointer"
              onClick={clearHistory}
            >
              Clear history
            </button>
          )}
        </div>
        {history.length === 0 && (
          <div className="flex flex-col items-center text-center py-16">
            <div className="h-12 w-12 text-chrome-300 dark:text-chrome-600 mb-4">
              <IconHistory />
            </div>
            <div className="text-lg font-medium text-chrome-700 dark:text-chrome-200">
              No history yet
            </div>
            <div className="text-sm text-chrome-500 dark:text-chrome-400 mt-1">
              Woken tabs will appear here
            </div>
          </div>
        )}
        {history.length > 0 && (
          <input
            type="text"
            className="w-full px-4 py-2 border border-chrome-300 dark:border-chrome-900 rounded-md text-sm bg-white dark:bg-chrome-800 text-chrome-900 dark:text-chrome-50 placeholder-chrome-400 dark:placeholder-chrome-500 focus:ring-2 focus:ring-accent focus:border-transparent outline-none mb-4"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        {history.length > 0 && filteredHistory.length === 0 && (
          <div className="flex flex-col items-center text-center py-16">
            <div className="text-lg font-medium text-chrome-700 dark:text-chrome-200">
              No matching history
            </div>
          </div>
        )}
        {groups.map((group) => (
          <div key={group.label}>
            <div className="text-xs font-semibold text-chrome-500 dark:text-chrome-400 uppercase tracking-wider py-2 mt-6 first:mt-0">
              {group.label} &middot; {group.entries.length}{" "}
              {group.entries.length === 1 ? "tab" : "tabs"}
            </div>
            {group.entries.map((entry, index) => (
              <div
                key={`${entry.url}-${entry.wokeAt}-${index}`}
                className="flex items-center border-b border-chrome-300 dark:border-chrome-700 cursor-pointer hover:bg-chrome-100 dark:hover:bg-chrome-700 rounded"
                onClick={() => {
                  chrome.tabs.create({ url: entry.url });
                }}
              >
                <div className="flex p-4 items-center flex-1 min-w-0">
                  <div className="mr-4">
                    <Favicon tab={entry} />
                  </div>
                  <div className="flex-1 min-w-0 mr-2 flex flex-col">
                    <div className="font-medium text-chrome-900 dark:text-chrome-50 truncate">
                      {entry.title || entry.url}
                    </div>
                    <div className="flex flex-wrap gap-x-4 text-sm text-chrome-500 dark:text-chrome-400">
                      <div>
                        Snoozed until {historyLabel(entry.label)}{" "}
                        {getHistoryTimeLabel(entry.snoozedAt).toLowerCase()}
                      </div>
                      <div>Alarm: {getHistoryTimeLabel(entry.wokeAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function IconBed() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M512,288v64H0V288a64,64,0,0,1,64-64H448A64,64,0,0,1,512,288Z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M0,352V464a16,16,0,0,0,16,16H48a16,16,0,0,0,16-16V416H448v48a16,16,0,0,0,16,16h32a16,16,0,0,0,16-16V352ZM64,224V160a32,32,0,0,1,32-32H208a32,32,0,0,1,32,32v64h32V160a32,32,0,0,1,32-32H416a32,32,0,0,1,32,32v64a66.4,66.4,0,0,1,32,8.88h0V64a32,32,0,0,0-32-32H64A32,32,0,0,0,32,64V232.88h0A66.51,66.51,0,0,1,64,224Z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path
        d="M53.2 467L32 96h384l-21.2 371a48 48 0 0 1-47.9 45H101.1a48 48 0 0 1-47.9-45z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M0 80V48a16 16 0 0 1 16-16h120l9.4-18.7A23.72 23.72 0 0 1 166.8 0h114.3a24 24 0 0 1 21.5 13.3L312 32h120a16 16 0 0 1 16 16v32a16 16 0 0 1-16 16H16A16 16 0 0 1 0 80z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

function IconBell() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path
        d="M224 480c-17.66 0-32-14.38-32-32.03h64C256 465.62 241.66 480 224 480zm-80-62.97h160c8.836 0 16-7.164 16-16 0-8.838-7.164-16-16-16H144c-8.836 0-16 7.162-16 16 0 8.836 7.164 16 16 16z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M224 0C135.6 0 64 71.63 64 160v29.95c0 42.02-16 82.65-44.63 113.4C7.33 316.5 0 334.5 0 353.1 0 381.6 23.18 401 51.54 401h344.9C424.8 401 448 381.6 448 353.1c0-18.5-7.33-36.5-19.37-49.75C400 272.6 384 231.97 384 189.95V160C384 71.63 312.4 0 224 0z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}
function IconVolume() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path
        d="M333.09 47.24L204.07 160H48c-26.51 0-48 21.49-48 48v96c0 26.51 21.49 48 48 48h156.07l129.02 112.76c29.42 25.69 75.81 5.56 75.81-33.76V81c0-39.35-46.44-59.42-75.81-33.76z"
        className="fa-secondary"
        fill="currentColor"
      />
      <path
        d="M480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46-7.14 11.28-3.78 26.22 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.55 22.08-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.54 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z"
        className="fa-primary"
        fill="currentColor"
      />
    </svg>
  );
}

if (typeof jest === "undefined") {
  const domContainer = document.querySelector("#root");
  const root = ReactDOM.createRoot(domContainer);
  root.render(<App />);
} else {
  module.exports = {
    groupHistoryByTimePeriod,
    getHistoryTimeLabel,
  };
}
