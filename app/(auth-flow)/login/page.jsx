import AuthForm from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import ClientOnly from "@/components/common/ClientOnly";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid h-full max-w-[75rem] grid-rows-[auto_1fr] px-4">
        <ClientOnly>
          <AuthHeader
            title="Credepath Admin Portal"
            description="Sign in to manage professionals, employers, job posts, and platform operations."
          />

          <div className="mx-auto w-full max-w-[33.75rem]">
            <AuthForm />
          </div>
        </ClientOnly>
      </div>
    </div>
  );
}
