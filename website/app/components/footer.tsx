export function Footer() {
  return (
    <footer className="bg-chrome-900 border-t border-chrome-800 py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-chrome-400">
          <img src="/icon.png" alt="TabNap" className="h-5 w-5" />
          <span className="text-sm">
            TabNap — Give your tabs a little nap, as a treat.
          </span>
        </div>
        <div className="flex gap-6 text-sm text-chrome-500">
          {/* TODO: Replace # with actual GitHub URL */}
          <a href="#" className="hover:text-chrome-300 transition-colors">
            GitHub
          </a>
          {/* TODO: Replace # with actual Chrome Web Store URL */}
          <a href="#" className="hover:text-chrome-300 transition-colors">
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
