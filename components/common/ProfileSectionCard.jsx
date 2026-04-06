export default function ProfileSectionCard({ children }) {
  return (
    <div className="rounded-2xl border border-(--color-black-shade-200) bg-white px-4 py-6 sm:px-12 sm:py-14">
      {children}
    </div>
  );
}
