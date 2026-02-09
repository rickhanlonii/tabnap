const screenshots = [
  {
    file: "popup-grid.png",
    alt: "TabNap popup showing the 3x3 snooze button grid",
    caption: "One-click snooze",
    description:
      "Pick a time from the popup — Later Today, Tomorrow, Next Week, or set a custom date.",
    placeholder:
      "SCREENSHOT NEEDED: Open the TabNap popup on any webpage. Show the 3x3 grid of snooze buttons (Later Today, Tonight, Tomorrow, Next Weekend, Next Week, In a month, Someday, Repeatedly, Pick a Date). Recommended size: 800x800px.",
  },
  {
    file: "snoozed-list.png",
    alt: "TabNap full-page view showing snoozed tabs grouped by time period",
    caption: "See what's napping",
    description:
      "Full-page dashboard shows all snoozed tabs, grouped by when they'll wake up. Search, re-snooze, or delete.",
    placeholder:
      "SCREENSHOT NEEDED: Open page.html#list with 5-8 snoozed tabs. Show tabs grouped under 'Today', 'Tomorrow', 'This Week'. Include the search bar at top. Hover over one tab to show the re-snooze and delete icons. Recommended size: 1200x800px.",
  },
  {
    file: "date-picker.png",
    alt: "TabNap date picker calendar for custom snooze dates",
    caption: "Pick any date",
    description:
      "Need a specific date? The built-in calendar lets you pick exactly when your tab should wake up.",
    placeholder:
      "SCREENSHOT NEEDED: Click 'Pick a Date' in the popup to show the calendar view. Pick a month that has dates in the future visible. Recommended size: 800x800px.",
  },
  {
    file: "dark-mode.png",
    alt: "TabNap in dark mode showing the snoozed tabs list",
    caption: "Dark mode included",
    description:
      "Follows your system theme automatically, or set light/dark manually. Easy on the eyes at night.",
    placeholder:
      "SCREENSHOT NEEDED: Set system theme to dark (or set TabNap theme to Dark in settings). Open page.html#list with a few snoozed tabs. Show the dark background with light text. Recommended size: 1200x800px.",
  },
];

function ScreenshotPlaceholder({ item }: { item: (typeof screenshots)[0] }) {
  return (
    <div className="group">
      {/* Placeholder box — replace with <img> once screenshots exist */}
      <div className="relative aspect-[4/3] rounded-xl bg-chrome-100 border-2 border-dashed border-chrome-300 flex items-center justify-center overflow-hidden">
        <div className="px-6 py-4 text-center">
          <p className="text-sm text-chrome-500 font-mono">{item.file}</p>
          <p className="mt-2 text-xs text-chrome-400 max-w-xs">
            {item.placeholder}
          </p>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-chrome-900">
        {item.caption}
      </h3>
      <p className="mt-1 text-base text-chrome-600">{item.description}</p>
    </div>
  );
}

export function Screenshots() {
  return (
    <section className="bg-chrome-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-chrome-900 sm:text-4xl">
          How it works
        </h2>
        <p className="mt-4 text-center text-lg text-chrome-600 max-w-2xl mx-auto">
          Snooze tabs from the popup, manage them from the dashboard.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2">
          {screenshots.map((item) => (
            <ScreenshotPlaceholder key={item.file} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
