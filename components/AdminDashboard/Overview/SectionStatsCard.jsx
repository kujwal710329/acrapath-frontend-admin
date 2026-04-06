export default function SectionStatsCard({ title, stats }) {
  return (
    <div className="rounded-2xl border border-(--color-black-shade-100) bg-(--color-bg-primary) px-6 py-7">
      <p className="text-14 font-bold text-(--color-black) mb-6">{title}</p>
      <div className="flex justify-between gap-x-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-3">
            <p className="text-12 text-(--color-black-shade-400) font-normal whitespace-nowrap">
              {stat.label}
            </p>
            <p className="text-18 font-bold text-(--color-black)">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
