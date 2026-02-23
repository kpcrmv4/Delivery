"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Navigation, MapPin, Camera, Check, Package } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

const order = {
  id: "ORD-20260223-002",
  customer: "คุณวิชัย",
  phone: "091-222-3333",
  address: "อาคาร ABC ชั้น 15 ถ.สาทร กรุงเทพฯ 10120",
  address_note: "ลิฟต์ฝั่งซ้าย ขึ้นชั้น 15",
  items: [
    { name: "กาแฟลาเต้เย็น (L, หวาน 50%)", qty: 2, price: 140, emoji: "☕" },
    { name: "กาแฟลาเต้เย็น (M, หวานปกติ)", qty: 1, price: 60, emoji: "☕" },
  ],
  total: 200,
  delivery_fee: 20,
  payment: "พร้อมเพย์ (ชำระแล้ว)",
  note: "ฝากไว้ที่เคาน์เตอร์ ชั้น 15",
  distance: "4.1 กม.",
  status: "ready",
};

export default function DriverOrderDetailPage() {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);

  const statusFlow = [
    { key: "ready", label: "พร้อมรับ", next: "รับออเดอร์", color: "bg-green-500" },
    { key: "picked_up", label: "รับแล้ว", next: "กำลังจัดส่ง", color: "bg-blue-500" },
    { key: "delivering", label: "กำลังส่ง", next: "ส่งสำเร็จ", color: "bg-cyan-500" },
    { key: "delivered", label: "ส่งสำเร็จ", next: "", color: "bg-primary" },
  ];

  const currentIndex = statusFlow.findIndex((s) => s.key === status);
  const nextAction = statusFlow[currentIndex]?.next;

  const handleNextStatus = () => {
    if (currentIndex < statusFlow.length - 1) {
      setStatus(statusFlow[currentIndex + 1].key);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.back()} className="p-1" aria-label="กลับ">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">รายละเอียดงาน</h1>
          <p className="text-xs text-muted">{order.id}</p>
        </div>
      </div>

      {/* Status Progress */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <div className="flex justify-between">
            {statusFlow.map((s, i) => (
              <div key={s.key} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                  i <= currentIndex ? s.color : "bg-gray-200"
                )}>
                  {i <= currentIndex ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-[10px] mt-1 text-center", i <= currentIndex ? "text-foreground font-medium" : "text-muted")}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="font-semibold text-sm mb-3">ข้อมูลลูกค้า</h3>
          <div className="space-y-2">
            <p className="text-sm font-medium">{order.customer}</p>
            <p className="text-xs text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {order.address}
            </p>
            {order.address_note && (
              <p className="text-xs text-orange-500">📝 {order.address_note}</p>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <a href={`tel:${order.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium">
              <Phone className="w-4 h-4" /> โทร
            </a>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium">
              <Navigation className="w-4 h-4" /> นำทาง
            </button>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
          <div className="h-40 bg-gradient-to-br from-mint-100 to-mint-200 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto" />
              <p className="text-xs text-muted mt-1">แผนที่นำทาง</p>
              <p className="text-xs font-medium text-primary mt-0.5">{order.distance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="font-semibold text-sm mb-3">รายการสินค้า</h3>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm">{item.name}</p>
                <p className="text-xs text-muted">x{item.qty}</p>
              </div>
              <span className="text-sm font-medium">{formatPrice(item.price)}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between">
            <span className="text-sm font-bold">รวม</span>
            <span className="text-sm font-bold text-primary">{formatPrice(order.total)}</span>
          </div>
          {order.note && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
              📝 {order.note}
            </div>
          )}
          <p className="text-xs text-muted mt-2">💳 {order.payment}</p>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-bottom z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          {status === "delivering" && (
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-foreground rounded-xl text-sm font-medium">
              <Camera className="w-5 h-5" /> ถ่ายรูป
            </button>
          )}
          {nextAction && (
            <button
              onClick={handleNextStatus}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-float"
            >
              {status === "delivering" ? <Check className="w-5 h-5" /> : <Package className="w-5 h-5" />}
              {nextAction}
            </button>
          )}
          {status === "delivered" && (
            <div className="flex-1 bg-green-100 text-green-700 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2">
              <Check className="w-5 h-5" /> ส่งสำเร็จแล้ว!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
