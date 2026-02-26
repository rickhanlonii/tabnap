export function Footer() {
  return (
    <footer className="bg-chrome-900 dark:bg-chrome-950 border-t border-chrome-800 py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-chrome-400">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="TabNap" className="h-5 w-5" />
            <span className="text-sm">
              TabNap — Give your tabs a little nap, as a treat.
            </span>
          </div>
          <span className="text-xs text-chrome-500">
            Inspired by{" "}
            <a
              href="https://x.com/tabsnooze"
              className="underline hover:text-chrome-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              TabSnooze
            </a>
          </span>
        </div>
        <div className="flex gap-6 text-sm text-chrome-500">
          <a href="https://chromewebstore.google.com/detail/djoiloodageglokcnogknbkljhkdicjm?utm_source=item-share-cb" className="hover:text-chrome-300 transition-colors">
            Chrome Web Store
          </a>
          <a
            href="/privacy"
            className="hover:text-chrome-300 transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
