# TabNap Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static marketing/landing page for TabNap using Next.js App Router — explains what TabNap does, links to Chrome Web Store (TODO placeholder), has screenshot placeholders with descriptions, and is optimized for SEO and social sharing.

**Architecture:** Next.js App Router with static export (`output: 'export'`). Single-page site with sections rendered as components. Tailwind CSS for styling, reusing TabNap's chrome color palette. No client-side state — pure static HTML. The site lives in a `website/` directory at the repo root, completely separate from the extension source.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS 4, TypeScript, static export

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `website/` (via create-next-app)
- Modify: `website/tailwind.config.ts` (add chrome palette)
- Modify: `website/app/layout.tsx` (metadata)
- Modify: `website/app/page.tsx` (clear boilerplate)

**Step 1: Create Next.js app**

Run from repo root:

```bash
cd /Users/ricky/oss/tabnap && npx create-next-app@latest website --typescript --tailwind --eslint --app --no-src-dir --no-import-alias --turbopack
```

Accept defaults. This scaffolds `website/` with App Router, Tailwind, and TypeScript.

**Step 2: Verify it runs**

```bash
cd /Users/ricky/oss/tabnap/website && npm run dev
```

Expected: Dev server starts on localhost:3000, shows Next.js default page.

Stop the dev server (Ctrl+C).

**Step 3: Configure static export**

