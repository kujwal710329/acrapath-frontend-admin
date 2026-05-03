import LibraryPage from "@/components/admin-dashboard/Library";

export const metadata = {
  title: "Library",
};

export default function Page() {
  return (
    <div className="rounded-2xl border border-(--color-black-shade-100) bg-(--pure-white) overflow-clip">
      <LibraryPage />
    </div>
  );
}
