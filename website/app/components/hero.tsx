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
