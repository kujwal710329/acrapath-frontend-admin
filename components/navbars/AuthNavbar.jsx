import Image from "next/image";
import Link from "next/link";

export default function AuthNavbar() {
  return (
    <header className="w-full py-6">
      <div className="mx-auto max-w-[75rem] px-4">
        <Link href="/">
          <Image
            src="/static/Icons/Logo_credpath.svg"
            alt="Credepath"
            width={140}
            height={32}
            priority
          />
        </Link>
      </div>
    </header>
  );
}
