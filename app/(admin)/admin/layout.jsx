"use client";

import AdminSidebar from "@/components/admin-dashboard/Layout/AdminSidebar";
import AdminHeader from "@/components/admin-dashboard/Layout/AdminHeader";
import { AdminSidebarProvider } from "@/context/AdminSidebarContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ClientOnly from "@/components/common/ClientOnly";

function AdminLayoutInner({ children }) {
  return (
    <div className="min-h-screen bg-(--pure-white)">
      <AdminSidebar />
      <AdminHeader />

      {/* Content offset: sidebar w-42 (10.5rem) + header h-18 (4.5rem) */}
      <div className="lg:ml-42 pt-18">
        <main className="px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <ErrorBoundary>
      <ClientOnly>
        <AdminSidebarProvider>
          <AdminLayoutInner>{children}</AdminLayoutInner>
        </AdminSidebarProvider>
      </ClientOnly>
    </ErrorBoundary>
  );
}
