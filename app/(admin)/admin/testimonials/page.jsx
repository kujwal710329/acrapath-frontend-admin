import TestimonialsPage from "@/components/admin-dashboard/Testimonials";

export const metadata = {
  title: "Testimonials",
};

export default function Page() {
  return (
    <div className="rounded-2xl border border-(--color-black-shade-100) bg-(--pure-white) overflow-clip">
      <TestimonialsPage />
    </div>
  );
}
