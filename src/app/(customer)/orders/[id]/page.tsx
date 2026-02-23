"use client";

import { ArrowLeft, Phone, MapPin, Check, Clock, ChefHat, Truck, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice, cn } from "@/lib/utils";

const statusSteps = [
  { key: "pending", label: "สั่งซื้อแล้ว", icon: Clock, time: "10:30" },
  { key: "confirmed", label: "ร้านค้ายืนยัน", icon: Check, time: "10:32" },
  { key: "preparing", label: "กำลังเตรียม", icon: ChefHat, time: "10:33" },
  { key: "delivering", label: "กำลังจัดส่ง", icon: Truck, time: "" },
  { key: "delivered", label: "ส่งสำเร็จ", icon: PackageCheck, time: "" },
];

const currentStatus: string = "preparing";

const orderDetail = {
  id: "ORD-20260223-001",
  items: [
    { name: "ชานมไข่มุก (M, หวาน 75%)", quantity: 2, price: 110, emoji: "🧋" },
    { name: "มัทฉะลาเต้ (L)", quantity: 1, price: 65, emoji: "🍵" },
  ],
  subtotal: 175,
  delivery_fee: 0,
  discount: 0,
  total: 175,
  payment_method: "พร้อมเพย์",
  address: "123/45 หมู่บ้านสวนสวย ซ.ลาดพร้าว 71",
  driver: {
    name: "สมชาย ดีมาก",
    phone: "089-123-4567",
    avatar: "🧑‍💼",
  },
  estimated_time: "15-20 นาที",
};

export default function OrderDetailPage() {
  const router = useRouter();
  const currentStepIndex = statusSteps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-white" aria-label="กลับ">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-white">
          <h1 className="text-lg font-bold">ติดตามออเดอร์</h1>
          <p className="text-xs opacity-80">{orderDetail.id}</p>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">ถึงโดยประมาณ</p>
              <p className="text-xs text-primary font-bold">{orderDetail.estimated_time}</p>
            </div>
          </div>

          <div className="relative pl-8">
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="relative pb-6 last:pb-0">
                  {/* Connector line */}
                  {i < statusSteps.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-[-20px] top-8 w-0.5 h-full",
                        i < currentStepIndex ? "bg-primary" : "bg-gray-200"
                      )}
                    />
                  )}

                  {/* Step dot */}
                  <div
                    className={cn(
                      "absolute left-[-26px] top-1 w-3 h-3 rounded-full border-2",
                      isCompleted
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", isCompleted ? "text-primary" : "text-gray-300")} />
                      <span className={cn(
                        "text-sm",
                        isCurrent ? "font-bold text-primary" : isCompleted ? "font-medium" : "text-muted"
                      )}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium animate-pulse">
                          ตอนนี้
                        </span>
                      )}
                    </div>
                    {step.time && (
                      <span className="text-xs text-muted">{step.time}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Driver Info */}
      {(currentStatus === "delivering" || currentStatus === "preparing") && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <h3 className="font-semibold text-sm mb-3">พนักงานจัดส่ง</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center text-2xl">
                {orderDetail.driver.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{orderDetail.driver.name}</p>
                <p className="text-xs text-muted">{orderDetail.driver.phone}</p>
              </div>
              <a
                href={`tel:${orderDetail.driver.phone}`}
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"
                aria-label="โทรหาพนักงาน"
              >
                <Phone className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            ที่อยู่จัดส่ง
          </h3>
          <p className="text-sm text-muted">{orderDetail.address}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="font-semibold text-sm mb-3">รายการสั่งซื้อ</h3>
          <div className="space-y-3">
            {orderDetail.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted">x{item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>

          <div className="border-t mt-3 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted">
              <span>ค่าสินค้า</span>
              <span>{formatPrice(orderDetail.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>ค่าจัดส่ง</span>
              <span className="text-green-600">ฟรี</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>ยอดรวม</span>
              <span className="text-primary">{formatPrice(orderDetail.total)}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-muted">
            ชำระเงินผ่าน: {orderDetail.payment_method}
          </div>
        </div>
      </div>
    </div>
  );
}
