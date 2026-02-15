"use client";

import { useState, useEffect, useRef } from "react";

// ── Fake tab pool ──────────────────────────────────────────────────────────
const TAB_POOL = [
  {
    title: "GitHub: Pull Request Review",
    url: "https://github.com/pulls",
    initial: "G",
    color: "bg-gray-800",
    skeleton: "github",
  },
  {
    title: "Flights to Tokyo - Google",
    url: "https://google.com/flights",
    initial: "G",
    color: "bg-blue-500",
    skeleton: "search",
  },
  {
    title: "React Documentation",
    url: "https://react.dev",
    initial: "R",
    color: "bg-sky-500",
    skeleton: "docs",
  },
  {
    title: "How to make sourdough - YouTube",
    url: "https://youtube.com/watch",
    initial: "Y",
    color: "bg-red-500",
    skeleton: "video",
  },
  {
    title: "Hacker News",
    url: "https://news.ycombinator.com",
    initial: "H",
    color: "bg-orange-500",
    skeleton: "feed",
  },
  {
    title: "Figma - Dashboard Design",
    url: "https://figma.com/file/dash",
    initial: "F",
    color: "bg-purple-500",
    skeleton: "canvas",
  },
  {
    title: "Amazon - Headphones",
    url: "https://amazon.com/dp/headphones",
    initial: "A",
    color: "bg-amber-600",
    skeleton: "product",
  },
  {
    title: "Wikipedia - Space Exploration",
    url: "https://en.wikipedia.org/wiki/Space",
    initial: "W",
    color: "bg-zinc-600",
    skeleton: "article",
  },
  {
    title: "Slack - Team Chat",
    url: "https://app.slack.com/client",
    initial: "S",
    color: "bg-emerald-600",
    skeleton: "feed",
  },
  {
    title: "Netflix - Continue Watching",
    url: "https://netflix.com/browse",
    initial: "N",
    color: "bg-red-700",
    skeleton: "video",
  },
  {
    title: "Notion - Project Board",
    url: "https://notion.so/project",
    initial: "N",
    color: "bg-stone-800",
    skeleton: "docs",
  },
  {
    title: "Twitter / X",
    url: "https://x.com/home",
    initial: "X",
    color: "bg-black",
    skeleton: "feed",
  },
  {
    title: "Spotify - Discover Weekly",
    url: "https://open.spotify.com/playlist",
    initial: "S",
    color: "bg-green-600",
    skeleton: "product",
  },
  {
    title: "Stack Overflow - useEffect",
    url: "https://stackoverflow.com/questions",
    initial: "S",
    color: "bg-orange-600",
    skeleton: "article",
  },
  {
    title: "Google Docs - Meeting Notes",
    url: "https://docs.google.com/document",
    initial: "G",
    color: "bg-blue-600",
    skeleton: "docs",
  },
  {
    title: "Vercel - Deployments",
    url: "https://vercel.com/dashboard",
    initial: "V",
    color: "bg-zinc-900",
    skeleton: "github",
  },
];

// ── Snooze button definitions ──────────────────────────────────────────────
const SNOOZE_BUTTONS = [
  { label: "Later Today", icon: IconMug, hours: 3 },
  { label: "Tonight", icon: IconMoon, hours: 7 },
  { label: "Tomorrow", icon: IconSun, hours: 24 },
  { label: "Next Weekend", icon: IconCouch, hours: 120 },
  { label: "Next Week", icon: IconBackpack, hours: 168 },
  { label: "In a Month", icon: IconMailbox, hours: 720 },
  { label: "Someday", icon: IconBeach, hours: 2160 },
  { label: "Repeatedly", icon: IconRepeat, hours: 0, action: "recurring" as const },
  { label: "Pick a Date", icon: IconCalendar, hours: 0, action: "datepicker" as const },
];

// ── Time helpers ───────────────────────────────────────────────────────────
function getGroupLabel(when: number): string {
  const now = Date.now();
  const diffH = (when - now) / (1000 * 60 * 60);
  if (diffH < 24) return "Today";
  if (diffH < 48) return "Tomorrow";
  if (diffH < 168) return "This Week";
  if (diffH < 336) return "Next Week";
  return "Later";
}