Edit `website/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

**Step 4: Add TabNap's chrome color palette to Tailwind**

Next.js 15 with Tailwind 4 uses CSS-based config (`app/globals.css`) instead of `tailwind.config.ts`. Add the chrome palette as custom theme variables in `website/app/globals.css`. Find the `@theme` block (or add one) and insert:

```css
@theme {
  --color-chrome-50: #F8F9FA;
  --color-chrome-100: #F1F3F4;
  --color-chrome-200: #E8EAED;
  --color-chrome-300: #DADCE0;
  --color-chrome-400: #BDC1C6;
  --color-chrome-500: #9AA0A6;
  --color-chrome-600: #80868B;
  --color-chrome-700: #5F6368;
  --color-chrome-800: #3C4043;
  --color-chrome-900: #202124;
  --color-chrome-blue: #1A73E8;
  --color-chrome-blue-hover: #1967D2;
  --color-chrome-blue-light: #E8F0FE;
}
```

These map to `bg-chrome-900`, `text-chrome-blue`, etc. — same class names the extension uses.

**Step 5: Clear boilerplate from page.tsx**

Replace `website/app/page.tsx` with:

```tsx
export default function Home() {
  return <main>TabNap landing page</main>;
}
```

**Step 6: Verify build works**

```bash
cd /Users/ricky/oss/tabnap/website && npm run build
```

Expected: Static export succeeds, outputs to `website/out/`.

**Step 7: Commit**

```bash
cd /Users/ricky/oss/tabnap && git add website && git commit -m "feat(website): scaffold Next.js landing page with static export"
```

---

### Task 2: SEO metadata and Open Graph tags

**Files:**
- Modify: `website/app/layout.tsx`
- Create: `website/public/og-image.png` (placeholder — copy existing `tabnap_large.png`)

**Step 1: Copy logo assets into website/public**

```bash
cp /Users/ricky/oss/tabnap/icon.png /Users/ricky/oss/tabnap/website/public/icon.png
cp /Users/ricky/oss/tabnap/tabnap_large.png /Users/ricky/oss/tabnap/website/public/og-image.png
```

**Step 2: Set up layout.tsx with full SEO metadata**

Replace `website/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TabNap — Snooze browser tabs, reopen them later",
  description:
    "Free, open-source Chrome extension to snooze tabs. Close tabs now, they reopen automatically at the time you choose. Recurring snooze, wake-up sounds, history, dark mode — all free.",
  keywords: [
    "tab snooze",
    "snooze tabs",
    "chrome extension",
    "tab manager",
    "browser tabs",
    "tab snooze extension",
    "reopen tabs",
    "tab scheduler",
    "free tab snooze",
    "open source chrome extension",
  ],
  authors: [{ name: "TabNap" }],
  openGraph: {
    title: "TabNap — Snooze browser tabs, reopen them later",
    description:
      "Free, open-source Chrome extension to snooze tabs. Close tabs now, they reopen automatically at the time you choose.",
    url: "https://tabnap.dev",
    siteName: "TabNap",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TabNap — Give your tabs a little nap",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TabNap — Snooze browser tabs, reopen them later",
    description:
      "Free, open-source Chrome extension to snooze tabs. Close tabs now, they reopen automatically at the time you choose.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

Note: The `openGraph.url` uses `https://tabnap.dev` as a placeholder — update when the actual domain is chosen.

**Step 3: Verify metadata renders**

```bash
cd /Users/ricky/oss/tabnap/website && npm run build
```

Expected: Build succeeds. Check `website/out/index.html` contains `<meta property="og:title"` and `<meta name="description"`.

**Step 4: Commit**

```bash
cd /Users/ricky/oss/tabnap && git add website/app/layout.tsx website/public/icon.png website/public/og-image.png && git commit -m "feat(website): add SEO metadata and Open Graph tags"
```

---

### Task 3: Hero section component

**Files:**
- Create: `website/app/components/hero.tsx`
- Modify: `website/app/page.tsx`

**Step 1: Create hero component**

Create `website/app/components/hero.tsx`:

```tsx
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-8 flex justify-center">
          <img src="/icon.png" alt="TabNap icon" className="h-20 w-20" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-chrome-900 sm:text-6xl">
          Give your tabs a little nap
        </h1>
        <p className="mt-6 text-lg leading-8 text-chrome-600 max-w-2xl mx-auto">
          Close tabs now, they reopen later — automatically, at the time you
          choose. Free, open-source, and no account required.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-4">
          {/* TODO: Replace # with actual Chrome Web Store URL */}
          <a
            href="#"
            className="rounded-lg bg-chrome-blue px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-chrome-blue-hover transition-colors"
          >
            Add to Chrome — It&apos;s Free
          </a>
          <a
            href="https://github.com/user/tabnap"
            className="text-base font-semibold text-chrome-700 hover:text-chrome-900 transition-colors"
          >
            View on GitHub &rarr;
          </a>
        </div>
        <p className="mt-4 text-sm text-chrome-500">
          Chrome Web Store listing coming soon
        </p>
      </div>
    </section>
  );
}
```

Note: The GitHub URL is a placeholder — update `https://github.com/user/tabnap` with the actual repo URL.

**Step 2: Wire hero into page.tsx**

Replace `website/app/page.tsx` with:

```tsx
import { Hero } from "./components/hero";

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}
```

**Step 3: Verify it renders**

```bash
cd /Users/ricky/oss/tabnap/website && npm run dev
```

Expected: Page shows TabNap icon, heading "Give your tabs a little nap", subtitle, and CTA button.

Stop dev server.

**Step 4: Commit**

```bash
cd /Users/ricky/oss/tabnap && git add website/app/components/hero.tsx website/app/page.tsx && git commit -m "feat(website): add hero section with CTA"
```

---

### Task 4: Screenshot showcase section

**Files:**
- Create: `website/app/components/screenshots.tsx`
- Create: `website/public/screenshots/.gitkeep`
- Modify: `website/app/page.tsx`

This section has placeholder image areas with descriptions of what screenshots to create. Each placeholder is a styled div with the same aspect ratio the real screenshot will have.

**Step 1: Create screenshots directory**

```bash
mkdir -p /Users/ricky/oss/tabnap/website/public/screenshots && touch /Users/ricky/oss/tabnap/website/public/screenshots/.gitkeep
```

**Step 2: Create screenshots component**

Create `website/app/components/screenshots.tsx`:

```tsx
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
```

**Step 3: Add Screenshots to page.tsx**

Update `website/app/page.tsx`:

```tsx
import { Hero } from "./components/hero";
import { Screenshots } from "./components/screenshots";

export default function Home() {
  return (
    <main>
      <Hero />
      <Screenshots />
    </main>
  );
}
```

**Step 4: Verify it renders**

```bash
cd /Users/ricky/oss/tabnap/website && npm run dev
```

Expected: Below the hero, a "How it works" section with 4 placeholder boxes in a 2x2 grid. Each box shows the filename and description of the screenshot to create.

Stop dev server.

**Step 5: Commit**

```bash
cd /Users/ricky/oss/tabnap && git add website/app/components/screenshots.tsx website/app/page.tsx website/public/screenshots/.gitkeep && git commit -m "feat(website): add screenshot showcase section with placeholders"
```

---

### Task 5: Features section

**Files:**
- Create: `website/app/components/features.tsx`
- Modify: `website/app/page.tsx`

**Step 1: Create features component**

Create `website/app/components/features.tsx`:

```tsx
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
    title: "Dark mode",
    description:
      "Follows your system theme automatically. Or force light/dark in settings.",
    icon: "🌙",
  },
  {
    title: "Open source",
    description:
      "MIT licensed on GitHub. No accounts, no tracking, no data collection. Your tabs stay on your machine.",
    icon: "🔓",
  },
];

export function Features() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-chrome-900 sm:text-4xl">
          Everything you need, nothing you don&apos;t
        </h2>
        <p className="mt-4 text-center text-lg text-chrome-600 max-w-2xl mx-auto">
          No subscriptions. No sign-ups. No bloat. Just tab snoozing, done
          right.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-chrome-200 p-6">
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-chrome-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-base text-chrome-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add Features to page.tsx**

Update `website/app/page.tsx`:

```tsx
import { Hero } from "./components/hero";
import { Screenshots } from "./components/screenshots";
import { Features } from "./components/features";

export default function Home() {
  return (
    <main>
      <Hero />
      <Screenshots />
      <Features />
    </main>
  );
}
```

**Step 3: Verify it renders**

```bash
cd /Users/ricky/oss/tabnap/website && npm run dev
```

Expected: Below screenshots, a "Everything you need, nothing you don't" section with 6 feature cards in a 3-column grid.

Stop dev server.

**Step 4: Commit**

```bash
cd /Users/ricky/oss/tabnap && git add website/app/components/features.tsx website/app/page.tsx && git commit -m "feat(website): add features grid section"
```

---

### Task 6: Comparison section (vs competitors)

**Files:**
- Create: `website/app/components/comparison.tsx`
- Modify: `website/app/page.tsx`

**Step 1: Create comparison component**

Create `website/app/components/comparison.tsx`:

```tsx
const rows = [
  { feature: "Preset snooze times", tabnap: true, others: true },
  { feature: "Custom date picker", tabnap: true, others: "Some" },
  { feature: "Recurring snooze", tabnap: true, others: "Paid" },
  { feature: "Wake-up sounds", tabnap: true, others: false },
  { feature: "Notification toggles", tabnap: true, others: false },
  { feature: "History with search", tabnap: true, others: false },
  { feature: "Undo delete", tabnap: true, others: false },
  { feature: "Dark / light / system theme", tabnap: true, others: "Rare" },
  { feature: "Open source", tabnap: true, others: "Rare" },
  { feature: "No account required", tabnap: true, others: "Most" },
  { feature: "Free — no paywalled features", tabnap: true, others: false },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <span className="text-green-600">✓</span>;
  if (value === false) return <span className="text-chrome-400">✗</span>;
  return <span className="text-chrome-500 text-sm">{value}</span>;
}

export function Comparison() {
  return (
    <section className="bg-chrome-50 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-chrome-900 sm:text-4xl">
          TabNap vs. the rest
        </h2>
        <p className="mt-4 text-center text-lg text-chrome-600">
          Most snooze extensions charge for features TabNap gives away free.
        </p>
        <div className="mt-12 overflow-hidden rounded-xl border border-chrome-200 bg-white">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b border-chrome-200 bg-chrome-50">
                <th className="py-3 px-4 font-semibold text-chrome-700">
                  Feature
                </th>
                <th className="py-3 px-4 text-center font-semibold text-chrome-900">
                  TabNap
                </th>
                <th className="py-3 px-4 text-center font-semibold text-chrome-700">
                  Others
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-chrome-100 last:border-b-0"
                >
                  <td className="py-3 px-4 text-chrome-700">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-lg">
                    <Cell value={row.tabnap} />
                  </td>
                  <td className="py-3 px-4 text-center text-lg">
                    <Cell value={row.others} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add Comparison to page.tsx**

Update `website/app/page.tsx`:

```tsx
import { Hero } from "./components/hero";
import { Screenshots } from "./components/screenshots";
import { Features } from "./components/features";
import { Comparison } from "./components/comparison";

export default function Home() {
  return (
    <main>
      <Hero />
      <Screenshots />
      <Features />
      <Comparison />
    </main>
  );
}
```

**Step 3: Verify it renders**

```bash
cd /Users/ricky/oss/tabnap/website && npm run dev
```

Expected: Below features, a comparison table with checkmarks for TabNap and mixed results for "Others".

Stop dev server.

**Step 4: Commit**

```bash
cd /Users/ricky/oss/tabnap && git add website/app/components/comparison.tsx website/app/page.tsx && git commit -m "feat(website): add competitor comparison table"
```

---

### Task 7: CTA section and footer

**Files:**
- Create: `website/app/components/cta.tsx`
- Create: `website/app/components/footer.tsx`
- Modify: `website/app/page.tsx`

**Step 1: Create CTA component**

Create `website/app/components/cta.tsx`:

```tsx
export function CTA() {
  return (
    <section className="bg-chrome-900 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to snooze some tabs?
        </h2>
        <p className="mt-4 text-lg text-chrome-400">
          Install TabNap in seconds. No account needed, no data collected,
          works offline.
        </p>
        <div className="mt-8">
          {/* TODO: Replace # with actual Chrome Web Store URL */}
          <a
            href="#"
            className="rounded-lg bg-chrome-blue px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-chrome-blue-hover transition-colors inline-block"
          >
            Add to Chrome — It&apos;s Free
          </a>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Create footer component**

Create `website/app/components/footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="bg-chrome-900 border-t border-chrome-800 py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-chrome-400">
          <img src="/icon.png" alt="TabNap" className="h-5 w-5" />
          <span className="text-sm">TabNap — Give your tabs a little nap, as a treat.</span>
        </div>
        <div className="flex gap-6 text-sm text-chrome-500">
          {/* TODO: Replace # with actual GitHub URL */}
          <a
            href="#"
            className="hover:text-chrome-300 transition-colors"
          >
            GitHub
          </a>
          {/* TODO: Replace # with actual Chrome Web Store URL */}
          <a
            href="#"
            className="hover:text-chrome-300 transition-colors"
          >
            Chrome Web Store
          </a>
        </div>
      </div>
    </footer>
  );
}
```

**Step 3: Add CTA and Footer to page.tsx**

Update `website/app/page.tsx`:

```tsx
import { Hero } from "./components/hero";
import { Screenshots } from "./components/screenshots";
import { Features } from "./components/features";
import { Comparison } from "./components/comparison";
import { CTA } from "./components/cta";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Screenshots />
      <Features />
      <Comparison />
      <CTA />
      <Footer />
    </main>
  );
}
```

**Step 4: Verify it renders**

```bash
cd /Users/ricky/oss/tabnap/website && npm run dev
```

Expected: Dark CTA section with "Ready to snooze some tabs?" heading and blue button. Footer below with TabNap tagline and links.

Stop dev server.

**Step 5: Commit**

```bash
cd /Users/ricky/oss/tabnap && git add website/app/components/cta.tsx website/app/components/footer.tsx website/app/page.tsx && git commit -m "feat(website): add CTA section and footer"
```

---

### Task 8: Final build verification and cleanup

**Files:**
- Modify: `website/app/globals.css` (remove any unused boilerplate styles)
- Verify: `website/out/` (static export)

**Step 1: Remove Next.js boilerplate CSS**

Open `website/app/globals.css` and remove any default Next.js body styles (things like `body { color: ...; background: ...; font-family: ... }` added by create-next-app). Keep only the Tailwind imports and the chrome color theme variables. The file should look like:

```css
@import "tailwindcss";

