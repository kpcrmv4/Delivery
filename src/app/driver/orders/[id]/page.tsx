"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Phone, Navigation, MapPin, Camera, Check, Package, Loader2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getOrderById, updateOrderStatus, subscribeToOrderById } from "@/lib/supabase/queries";
import type { Order } from "@/types";

export default function DriverOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // Load order data
  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await getOrderById(supabase, orderId);
      if (fetchError || !data) {
        setError("ไม่พบออเดอร์นี้");
        setLoading(false);
        return;
      }
      setOrder(data);
      setStatus(data.status);
      setLoading(false);
    }

    loadOrder();
  }, [orderId, supabase]);

  // Realtime subscription for live updates
  useEffect(() => {
    if (!orderId) return;

    const channel = subscribeToOrderById(supabase, orderId, async () => {
      // Re-fetch order on any change
      const { data } = await getOrderById(supabase, orderId);
      if (data) {
        setOrder(data);
        setStatus(data.status);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  const statusFlow = [
    { key: "ready", label: "พร้อมรับ", next: "รับออเดอร์", color: "bg-green-500" },
    { key: "picked_up", label: "รับแล้ว", next: "กำลังจัดส่ง", color: "bg-blue-500" },
    { key: "delivering", label: "กำลังส่ง", next: "ส่งสำเร็จ", color: "bg-cyan-500" },
    { key: "delivered", label: "ส่งสำเร็จ", next: "", color: "bg-primary" },
  ];

  const currentIndex = statusFlow.findIndex((s) => s.key === status);
  const nextAction = statusFlow[currentIndex]?.next;

  const handleNextStatus = async () => {
    if (currentIndex < statusFlow.length - 1 && order) {
      const nextStatus = statusFlow[currentIndex + 1].key;
      setUpdating(true);
      const { error: updateError } = await updateOrderStatus(
        supabase,
        order.id,
        nextStatus,
        user?.id
      );
      if (!updateError) {
        setStatus(nextStatus);
      }
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
        <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
          <button onClick={() => router.back()} className="p-1" aria-label="กลับ">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-soft h-20 animate-pulse" />
          <div className="bg-white rounded-2xl p-4 shadow-soft h-40 animate-pulse" />
          <div className="bg-white rounded-2xl p-4 shadow-soft h-40 animate-pulse" />
          <div className="bg-white rounded-2xl p-4 shadow-soft h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
        <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
          <button onClick={() => router.back()} className="p-1" aria-label="กลับ">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">รายละเอียดงาน</h1>
        </div>
        <div className="px-4 mt-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-muted">{error || "ไม่พบออเดอร์"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  const deliveryAddress = order.delivery_address;

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.back()} className="p-1" aria-label="กลับ">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">รายละเอียดงาน</h1>
          <p className="text-xs text-muted">{order.order_number}</p>
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
            <p className="text-sm font-medium">{order.customer_name}</p>
            <p className="text-xs text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {deliveryAddress?.address_text || "-"}
            </p>
            {deliveryAddress?.note && (
              <p className="text-xs text-orange-500">📝 {deliveryAddress.note}</p>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            {order.customer_phone && (
              <a href={`tel:${order.customer_phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium">
                <Phone className="w-4 h-4" /> โทร
              </a>
            )}
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
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="font-semibold text-sm mb-3">รายการสินค้า</h3>
          {order.items.map((item, i) => (
            <div key={item.id || i} className="flex items-center gap-3 py-2">
              <span className="text-xl">📦</span>
              <div className="flex-1">
                <p className="text-sm">
                  {item.product_name}
                  {item.options && item.options.length > 0 && (
                    <span className="text-muted text-xs ml-1">
                      ({item.options.map((o) => o.choice_name).join(", ")})
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">x{item.quantity}</p>
              </div>
              <span className="text-sm font-medium">{formatPrice(item.total_price)}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 space-y-1">
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-xs text-muted">
                <span>ค่าจัดส่ง</span>
                <span>{formatPrice(order.delivery_fee)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-bold">รวม</span>
              <span className="text-sm font-bold text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
          {order.note && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
              📝 {order.note}
            </div>
          )}
          <p className="text-xs text-muted mt-2">
            💳 {order.payment_method === "promptpay" ? "พร้อมเพย์" : order.payment_method === "cash" ? "เงินสด" : "โอนเงิน"}
            {order.payment_status === "paid" ? " (ชำระแล้ว)" : " (รอชำระ)"}
          </p>
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
              disabled={updating}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-float disabled:opacity-60"
            >
              {updating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : status === "delivering" ? (
                <Check className="w-5 h-5" />
              ) : (
                <Package className="w-5 h-5" />
              )}
              {updating ? "กำลังอัพเดท..." : nextAction}
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
