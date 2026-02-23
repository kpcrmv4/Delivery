"use client";

import { useState } from "react";
import { Package, MapPin, Clock, Navigation, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";

export default function DriverDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);

  const activeOrders = [
    {
      id: "ORD-20260223-001",
      customer: "คุณสมศรี",
      address: "123/45 หมู่บ้านสวนสวย ซ.ลาดพร้าว 71",
      phone: "089-111-2222",
      items: "ชานมไข่มุก x2, มัทฉะลาเต้ x1",
      total: 175,
      status: "preparing",
      distance: "2.3 กม.",
      time: "10:30",
    },
    {
      id: "ORD-20260223-002",
      customer: "คุณวิชัย",
      address: "อาคาร ABC ชั้น 15 ถ.สาทร",
      phone: "091-222-3333",
      items: "กาแฟลาเต้เย็น x3",
      total: 180,
      status: "ready",
      distance: "4.1 กม.",
      time: "10:45",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <h1 className="text-lg font-bold">สวัสดี, สมชาย</h1>
            <p className="text-sm opacity-80">พนักงานจัดส่ง</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl">
            🧑‍💼
          </div>
        </div>

        {/* Status Toggle */}
        <div className="bg-white/15 backdrop-blur rounded-2xl p-4 flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium">สถานะ</p>
            <p className="text-xs opacity-80">
              {isAvailable ? "พร้อมรับงาน" : "ปิดรับงาน"}
            </p>
          </div>
          <div
            onClick={() => setIsAvailable(!isAvailable)}
            className={cn(
              "w-14 h-7 rounded-full transition-colors relative cursor-pointer",
              isAvailable ? "bg-green-400" : "bg-white/30"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform shadow",
                isAvailable ? "translate-x-7" : "translate-x-0.5"
              )}
            />
          </div>
        </div>
      </div>

      {/* Today Stats */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "งานวันนี้", value: "12", icon: Package },
            { label: "ระยะทาง", value: "28 กม.", icon: MapPin },
            { label: "รายได้", value: "฿360", icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-3 shadow-soft text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Orders */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          งานที่ต้องจัดส่ง ({activeOrders.length})
        </h2>
        <div className="space-y-3">
          {activeOrders.map((order) => (
            <Link
              key={order.id}
              href={`/driver/orders/${order.id}`}
              className="block bg-white rounded-2xl p-4 shadow-soft border border-primary/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted">{order.id}</span>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  order.status === "ready"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                )}>
                  {order.status === "ready" ? "พร้อมรับ" : "กำลังเตรียม"}
                </span>
              </div>
              <h3 className="font-semibold text-sm">{order.customer}</h3>
              <p className="text-xs text-muted mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {order.address}
              </p>
              <p className="text-xs text-muted mt-1">{order.items}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> {order.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {order.time}
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {activeOrders.length === 0 && (
        <div className="px-4 mt-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold">ยังไม่มีงาน</p>
          <p className="text-sm text-muted mt-1">รอรับงานจัดส่งจากร้านค้า</p>
        </div>
      )}
    </div>
  );
}
