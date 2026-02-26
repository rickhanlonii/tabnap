export function CTA() {
  return (
    <section className="bg-chrome-900 dark:bg-chrome-950 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to snooze some tabs?
        </h2>
        <p className="mt-4 text-lg text-chrome-400">
          Install TabNap in seconds. No account needed, no data collected, works
          offline.
        </p>
        <div className="mt-8">
          <a
            href="https://chromewebstore.google.com/detail/djoiloodageglokcnogknbkljhkdicjm?utm_source=item-share-cb"
            className="rounded-lg bg-violet-500 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-violet-600 transition-colors inline-block"
          >
            Add to Chrome — It&apos;s Free
          </a>
        </div>
      </div>
    </section>
  );
}
