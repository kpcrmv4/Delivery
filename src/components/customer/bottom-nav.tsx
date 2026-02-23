"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, ShoppingBag, ClipboardList, User } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "หน้าหลัก" },
  { href: "/favorites", icon: Heart, label: "ที่ชอบ" },
  { href: "/cart", icon: ShoppingBag, label: "ตะกร้า", isCenter: true },
  { href: "/orders", icon: ClipboardList, label: "คำสั่งซื้อ" },
  { href: "/profile", icon: User, label: "โปรไฟล์" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const getItemCount = useCartStore((s) => s.getItemCount);
  const itemCount = getItemCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6"
                aria-label={item.label}
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-float">
                  <Icon className="w-6 h-6 text-white" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-primary font-medium block text-center mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 transition-colors",
                isActive ? "text-primary" : "text-gray-400"
              )}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
