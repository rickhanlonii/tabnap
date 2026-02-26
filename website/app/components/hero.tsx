export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-chrome-900 pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-8 flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="h-20 w-20 text-violet-500"
            aria-label="TabNap icon"
          >
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
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-chrome-900 dark:text-white sm:text-6xl">
          Give your tabs a little nap
        </h1>
        <p className="mt-6 text-lg leading-8 text-chrome-600 dark:text-chrome-400 max-w-2xl mx-auto">
          Close tabs now, they reopen later — automatically, at the time you
          choose. Free, and no account required.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-4">
          <a
            href="https://chromewebstore.google.com/detail/djoiloodageglokcnogknbkljhkdicjm?utm_source=item-share-cb"
            className="rounded-lg bg-violet-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-violet-600 transition-colors"
          >
            Add to Chrome — It&apos;s Free
          </a>
        </div>
        <p className="mt-4 text-sm text-chrome-500 dark:text-chrome-400">
          Available on the Chrome Web Store
        </p>
      </div>
    </section>
  );
}
