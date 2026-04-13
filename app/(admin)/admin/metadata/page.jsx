import MetadataPage from "@/components/AdminDashboard/Metadata";

export const metadata = {
  title: "Metadata Management",
};

export default function Page() {
  return (
    <div className="rounded-2xl border border-(--color-black-shade-100) bg-(--pure-white) overflow-clip">
      <MetadataPage />
    </div>
  );
}