function getRelativeLabel(when: number): string {
  const now = Date.now();
  const diffH = (when - now) / (1000 * 60 * 60);
  if (diffH < 1) return `in ${Math.round(diffH * 60)} min`;
  if (diffH < 24) return `in ${Math.round(diffH)}h`;
  if (diffH < 48) return "tomorrow at 9:00 AM";
  if (diffH < 168) {
    const d = new Date(when);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return `${days[d.getDay()]} at 9:00 AM`;
  }
  if (diffH < 720) {
    const d = new Date(when);
    const months = [
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
    return `${months[d.getMonth()]} ${d.getDate()} at 9:00 AM`;
  }
  const d = new Date(when);
  const months = [
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
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

type SnoozedTab = {
  title: string;
  url: string;
  initial: string;
  color: string;
  label: string;
  when: number;
  id: number;
};

function groupTabs(
  tabs: SnoozedTab[]
): { label: string; tabs: SnoozedTab[] }[] {
  const groupOrder = ["Today", "Tomorrow", "This Week", "Next Week", "Later"];
  const map: Record<string, SnoozedTab[]> = {};
  for (const tab of tabs) {
    const g = getGroupLabel(tab.when);
    if (!map[g]) map[g] = [];
    map[g].push(tab);
  }
  return groupOrder
    .filter((g) => map[g])
    .map((g) => ({ label: g, tabs: map[g] }));
}

// ── Pre-populated sample tabs ──────────────────────────────────────────────
function getInitialTabs(): SnoozedTab[] {
  const now = Date.now();
  return [
    {
      ...TAB_POOL[0],
      label: "Later Today",
      when: now + 3 * 60 * 60 * 1000,
      id: -1,
    },
    {
      ...TAB_POOL[1],
      label: "Tomorrow",
      when: now + 24 * 60 * 60 * 1000,
      id: -2,
    },
    {
      ...TAB_POOL[2],
      label: "Next Week",
      when: now + 168 * 60 * 60 * 1000,
      id: -3,
    },
    {
      ...TAB_POOL[3],
      label: "Next Week",
      when: now + 192 * 60 * 60 * 1000,
      id: -4,
    },
  ];
}

// ── Main component ─────────────────────────────────────────────────────────
export function InteractiveDemo() {
  const [snoozedTabs, setSnoozedTabs] = useState<SnoozedTab[]>(() =>
    getInitialTabs()
  );
  const [openTabs, setOpenTabs] = useState(() =>
    TAB_POOL.map((tab, i) => ({ ...tab, slotId: i }))
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextId, setNextId] = useState(1);
  const [newTabId, setNewTabId] = useState<number | null>(null);
  const refillIndex = useRef(0);
  const nextSlotId = useRef(TAB_POOL.length);

  function addToSnoozedList(label: string, hours: number) {
    const tab = openTabs[activeIndex];
    if (!tab) return;
    const when = Date.now() + hours * 60 * 60 * 1000;
    const id = nextId;
    setSnoozedTabs((prev) =>
      [...prev, { ...tab, label, when, id }].sort((a, b) => a.when - b.when)
    );
    setNextId((n) => n + 1);
    setNewTabId(id);
  }

  const wasLastTab = useRef(false);

  function beginTabSwap() {
    wasLastTab.current = activeIndex >= openTabs.length - 1;
    const id = nextSlotId.current++;
    setOpenTabs((prev) => {
      const current = prev[activeIndex];
      let replacement = TAB_POOL[refillIndex.current % TAB_POOL.length];
      if (replacement.url === current.url) {
        refillIndex.current += 1;
        replacement = TAB_POOL[refillIndex.current % TAB_POOL.length];
      }
      refillIndex.current += 1;
      return [...prev, { ...replacement, slotId: id }];
    });
  }

  function completeTabSwap() {
    setOpenTabs((prev) => {
      const next = [...prev];
      next.splice(activeIndex, 1);
      return next;
    });
    if (wasLastTab.current) {
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }
  }

  return (
    <section className="bg-chrome-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-chrome-900 sm:text-4xl">
          See it in action
        </h2>
        <p className="mt-4 text-center text-lg text-chrome-600 max-w-2xl mx-auto">
          Click a snooze button and watch the tab appear in your list.
        </p>
        <div className="mt-12 flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:h-[520px]">
          <PopupDemo
            onSnooze={addToSnoozedList}
            onBeginSwap={beginTabSwap}
            onCompleteSwap={completeTabSwap}
            openTabs={openTabs}
            activeIndex={activeIndex}
            onSelectTab={setActiveIndex}
          />
          <ListDemo tabs={snoozedTabs} newTabId={newTabId} />
        </div>
      </div>
    </section>
  );
}

// ── Browser frame wrapper (for the list demo) ─────────────────────────────
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl shadow-lg overflow-hidden border border-chrome-200 bg-white flex flex-col flex-1">
      <TabTitleBar />
      {children}
    </div>
  );
}

function TabTitleBar() {
  return (
    <div className="border-b border-chrome-200">
      {/* Tab strip — darker background */}
      <div className="flex items-center gap-2 px-4 pt-2.5 bg-chrome-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center ml-2">
          <div className="flex items-center gap-1.5 bg-chrome-100 rounded-t-lg px-3 py-1.5 -mb-px text-sm">
            <div className="w-3.5 h-3.5 text-violet-500">
              <TabNapIcon />
            </div>
            <span className="text-chrome-700">TabNap</span>
          </div>
        </div>
      </div>
      {/* Toolbar — same color as active tab */}
      <div className="bg-chrome-100 px-4 pb-2.5 pt-2 flex items-center gap-2">
        <NavButtons />
        <div className="flex-1 flex items-center bg-white rounded-full px-3 py-1 border border-chrome-200">
          <LockIcon />
          <span className="ml-1.5 text-xs text-chrome-400 truncate">
            chrome-extension://tabnap/page.html
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Popup demo (browser window with extension popup dropdown) ──────────────
function PopupDemo({
  onSnooze,
  onBeginSwap,
  onCompleteSwap,
  openTabs,
  activeIndex,
  onSelectTab,
}: {
  onSnooze: (label: string, hours: number) => void;
  onBeginSwap: () => void;
  onCompleteSwap: () => void;
  openTabs: {
    slotId: number;
    title: string;
    url: string;
    initial: string;
    color: string;
    skeleton: string;
  }[];
  activeIndex: number;
  onSelectTab: (index: number) => void;
}) {
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(true);
  const [closingIndex, setClosingIndex] = useState<number | null>(null);
  const [openingIndex, setOpeningIndex] = useState<number | null>(null);
  const [popupView, setPopupView] = useState<
    "buttons" | "datepicker" | "recurring"
  >("buttons");
  // During transition, show the next existing tab (not the new one at the end)
  const nextActiveIndex =
    closingIndex !== null
      ? closingIndex < openTabs.length - 2
        ? closingIndex + 1
        : Math.max(0, closingIndex - 1)
      : null;
  const currentTab =
    nextActiveIndex !== null
      ? openTabs[nextActiveIndex]
      : openTabs[activeIndex];

  function doSnooze(label: string, hours: number, buttonLabel?: string) {
    if (activeBtn || !popupVisible || !currentTab) return;
    setActiveBtn(buttonLabel || label);
    onSnooze(label, hours);
    setTimeout(() => {
      setPopupVisible(false);
      setPopupView("buttons");
      setClosingIndex(activeIndex);
      onBeginSwap();
      setOpeningIndex(openTabs.length);
      setTimeout(() => {
        setActiveBtn(null);
        setClosingIndex(null);
        setOpeningIndex(null);
        onCompleteSwap();
        setTimeout(() => setPopupVisible(true), 200);
      }, 350);
    }, 1200);
  }

  function handleClick(
    label: string,
    hours: number,
    action?: "recurring" | "datepicker"
  ) {
    if (action === "recurring") {
      setPopupView("recurring");
      return;
    }
    if (action === "datepicker") {
      setPopupView("datepicker");
      return;
    }
    doSnooze(label, hours);
  }

  return (
    <div className="w-full flex flex-col min-h-0 overflow-hidden h-[420px] lg:h-full">
      <div className="rounded-xl shadow-lg overflow-hidden border border-chrome-200 bg-white flex flex-col flex-1 min-h-0">
        {/* Browser chrome: tab strip (darker) + toolbar (matches active tab) */}
        <div>
          {/* Tab strip */}
          <div className="flex items-end gap-0 px-4 pt-2.5 bg-chrome-200">
            <div className="flex gap-1.5 pb-2 pr-3 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex min-w-0 flex-1 gap-0.5">
              {openTabs.map((tab, i) => {
                const isClosing = closingIndex === i;
                const isOpening = openingIndex === i;
                const isActive =
                  nextActiveIndex !== null
                    ? i === nextActiveIndex
                    : i === activeIndex && !isClosing;
                return (
                  <div
                    key={tab.slotId}
                    className={`flex items-center justify-center rounded-t-lg p-1.5 overflow-hidden ${
                      isClosing
                        ? "opacity-0 animate-tab-close"
                        : isOpening
                        ? "animate-tab-open bg-chrome-100 cursor-pointer"
                        : isActive
                        ? "bg-chrome-100 cursor-pointer"
                        : "bg-chrome-300/50 hover:bg-chrome-300/80 cursor-pointer"
                    }`}
                    onClick={() => !isClosing && !isOpening && onSelectTab(i)}
                  >
                    <div
                      className={`w-4 h-4 rounded text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0 ${tab.color}`}
                    >
                      {tab.initial}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Toolbar — same color as active tab */}
          <div className="bg-chrome-100 px-4 pb-2.5 pt-2 flex items-center gap-2">
            <NavButtons />
            <div className="flex-1 flex items-center bg-white rounded-full px-3 py-1 border border-chrome-200">
              <LockIcon />
              <span className="ml-1.5 text-xs text-chrome-400 truncate">
                {currentTab?.url ?? ""}
              </span>
            </div>
            {/* Extension icon — popup hangs from this */}
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-violet-100 text-violet-500">
                <div className="w-4 h-4">
                  <TabNapIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Page content area with popup floating inside */}
        <div className="relative border-t border-chrome-200 bg-white flex-1 overflow-hidden">
          {currentTab && <PageSkeleton type={currentTab.skeleton} />}
          {/* Popup card, right-aligned under extension icon */}
          <div
            className={`absolute right-3 top-2 w-60 sm:w-72 rounded-lg shadow-xl border border-chrome-200 bg-white overflow-hidden origin-top-right transition-all duration-200 ${
              popupVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {popupView === "buttons" && (
              <div className="aspect-square grid grid-cols-3 grid-rows-3">
                {SNOOZE_BUTTONS.map((btn, i) => {
                  const isActive = activeBtn === btn.label;
                  const Icon = btn.icon;
                  const isRight = (i + 1) % 3 !== 0;
                  const isBottom = i < 6;
                  return (
                    <button
                      key={btn.label}
                      className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                        isRight ? "border-r border-chrome-200" : ""
                      } ${isBottom ? "border-b border-chrome-200" : ""} ${
                        isActive
                          ? "bg-violet-50 text-violet-600"
                          : "bg-white text-chrome-600 hover:bg-chrome-50"
                      }`}
                      onClick={() =>
                        handleClick(
                          btn.label,
                          btn.hours,
                          (btn as { action?: "recurring" | "datepicker" })
                            .action
                        )
                      }
                    >
                      <div
                        className={`w-8 h-8 transition-transform duration-200 ${
                          isActive ? "scale-110" : ""
                        }`}
                      >
                        {isActive ? <IconCheck /> : <Icon />}
                      </div>
                      {!isActive && (
                        <span className="text-xs font-medium">
                          {btn.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {popupView === "datepicker" && (
              <DemoDatePicker
                onCancel={() => setPopupView("buttons")}
                onSelect={(label, hours) => {
                  setPopupView("buttons");
                  requestAnimationFrame(() => doSnooze(label, hours, "Pick a Date"));
                }}
              />
            )}
            {popupView === "recurring" && (
              <DemoRecurringPicker
                onCancel={() => setPopupView("buttons")}
                onSchedule={(label, hours) => {
                  setPopupView("buttons");
                  requestAnimationFrame(() => doSnooze(label, hours, "Repeatedly"));
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Demo Date Picker (mini calendar inside popup card) ─────────────────────
const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES_FULL = [
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
const MONTH_NAMES_SHORT = [
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

function DemoDatePicker({
  onCancel,
  onSelect,
}: {
  onCancel: () => void;
  onSelect: (label: string, hours: number) => void;
}) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function isToday(d: number) {
    return (
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }

  function isPast(d: number) {
    const date = new Date(year, month, d);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  function handleDateClick(d: number) {
    if (isPast(d)) return;
    const target = new Date(year, month, d, 9, 0, 0);
    const hoursFromNow = (target.getTime() - Date.now()) / (1000 * 60 * 60);
    const label = `${MONTH_NAMES_SHORT[month]} ${d}`;
    onSelect(label, Math.max(hoursFromNow, 0.1));
  }

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="aspect-square flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <button
            className="p-0.5 rounded-full hover:bg-chrome-100 cursor-pointer"
            onClick={onCancel}
          >
            <svg
              className="w-4 h-4 text-chrome-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-sm font-bold text-chrome-800 ml-1">
            {MONTH_NAMES_FULL[month]}
          </span>
          <span className="text-sm text-chrome-500 ml-1">{year}</span>
        </div>
        <div className="flex gap-0.5">
          <button
            className="p-0.5 rounded-full hover:bg-chrome-100 cursor-pointer"
            onClick={prevMonth}
          >
            <svg
              className="w-4 h-4 text-chrome-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="p-0.5 rounded-full hover:bg-chrome-100 cursor-pointer"
            onClick={nextMonth}
          >
            <svg
              className="w-4 h-4 text-chrome-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-chrome-500"
          >
            {d}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 content-start">
        {blanks.map((b) => (
          <div key={`b${b}`} />
        ))}
        {days.map((d) => (
          <div
            key={d}
            className={`flex items-center justify-center text-xs rounded-full aspect-square cursor-pointer ${
              isToday(d)
                ? "ring-1 ring-violet-400 text-violet-600 font-bold"
                : isPast(d)
                  ? "text-chrome-300"
                  : "text-chrome-700 hover:bg-chrome-100"
            }`}
            onClick={() => handleDateClick(d)}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Demo Recurring Picker ─────────────────────────────────────────────────
const FREQ_OPTIONS = ["Daily", "Weekly", "Monthly"] as const;
const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DemoRecurringPicker({
  onCancel,
  onSchedule,
}: {
  onCancel: () => void;
  onSchedule: (label: string, hours: number) => void;
}) {
  const [frequency, setFrequency] = useState<
    "Daily" | "Weekly" | "Monthly"
  >("Daily");
  const [weekdays, setWeekdays] = useState([1]); // Monday
  const [dayOfMonth, setDayOfMonth] = useState(1);

  function toggleWeekday(d: number) {
    setWeekdays((prev) => {
      if (prev.includes(d)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== d);
      }
      return [...prev, d].sort();
    });
  }

  function handleSchedule() {
    let label: string;
    let hours: number;
    if (frequency === "Daily") {
      label = "Daily at 9:00 AM";
      hours = 24;
    } else if (frequency === "Weekly") {
      const dayStr = weekdays.map((d) => DAY_NAMES_SHORT[d]).join(", ");
      label = `Every ${dayStr} at 9:00 AM`;
      // Hours until next matching weekday
      const now = new Date();
      const todayDay = now.getDay();
      const sorted = [...weekdays].sort();
      let daysUntil = 7;
      for (const d of sorted) {
        const diff = (d - todayDay + 7) % 7;
        if (diff > 0 && diff < daysUntil) daysUntil = diff;
      }
      if (daysUntil === 7) daysUntil = 7; // wrap to next week
      hours = daysUntil * 24;
    } else {
      label = `Monthly on the ${dayOfMonth}${ordinalSuffix(dayOfMonth)}`;
      hours = 30 * 24; // ~1 month
    }
    onSchedule(label, hours);
  }

  return (
    <div className="aspect-square flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center mb-3">
        <button
          className="p-0.5 rounded-full hover:bg-chrome-100 cursor-pointer"
          onClick={onCancel}
        >
          <svg
            className="w-4 h-4 text-chrome-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-sm font-bold text-chrome-800 ml-1">
          Repeat Schedule
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {/* Frequency */}
        <div>
          <div className="text-[10px] font-semibold text-chrome-400 uppercase tracking-wider mb-1">
            Frequency
          </div>
          <div className="flex gap-1">
            {FREQ_OPTIONS.map((f) => (
              <button
                key={f}
                className={`px-2.5 py-1 rounded-full text-xs cursor-pointer border transition-colors ${
                  frequency === f
                    ? "border-violet-300 bg-violet-50 text-violet-600"
                    : "border-chrome-200 text-chrome-600 hover:border-chrome-300"
                }`}
                onClick={() => setFrequency(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly: day toggles */}
        {frequency === "Weekly" && (
          <div>
            <div className="text-[10px] font-semibold text-chrome-400 uppercase tracking-wider mb-1">
              Days
            </div>
            <div className="flex gap-1">
              {DAY_LETTERS.map((letter, i) => {
                const active = weekdays.includes(i);
                return (
                  <button
                    key={i}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs cursor-pointer border transition-colors ${
                      active
                        ? "border-violet-300 bg-violet-50 text-violet-600"
                        : "border-chrome-200 text-chrome-600 hover:border-chrome-300"
                    }`}
                    onClick={() => toggleWeekday(i)}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly: day of month */}
        {frequency === "Monthly" && (
          <div>
            <div className="text-[10px] font-semibold text-chrome-400 uppercase tracking-wider mb-1">
              Day of month
            </div>
            <select
              className="py-1 px-2 rounded-md bg-white border border-chrome-200 cursor-pointer outline-none text-xs text-chrome-700"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Time (fixed display) */}
        <div>
          <div className="text-[10px] font-semibold text-chrome-400 uppercase tracking-wider mb-1">
            Time
          </div>
          <div className="py-1 px-2 rounded-md bg-chrome-50 border border-chrome-200 text-xs text-chrome-700 w-fit">
            9:00 AM
          </div>
        </div>
      </div>

      {/* Schedule button */}
      <button
        className="w-full mt-2 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 cursor-pointer"
        onClick={handleSchedule}
      >
        Schedule
      </button>
    </div>
  );
}

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function PageSkeleton({ type }: { type: string }) {
  const b = "rounded bg-chrome-100"; // base block style
  switch (type) {
    case "github":
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${b}`} />
            <div className={`h-3 w-40 ${b}`} />
            <div className={`h-5 w-16 rounded-full bg-green-100 ml-auto`} />
          </div>
          <div className={`h-px w-full bg-chrome-100`} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className={`w-4 h-4 mt-0.5 rounded ${b}`} />
              <div className="flex-1 space-y-1.5">
                <div className={`h-2.5 w-3/4 ${b}`} />
                <div className={`h-2 w-1/2 ${b} opacity-60`} />
              </div>
            </div>
          ))}
        </div>
      );
    case "search":
      return (
        <div className="p-4 space-y-3">
          <div className={`h-8 w-3/4 mx-auto rounded-full ${b}`} />
          <div className="flex gap-4 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-2.5 w-12 ${b}`} />
            ))}
          </div>
          <div className="space-y-4 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className={`h-2.5 w-48 ${b} opacity-70`} />
                <div className={`h-3 w-64 rounded bg-blue-100`} />
                <div className={`h-2 w-full ${b} opacity-50`} />
                <div className={`h-2 w-4/5 ${b} opacity-50`} />
              </div>
            ))}
          </div>
        </div>
      );
    case "docs":
      return (
        <div className="flex h-full">
          <div className="w-1/4 border-r border-chrome-100 p-3 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-2 ${b} ${
                  i === 2 ? "bg-sky-100 w-full" : `w-${i % 2 ? "3/4" : "full"}`
                }`}
              />
            ))}
          </div>
          <div className="flex-1 p-4 space-y-2.5">
            <div className={`h-4 w-48 ${b}`} />
            <div className={`h-2 w-full ${b} opacity-60`} />
            <div className={`h-2 w-full ${b} opacity-60`} />
            <div className={`h-2 w-3/4 ${b} opacity-60`} />
            <div className={`h-20 w-full rounded ${b} opacity-40 mt-3`} />
          </div>
        </div>
      );
    case "video":
      return (
        <div className="p-4 space-y-3">
          <div className={`w-full aspect-[16/7] rounded-lg ${b}`} />
          <div className="flex gap-3">
            <div className={`w-9 h-9 rounded-full ${b} flex-shrink-0`} />
            <div className="space-y-1.5 flex-1">
              <div className={`h-3 w-4/5 ${b}`} />
              <div className={`h-2 w-1/3 ${b} opacity-60`} />
            </div>
          </div>
        </div>
      );
    case "feed":
      return (
        <div className="p-4 space-y-0">
          <div className={`h-4 w-40 ${b} mb-3`} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-baseline gap-2 py-1.5">
              <div className={`w-4 h-3 ${b} flex-shrink-0 opacity-60`} />
              <div
                className={`h-2.5 ${b} flex-1`}
                style={{ maxWidth: `${50 + ((i * 17) % 40)}%` }}
              />
            </div>
          ))}
        </div>
      );
    case "canvas":
      return (
        <div className="flex h-full">
          <div className="w-10 border-r border-chrome-100 p-2 space-y-3 flex flex-col items-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-5 h-5 rounded ${b}`} />
            ))}
          </div>
          <div className="flex-1 p-4 flex items-start justify-center">
            <div className="grid grid-cols-3 gap-3 w-full max-w-[200px]">
              <div className={`h-16 rounded-lg ${b} col-span-2`} />
              <div className={`h-16 rounded-lg ${b}`} />
              <div className={`h-12 rounded-lg ${b}`} />
              <div className={`h-12 rounded-lg ${b} col-span-2`} />
            </div>
          </div>
        </div>
      );
    case "product":
      return (
        <div className="flex gap-4 p-4">
          <div className={`w-28 h-28 rounded-lg ${b} flex-shrink-0`} />
          <div className="flex-1 space-y-2">
            <div className={`h-3 w-full ${b}`} />
            <div className={`h-3 w-3/4 ${b}`} />
            <div className={`h-2 w-20 rounded bg-amber-100 mt-1`} />
            <div className={`h-4 w-16 ${b} mt-2`} />
            <div className={`h-7 w-24 rounded-full bg-amber-100 mt-2`} />
          </div>
        </div>
      );
    case "article":
      return (
        <div className="p-4 space-y-2.5">
          <div className={`h-5 w-3/4 ${b}`} />
          <div className={`h-2 w-32 ${b} opacity-50`} />
          <div className={`h-px w-full bg-chrome-100 my-1`} />
          <div className={`h-2 w-full ${b} opacity-60`} />
          <div className={`h-2 w-full ${b} opacity-60`} />
          <div className={`h-2 w-5/6 ${b} opacity-60`} />
          <div className={`h-2 w-full ${b} opacity-60`} />
          <div className={`h-2 w-2/3 ${b} opacity-60`} />
        </div>
      );
    default:
      return null;
  }
}

function NavButtons() {
  return (
    <div className="flex items-center gap-1 flex-shrink-0 text-chrome-400">
      {/* Back */}
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {/* Forward */}
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
      {/* Refresh */}
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 4v6h-6" />
        <path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      className="w-3 h-3 text-chrome-400 flex-shrink-0"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm2 6H6V5a2 2 0 1 1 4 0v2z" />
    </svg>
  );
}

// ── List demo ──────────────────────────────────────────────────────────────
function ListDemo({
  tabs,
  newTabId,
}: {
  tabs: SnoozedTab[];
  newTabId: number | null;
}) {
  const groups = groupTabs(tabs);

  return (
    <div className="w-full flex flex-col min-h-0 overflow-hidden h-[400px] lg:h-full">
      <BrowserFrame>
        <div className="bg-white flex flex-col flex-1 min-h-0">
          {/* Header bar */}
          <div className="flex items-center h-11 px-4 border-b border-chrome-200 flex-shrink-0">
            <div className="flex items-center gap-1.5 mr-4">
              <div className="w-5 h-5 text-violet-500">
                <TabNapIcon />
              </div>
              <span className="text-sm font-semibold text-chrome-800">
                TabNap
              </span>
            </div>
            <div className="flex items-center h-full text-sm">
              <div className="h-full flex items-center px-3 border-b-2 border-violet-500 text-violet-600 font-medium">
                Home
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-violet-500 text-white rounded-full leading-none">
                  {tabs.length}
                </span>
              </div>
            </div>
          </div>
          {/* Tab list */}
          <div className="px-4 py-3 overflow-y-auto flex-1 min-h-0">
            <h3 className="text-sm font-semibold text-chrome-800 mb-2">
              Snoozed Tabs
            </h3>
            {groups.map((group) => (
              <div key={group.label} className="mb-3">
                <div className="text-[11px] font-semibold text-chrome-400 uppercase tracking-wider py-1">
                  {group.label} &middot; {group.tabs.length}{" "}
                  {group.tabs.length === 1 ? "tab" : "tabs"}
                </div>
                {group.tabs.map((tab) => (
                  <TabRow key={tab.id} tab={tab} isNew={tab.id === newTabId} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </BrowserFrame>
    </div>
  );
}

function TabRow({ tab, isNew }: { tab: SnoozedTab; isNew: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (isNew && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <div
      ref={rowRef}
      className={`flex items-center py-2 px-2 rounded transition-colors duration-300 ${
        highlight ? "bg-violet-50" : "hover:bg-chrome-50"
      }`}
    >
      <div
        className={`w-6 h-6 rounded text-white text-xs font-medium flex items-center justify-center flex-shrink-0 mr-3 ${tab.color}`}
      >
        {tab.initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-chrome-800 truncate">
          {tab.title}
        </div>
        <div className="flex gap-3 text-xs text-chrome-400">
          <span>{tab.label}</span>
          <span>{getRelativeLabel(tab.when)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Icons (ported from extension's FA Duotone SVGs) ────────────────────────
function TabNapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M320 32L304 0l-16 32-32 16 32 16 16 32 16-32 32-16zm138.7 149.3L432 128l-26.7 53.3L352 208l53.3 26.7L432 288l26.7-53.3L512 208z"
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M332.2 426.4c8.1-1.6 13.9 8 8.6 14.5a191.18 191.18 0 0 1-149 71.1C85.8 512 0 426 0 320c0-120 108.7-210.6 227-188.8 8.2 1.6 10.1 12.6 2.8 16.7a150.3 150.3 0 0 0-76.1 130.8c0 94 85.4 165.4 178.5 147.7z"
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
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M400 192H32a32 32 0 0 0-32 32v192a96 96 0 0 0 96 96h192a96 96 0 0 0 96-96h16a112 112 0 0 0 0-224zm0 160h-16v-96h16a48 48 0 0 1 0 96z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M320 32L304 0l-16 32-32 16 32 16 16 32 16-32 32-16zm138.7 149.3L432 128l-26.7 53.3L352 208l53.3 26.7L432 288l26.7-53.3L512 208z"
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M332.2 426.4c8.1-1.6 13.9 8 8.6 14.5a191.18 191.18 0 0 1-149 71.1C85.8 512 0 426 0 320c0-120 108.7-210.6 227-188.8 8.2 1.6 10.1 12.6 2.8 16.7a150.3 150.3 0 0 0-76.1 130.8c0 94 85.4 165.4 178.5 147.7z"
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
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M352 256a96 96 0 1 1-96-96 96.15 96.15 0 0 1 96 96z"
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
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M640 256a63.84 63.84 0 0 1-32 55.1V432a16 16 0 0 1-16 16h-64a16 16 0 0 1-16-16v-16H128v16a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V311.1A63.79 63.79 0 0 1 64 192h32a32 32 0 0 1 32 32v96h384v-96a32 32 0 0 1 32-32h32a64.06 64.06 0 0 1 64 64z"
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
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M96 512h256v-96H96zM320 80h-8V56a56.06 56.06 0 0 0-56-56h-64a56.06 56.06 0 0 0-56 56v24h-8A128 128 0 0 0 0 208v240a64 64 0 0 0 64 64V352a64.07 64.07 0 0 1 64-64h192a64.07 64.07 0 0 1 64 64v160a64 64 0 0 0 64-64V208A128 128 0 0 0 320 80zM184 56a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v24h-80zm136 144a8 8 0 0 1-8 8H136a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8z"
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
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M143.93 64C64.2 64 0 129.65 0 209.38V416a32 32 0 0 0 32 32h224a32 32 0 0 0 32-32V208A144 144 0 0 0 143.93 64zM224 240a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16zm272-48H392a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h56v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16z"
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
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M241.2 352h-98.4A144 144 0 0 0 .36 474.78C-2.53 494.3 12.39 512 32.12 512h319.76c19.73 0 34.65-17.7 31.76-37.22A144 144 0 0 0 241.2 352zm206.62-238.36C439.69 67.43 393 32 336.53 32c-34.88 0-65.66 13.82-86.3 35.08C235.78 28.29 193.72 0 143.47 0 87 0 40.31 35.43 32.18 81.64a12.37 12.37 0 0 0 10.24 14.2 12.24 12.24 0 0 0 2.18.16H80l16-32 16 32h30.17c-34.21 35-39.62 86.88-14.54 122.58 4.36 6.2 13.14 7.31 18.5 1.95L238.89 128H368l16-32 16 32h35.4a12.38 12.38 0 0 0 12.6-12.18 12.24 12.24 0 0 0-.18-2.18z"
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
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M504 57.94V192a24 24 0 0 1-24 24H345.94c-21.38 0-32.09-25.85-17-41L463 41c15.15-15.15 41-4.44 41 16.94z"
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
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M448 112v80H0v-80a48 48 0 0 1 48-48h48v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V64h128v48a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V64h48a48 48 0 0 1 48 48z"
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
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M264.67 385.59l-54.57 54.87a25.5 25.5 0 0 1-36.06.14l-.14-.14L7.5 273.1a25.84 25.84 0 0 1 0-36.41l36.2-36.41a25.49 25.49 0 0 1 36-.17l.16.17z"
        fill="currentColor"
      />
    </svg>
  );
}
