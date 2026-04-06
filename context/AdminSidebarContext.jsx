"use client";

import { createContext, useContext, useState } from "react";

const AdminSidebarContext = createContext(null);

export function AdminSidebarProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminSidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}
