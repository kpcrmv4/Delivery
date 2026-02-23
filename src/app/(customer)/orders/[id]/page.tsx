"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Phone, MapPin, Check, Clock, ChefHat, Truck, PackageCheck } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOrderById, subscribeToOrderById } from "@/lib/supabase/queries";
import { formatPrice, cn } from "@/lib/utils";
import type { Order } from "@/types";

const statusSteps = [
  { key: "pending", label: "สั่งซื้อแล้ว", icon: Clock },
  { key: "confirmed", label: "ร้านค้ายืนยัน", icon: Check },
  { key: "preparing", label: "กำลังเตรียม", icon: ChefHat },
  { key: "delivering", label: "กำลังจัดส่ง", icon: Truck },
  { key: "delivered", label: "ส่งสำเร็จ", icon: PackageCheck },
];

const paymentMethodLabels: Record<string, string> = {
  promptpay: "พร้อมเพย์",
  transfer: "โอนเงิน",
  cash: "เงินสด",
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function loadOrder() {
      setIsLoading(true);
      const { data, error: fetchError } = await getOrderById(supabase, orderId);

      if (fetchError || !data) {
        setError("ไม่พบคำสั่งซื้อ");
        setIsLoading(false);
        return;
      }

      setOrder(data);
      setIsLoading(false);
    }

    loadOrder();

    // Subscribe to real-time updates
    const channel = subscribeToOrderById(supabase, orderId, async () => {
      // Re-fetch the order when it changes
      const { data } = await getOrderById(supabase, orderId);
      if (data) setOrder(data);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
        <div className="bg-gradient-to-r from-primary to-primary-dark px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 text-white" aria-label="กลับ">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-white">
            <h1 className="text-lg font-bold">ติดตามออเดอร์</h1>
            <div className="w-32 h-3 bg-white/30 rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-soft space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-32 h-4 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-soft space-y-3">
            <div className="w-24 h-4 bg-gray-200 animate-pulse rounded" />
            <div className="w-full h-3 bg-gray-200 animate-pulse rounded" />
            <div className="w-2/3 h-3 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col items-center justify-center p-8">
        <span className="text-5xl mb-4">😕</span>
        <h2 className="text-lg font-semibold">{error || "ไม่พบคำสั่งซื้อ"}</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-semibold"
        >
          กลับ
        </button>
      </div>
    );
  }

  const currentStatus = order.status;
  const currentStepIndex = statusSteps.findIndex((s) => s.key === currentStatus);
  const deliveryAddress = order.delivery_address as { address_text?: string } | null;
  const driver = order.driver;

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-white" aria-label="กลับ">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-white">
          <h1 className="text-lg font-bold">ติดตามออเดอร์</h1>
          <p className="text-xs opacity-80">{order.order_number}</p>
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
              <p className="text-xs text-primary font-bold">15-20 นาที</p>
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Driver Info */}
      {driver && (currentStatus === "delivering" || currentStatus === "preparing") && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <h3 className="font-semibold text-sm mb-3">พนักงานจัดส่ง</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center text-2xl">
                {driver.avatar_url || "🧑‍💼"}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{driver.name}</p>
                <p className="text-xs text-muted">{driver.phone}</p>
              </div>
              <a
                href={`tel:${driver.phone}`}
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
      {deliveryAddress?.address_text && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              ที่อยู่จัดส่ง
            </h3>
            <p className="text-sm text-muted">{deliveryAddress.address_text}</p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="font-semibold text-sm mb-3">รายการสั่งซื้อ</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-2xl">{item.product_image || "☕"}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted">x{item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.total_price)}</span>
              </div>
            ))}
          </div>

          <div className="border-t mt-3 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted">
              <span>ค่าสินค้า</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>ค่าจัดส่ง</span>
              <span className={order.delivery_fee === 0 ? "text-green-600" : ""}>
                {order.delivery_fee === 0 ? "ฟรี" : formatPrice(order.delivery_fee)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>ส่วนลด</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>ยอดรวม</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-muted">
            ชำระเงินผ่าน: {paymentMethodLabels[order.payment_method] || order.payment_method}
          </div>
        </div>
      </div>
    </div>
  );
}
