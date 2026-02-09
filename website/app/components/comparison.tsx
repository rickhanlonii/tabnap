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
