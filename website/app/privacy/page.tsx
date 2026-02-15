import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — TabNap",
  description: "TabNap privacy policy. No data collection, no tracking, no accounts.",
};

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight text-chrome-900">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-chrome-500">
        Last updated: February 9, 2026
      </p>

      <div className="mt-10 space-y-8 text-base leading-7 text-chrome-700">
        <section>
          <h2 className="text-xl font-semibold text-chrome-900">Overview</h2>
          <p className="mt-2">
            TabNap is a browser extension that snoozes tabs — it closes them now
            and reopens them later at a time you choose. TabNap does not collect,
            transmit, or share any personal data. All data stays on your device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-chrome-900">
            Data storage
          </h2>
          <p className="mt-2">
            TabNap stores the following data locally on your device using{" "}
            <code className="rounded bg-chrome-100 px-1.5 py-0.5 text-sm">
              chrome.storage.local
            </code>
            :
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Snoozed tab information (page title, URL, favicon URL, scheduled wake-up time)</li>
            <li>History of previously woken tabs</li>
            <li>Your settings and preferences (snooze times, theme, sound and notification toggles)</li>
          </ul>
          <p className="mt-2">
            This data never leaves your browser. It is not sent to any server,
            API, or third party.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-chrome-900">
            Data collection
          </h2>
          <p className="mt-2">
            TabNap does <strong>not</strong> collect:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Personal information</li>
            <li>Browsing history or activity</li>
            <li>Analytics or usage telemetry</li>
            <li>Crash reports</li>
            <li>Cookies or tracking identifiers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-chrome-900">
            Network requests
          </h2>
          <p className="mt-2">
            TabNap makes no network requests. It operates entirely offline. There
            are no external servers, no APIs, and no remote endpoints of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-chrome-900">
            Permissions
          </h2>
          <p className="mt-2">
            TabNap requests the following browser permissions, each used solely
            for its core functionality:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>
              <strong>alarms</strong> — Schedule tab wake-ups at the correct time
            </li>
            <li>
              <strong>tabs</strong> — Close the current tab when snoozing and
              reopen tabs when they wake up
            </li>
            <li>
              <strong>storage</strong> — Save snoozed tabs, history, and settings
              locally
            </li>
            <li>
              <strong>idle</strong> — Detect when you return to your computer so
              alarms that fired while away are handled
            </li>
            <li>
              <strong>notifications</strong> — Show a desktop notification when
              tabs wake up (optional, can be disabled)
            </li>
            <li>
              <strong>offscreen</strong> — Play a wake-up sound when tabs reopen
              (optional, can be disabled)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-chrome-900">
            Third parties
          </h2>
          <p className="mt-2">
            TabNap does not integrate with, send data to, or receive data from
            any third-party services. There are no ads, no analytics SDKs, and no
            embedded third-party content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-chrome-900">
            Open source
          </h2>
          <p className="mt-2">
            TabNap is open source. You can inspect the full source code to verify
            these claims. The code is available on{" "}
            {/* TODO: Replace # with actual GitHub URL */}
            <a href="#" className="text-chrome-blue hover:text-chrome-blue-hover underline">
              GitHub
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-chrome-900">
            Changes to this policy
          </h2>
          <p className="mt-2">
            If this policy is updated, the changes will be reflected on this page
            with an updated date. Since TabNap collects no data, meaningful
            changes to this policy are unlikely.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-chrome-900">Contact</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, open an issue on the{" "}
            {/* TODO: Replace # with actual GitHub URL */}
            <a href="#" className="text-chrome-blue hover:text-chrome-blue-hover underline">
              GitHub repository
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
