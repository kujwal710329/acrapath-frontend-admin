export default function StatCard({ label, value }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl border border-(--color-black-shade-100) bg-(--color-bg-primary) px-8 py-10 flex flex-col items-center justify-center gap-6 min-h-50">
      <p className="text-14 text-(--color-black-shade-500) font-normal text-center">{label}</p>
      <p className="text-32 font-bold text-black leading-none text-center">
        {value}
      </p>
    </div>
  );
}
