const features = [
  {
    title: "Preset & custom times",
    description:
      "Later Today, Tonight, Tomorrow, Next Week, Someday — or pick any date from the calendar.",
    icon: "🕐",
  },
  {
    title: "Recurring snooze",
    description:
      "Snooze tabs that come back every day. Free — competitors charge for this.",
    icon: "🔁",
  },
  {
    title: "Wake-up sounds & notifications",
    description:
      "Audio cue and desktop notification when your tabs wake up. Toggle each on or off.",
    icon: "🔔",
  },
  {
    title: "History with search",
    description:
      "Full history of woken tabs. Search by title or URL. Re-open anything you snoozed before.",
    icon: "📋",
  },
  {
    title: "10 color themes",
    description:
      "Choose from 10 accent color palettes — Violet, Amber, Emerald, Rose, and more. Make it yours.",
    icon: "🎨",
  },
  {
    title: "Dark mode",
    description:
      "Follows your system theme automatically. Or force light/dark in settings.",
    icon: "🌙",
  },
];

export function Features() {
  return (
    <section className="bg-white dark:bg-chrome-900 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-chrome-900 dark:text-white sm:text-4xl">
          Everything you need, nothing you don&apos;t
        </h2>
        <p className="mt-4 text-center text-lg text-chrome-600 dark:text-chrome-400 max-w-2xl mx-auto">
          No subscriptions. No sign-ups. No bloat. Just tab snoozing, done
          right.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-chrome-200 dark:border-chrome-700 p-6"
            >
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-chrome-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-base text-chrome-600 dark:text-chrome-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
