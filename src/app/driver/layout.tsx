"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/driver", icon: Home, label: "หน้าหลัก" },
  { href: "/driver/orders", icon: Package, label: "งานจัดส่ง" },
  { href: "/driver/history", icon: Clock, label: "ประวัติ" },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      <main className="pb-20">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = item.href === "/driver"
              ? pathname === "/driver"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-4",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
