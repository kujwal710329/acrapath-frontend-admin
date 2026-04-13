export default function ProfileSectionCard({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-(--color-black-shade-200) bg-(--color-white) px-4 py-6 sm:px-8 sm:py-8 ${className}`}>
      {children}
    </div>
  );
}
