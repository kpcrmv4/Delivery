"use client";

import { MapPin, Check, X } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

const deliveries = [
  { id: "ORD-20260223-001", customer: "คุณสมศรี", address: "หมู่บ้านสวนสวย ลาดพร้าว 71", total: 175, status: "delivered", distance: "2.3 กม.", time: "10:30", date: "วันนี้" },
  { id: "ORD-20260222-012", customer: "คุณมานี", address: "คอนโด The Line สุขุมวิท", total: 220, status: "delivered", distance: "3.8 กม.", time: "14:20", date: "เมื่อวาน" },
  { id: "ORD-20260222-008", customer: "คุณพิชัย", address: "ออฟฟิศ สีลม", total: 350, status: "delivered", distance: "5.2 กม.", time: "12:00", date: "เมื่อวาน" },
  { id: "ORD-20260222-005", customer: "คุณนิดา", address: "หมู่บ้านเสนา ลาดพร้าว", total: 155, status: "cancelled", distance: "1.5 กม.", time: "09:30", date: "เมื่อวาน" },
  { id: "ORD-20260221-020", customer: "คุณสมปอง", address: "ตลาดนัดจตุจักร", total: 480, status: "delivered", distance: "7.0 กม.", time: "16:45", date: "21 ก.พ." },
];

export default function DriverHistoryPage() {
  const delivered = deliveries.filter((d) => d.status === "delivered").length;
  const totalEarning = delivered * 30;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 shadow-sm">
        <h1 className="text-lg font-bold">ประวัติการจัดส่ง</h1>
      </div>

      {/* Summary */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-4 text-white">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold">{deliveries.length}</p>
              <p className="text-[10px] opacity-80">งานทั้งหมด</p>
            </div>
            <div>
              <p className="text-xl font-bold">{delivered}</p>
              <p className="text-[10px] opacity-80">สำเร็จ</p>
            </div>
            <div>
              <p className="text-xl font-bold">{formatPrice(totalEarning)}</p>
              <p className="text-[10px] opacity-80">รายได้</p>
            </div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="px-4 mt-4 space-y-3">
        {deliveries.map((d) => (
          <div key={d.id} className={cn("bg-white rounded-2xl p-4 shadow-soft", d.status === "cancelled" && "opacity-60")}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted">{d.id}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted">{d.date} {d.time}</span>
                {d.status === "delivered" ? (
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </span>
                ) : (
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-red-500" />
                  </span>
                )}
              </div>
            </div>
            <h3 className="text-sm font-medium">{d.customer}</h3>
            <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {d.address}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-muted">
              <span>{d.distance}</span>
              <span className="font-bold text-sm text-foreground">{formatPrice(d.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
