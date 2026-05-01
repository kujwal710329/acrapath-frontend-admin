export const metadata = { title: "Professionals" };

import ProfessionalsPage from "@/components/admin-dashboard/Professionals";

export default function Page() {
  return (
    <div className="rounded-2xl border border-(--color-black-shade-100) bg-(--pure-white) overflow-clip">
      <ProfessionalsPage />
    </div>
  );
}
