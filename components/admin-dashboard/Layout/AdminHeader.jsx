"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { IoReorderThreeOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { MdRefresh } from "react-icons/md";
import { useAdminSidebar } from "@/context/AdminSidebarContext";
import { ADMIN_MENU } from "@/utilities/config";

function AdminUserMenu({ onClose }) {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
    onClose();
    router.push("/login");
  };

  return (
    <div className="absolute right-0 top-[calc(100%+0.5rem)] w-44 rounded-xl border border-(--color-black-shade-100) bg-(--pure-white) shadow-[0_8px_24px_rgba(0,0,0,0.10)] py-1.5 z-50">
      <button
        onClick={handleSignOut}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 cursor-pointer text-14 text-(--color-red) hover:bg-red-50 transition-colors"
      >
        <IoIosLogOut size={18} />
        Sign out
      </button>
    </div>
  );
}

export default function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { setSidebarOpen } = useAdminSidebar();
  const pathname = usePathname();

  const pageTitle =
    ADMIN_MENU.find((item) => pathname.startsWith(item.href))?.name ?? "";

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("admin-refresh"));
  };

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 right-0 left-0 h-18 z-40 bg-(--pure-white) border-b border-(--color-black-shade-100)">
      <div className="flex h-full items-center gap-3 px-4 lg:px-6">
        {/* Mobile: hamburger */}
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="lg:hidden text-3xl hover:bg-(--color-black-shade-50) cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg transition text-(--color-black-shade-800)"
          aria-label="Open menu"
        >
          <IoReorderThreeOutline />
        </button>

        {/*
          Desktop: invisible spacer that mirrors the sidebar width so the title
          starts right after the sidebar.
          Sidebar = w-42 (10.5rem). Header px = lg:px-6 (1.5rem).
          Spacer = 10.5rem − 1.5rem = 9rem = w-36.
        */}
        <div className="hidden lg:block w-36 shrink-0" aria-hidden="true" />

        {/* Page title + refresh (desktop) */}
        {pageTitle && (
          <div className="hidden lg:flex items-center gap-2">
            <h1 className="text-lg font-bold text-(--color-black-shade-800) leading-none">
              {pageTitle}
            </h1>
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-(--color-black-shade-100) transition-colors text-(--color-black-shade-500) cursor-pointer"
              aria-label={`Refresh ${pageTitle}`}
            >
              <MdRefresh size={17} />
            </button>
          </div>
        )}

        {/* Push right controls to the far right */}
        <div className="flex-1" />

        {/* Right: search + avatar */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-black-shade-400)"
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search here"
              className="h-10 w-55 rounded-full border border-(--color-black-shade-200) bg-(--pure-white) pl-9 pr-4 text-14 text-(--color-black-shade-600) outline-none focus:border-(--color-primary) transition-colors"
            />
          </div>

          {/* Avatar + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-full p-1 hover:bg-(--color-black-shade-50) transition-colors cursor-pointer"
              aria-label="Admin menu"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <div className="h-9 w-9 rounded-full bg-(--color-black-shade-400) flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <svg
                className={`transition-transform duration-200 text-(--color-black-shade-600) ${menuOpen ? "rotate-180" : ""}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {menuOpen && <AdminUserMenu onClose={() => setMenuOpen(false)} />}
          </div>
        </div>
      </div>
    </header>
  );
}
