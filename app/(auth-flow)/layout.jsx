import AuthNavbar from "@/components/navbars/AuthNavbar";


export default function AuthLayout({ children }) {
  return (
    <>
       <AuthNavbar />

      <main className="mx-auto w-full max-w-[75rem] px-4">
        {children}
      </main>
    </>
  );
}