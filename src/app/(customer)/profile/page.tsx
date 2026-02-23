"use client";

import { User, MapPin, ClipboardList, Settings, HelpCircle, LogOut, ChevronRight, Bell, CreditCard, Gift } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { icon: ClipboardList, label: "ประวัติการสั่งซื้อ", href: "/orders", color: "text-blue-500" },
  { icon: MapPin, label: "ที่อยู่จัดส่ง", href: "/profile/addresses", color: "text-green-500" },
  { icon: CreditCard, label: "การชำระเงิน", href: "/profile/payment", color: "text-purple-500" },
  { icon: Gift, label: "โปรโมชั่นของฉัน", href: "/profile/promotions", color: "text-orange-500" },
  { icon: Bell, label: "การแจ้งเตือน", href: "/profile/notifications", color: "text-yellow-500" },
  { icon: Settings, label: "ตั้งค่า", href: "/profile/settings", color: "text-gray-500" },
  { icon: HelpCircle, label: "ช่วยเหลือ", href: "/profile/help", color: "text-cyan-500" },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark px-6 pt-8 pb-12 rounded-b-3xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="text-white">
            <h1 className="text-xl font-bold">คุณลูกค้า</h1>
            <p className="text-sm opacity-80">099-999-9999</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-6">
          <div className="flex-1 bg-white/15 backdrop-blur rounded-xl p-3 text-center text-white">
            <p className="text-xl font-bold">12</p>
            <p className="text-[10px] opacity-80">คำสั่งซื้อ</p>
          </div>
          <div className="flex-1 bg-white/15 backdrop-blur rounded-xl p-3 text-center text-white">
            <p className="text-xl font-bold">150</p>
            <p className="text-[10px] opacity-80">แต้มสะสม</p>
          </div>
          <div className="flex-1 bg-white/15 backdrop-blur rounded-xl p-3 text-center text-white">
            <p className="text-xl font-bold">3</p>
            <p className="text-[10px] opacity-80">คูปอง</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button className="w-full mt-4 bg-white rounded-2xl shadow-soft px-4 py-3.5 flex items-center gap-3 hover:bg-red-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="flex-1 text-sm font-medium text-red-500 text-left">ออกจากระบบ</span>
        </button>

        <p className="text-center text-xs text-gray-300 mt-6 pb-4">
          เวอร์ชัน 1.0.0
        </p>
      </div>
    </div>
  );
}
