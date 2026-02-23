"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, FolderOpen, Users,
  Settings, BarChart3, Tag, Menu, X, LogOut, Store
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/admin", icon: LayoutDashboard, label: "แดชบอร์ด" },
  { href: "/admin/orders", icon: ShoppingBag, label: "จัดการออเดอร์" },
  { href: "/admin/products", icon: Package, label: "จัดการสินค้า" },
  { href: "/admin/categories", icon: FolderOpen, label: "หมวดหมู่" },
  { href: "/admin/promotions", icon: Tag, label: "โปรโมชั่น" },
  { href: "/admin/drivers", icon: Users, label: "พนักงานจัดส่ง" },
  { href: "/admin/reports", icon: BarChart3, label: "รายงาน" },
  { href: "/admin/settings", icon: Settings, label: "ตั้งค่า" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-foreground">ร้านชาบ้านสวน</h1>
            <p className="text-[10px] text-muted">Admin Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.label === "จัดการออเดอร์" && (
                  <span className="ml-auto w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1"
            aria-label="เปิดเมนู"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <span className="text-sm font-medium hidden sm:block">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