@theme {
  --color-chrome-50: #F8F9FA;
  --color-chrome-100: #F1F3F4;
  --color-chrome-200: #E8EAED;
  --color-chrome-300: #DADCE0;
  --color-chrome-400: #BDC1C6;
  --color-chrome-500: #9AA0A6;
  --color-chrome-600: #80868B;
  --color-chrome-700: #5F6368;
  --color-chrome-800: #3C4043;
  --color-chrome-900: #202124;
  --color-chrome-blue: #1A73E8;
  --color-chrome-blue-hover: #1967D2;
  --color-chrome-blue-light: #E8F0FE;
}
```

**Step 2: Delete unused boilerplate files**

```bash
rm -f /Users/ricky/oss/tabnap/website/public/file.svg /Users/ricky/oss/tabnap/website/public/globe.svg /Users/ricky/oss/tabnap/website/public/next.svg /Users/ricky/oss/tabnap/website/public/vercel.svg /Users/ricky/oss/tabnap/website/public/window.svg
```

(Delete whichever default SVGs create-next-app put in `public/`. The exact files may vary.)

**Step 3: Run production build**

```bash
cd /Users/ricky/oss/tabnap/website && npm run build
```

Expected: Build succeeds. `website/out/` contains `index.html` and static assets.

**Step 4: Verify the static export looks correct**

```bash
cd /Users/ricky/oss/tabnap/website && npx serve out
```

Open in browser. Verify all sections render: Hero → Screenshots → Features → Comparison → CTA → Footer. All text is readable, layout is responsive.

Stop the server.

**Step 5: Add website/out and website/.next to .gitignore**

Check if `website/.gitignore` exists (create-next-app usually creates one). Ensure it contains:

```
.next/
out/
node_modules/
```

**Step 6: Commit**

```bash
cd /Users/ricky/oss/tabnap && git add website && git commit -m "feat(website): final cleanup and production build verified"
```

---

## Screenshot Guide

When you're ready to create real screenshots, replace the placeholder divs in `screenshots.tsx` with `<img>` tags. Here's what to capture:

| File | What to capture | Tips |
|------|----------------|------|
| `popup-grid.png` | The 3x3 popup button grid | Open popup on a real webpage. Capture just the popup window (800x800px). Light theme. |
| `snoozed-list.png` | Full-page tab list with groups | Add 5-8 snoozed tabs spanning Today/Tomorrow/This Week. Hover one tab to show action icons. Light theme. (1200x800px) |
| `date-picker.png` | Calendar date picker in popup | Click "Pick a Date" in popup. Show a month with selectable dates. (800x800px) |
| `dark-mode.png` | Full-page list in dark mode | Same as snoozed-list but with dark theme active. (1200x800px) |

To swap placeholders for real images, change `ScreenshotPlaceholder` in `screenshots.tsx` to render:

```tsx
<img
  src={`/screenshots/${item.file}`}
  alt={item.alt}
  className="rounded-xl shadow-lg border border-chrome-200"
/>
```

---

## TODO Checklist

These items are marked with `TODO` comments in the code:

- [ ] Replace Chrome Web Store `href="#"` in hero.tsx, cta.tsx, footer.tsx with actual CWS URL
- [ ] Replace GitHub `href="#"` in hero.tsx, footer.tsx with actual repo URL
- [ ] Replace `og-image.png` with a proper 1200x630 Open Graph image
- [ ] Replace `openGraph.url` in layout.tsx with actual domain
- [ ] Create 4 real screenshots and place in `website/public/screenshots/`
- [ ] Update `ScreenshotPlaceholder` to render `<img>` tags once screenshots exist
- [ ] Set up deployment (Vercel, GitHub Pages, or Cloudflare Pages)
