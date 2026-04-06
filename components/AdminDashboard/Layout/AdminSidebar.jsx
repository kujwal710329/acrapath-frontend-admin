"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_MENU } from "@/utilities/config";
import { useAdminSidebar } from "@/context/AdminSidebarContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdminSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-70 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-80 h-full w-42 bg-(--pure-white)
          border-r border-(--color-black-shade-100)
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-18 items-center justify-center border-b border-(--color-black-shade-100)">
          <div
            className="h-10 w-28 rounded bg-(--color-black-shade-200)"
            role="img"
            aria-label="Admin logo"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 overflow-y-auto">
          {ADMIN_MENU.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-6 py-4.5
                  border-b border-(--color-black-shade-100)
                  text-14 font-bold
                  transition-colors duration-150
                  ${
                    isActive
                      ? "bg-(--color-primary-shade-100) text-black"
                      : "text-black hover:bg-(--color-black-shade-50)"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
