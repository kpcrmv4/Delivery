"use client";

import { MapPin, Clock, Navigation, Phone } from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";

const orders = [
  {
    id: "ORD-20260223-002", customer: "คุณวิชัย", phone: "091-222-3333",
    address: "อาคาร ABC ชั้น 15 ถ.สาทร", items: "กาแฟลาเต้เย็น x3",
    total: 180, status: "ready", distance: "4.1 กม.", time: "10:45",
  },
  {
    id: "ORD-20260223-001", customer: "คุณสมศรี", phone: "089-111-2222",
    address: "123/45 หมู่บ้านสวนสวย ซ.ลาดพร้าว 71", items: "ชานมไข่มุก x2, มัทฉะลาเต้ x1",
    total: 175, status: "delivering", distance: "2.3 กม.", time: "10:30",
  },
  {
    id: "ORD-20260223-003", customer: "คุณนภา", phone: "082-333-4444",
    address: "55 ซ.สุขุมวิท 55 คลองตัน", items: "ชาเขียวมัทฉะ x1, เค้กส้ม x1",
    total: 140, status: "preparing", distance: "3.5 กม.", time: "11:00",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  preparing: { label: "กำลังเตรียม", color: "bg-yellow-100 text-yellow-700" },
  ready: { label: "พร้อมรับ", color: "bg-green-100 text-green-700" },
  delivering: { label: "กำลังส่ง", color: "bg-blue-100 text-blue-700" },
};

export default function DriverOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 shadow-sm">
        <h1 className="text-lg font-bold">งานจัดส่ง</h1>
        <p className="text-xs text-muted mt-0.5">{orders.length} งาน</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.preparing;
          return (
            <Link
              key={order.id}
              href={`/driver/orders/${order.id}`}
              className="block bg-white rounded-2xl p-4 shadow-soft"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted">{order.id}</span>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", status.color)}>
                  {status.label}
                </span>
              </div>
              <h3 className="font-semibold text-sm">{order.customer}</h3>
              <p className="text-xs text-muted mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {order.address}
              </p>
              <p className="text-xs text-muted mt-1">{order.items}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {order.distance}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`tel:${order.phone}`} className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center" onClick={(e) => e.stopPropagation()} aria-label="โทร">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </a>
                  <span className="text-sm font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
