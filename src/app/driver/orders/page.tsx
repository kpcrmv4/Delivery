"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, Clock, Phone } from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getOrders } from "@/lib/supabase/queries";
import type { Order } from "@/types";

const statusConfig: Record<string, { label: string; color: string }> = {
  preparing: { label: "กำลังเตรียม", color: "bg-yellow-100 text-yellow-700" },
  ready: { label: "พร้อมรับ", color: "bg-green-100 text-green-700" },
  delivering: { label: "กำลังส่ง", color: "bg-blue-100 text-blue-700" },
};

export default function DriverOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!user?.id) return;

    async function loadOrders() {
      setLoading(true);
      const { data } = await getOrders(supabase, {
        driverId: user!.id,
      });
      // Filter out delivered/cancelled for the active list
      const activeOrders = (data || []).filter(
        (o) => ["preparing", "ready", "delivering"].includes(o.status)
      );
      setOrders(activeOrders);
      setLoading(false);
    }

    loadOrders();
  }, [user?.id, supabase]);

  const formatItems = (order: Order) => {
    return order.items
      .map((item) => `${item.product_name} x${item.quantity}`)
      .join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 py-4 shadow-sm">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1" />
        </div>
        <div className="px-4 mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-soft h-36 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

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
                <span className="text-xs font-mono text-muted">{order.order_number}</span>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", status.color)}>
                  {status.label}
                </span>
              </div>
              <h3 className="font-semibold text-sm">{order.customer_name}</h3>
              <p className="text-xs text-muted mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {order.delivery_address?.address_text || "-"}
              </p>
              <p className="text-xs text-muted mt-1">{formatItems(order)}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {order.customer_phone && (
                    <a href={`tel:${order.customer_phone}`} className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center" onClick={(e) => e.stopPropagation()} aria-label="โทร">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                    </a>
                  )}
                  <span className="text-sm font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </Link>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">ไม่มีงานจัดส่งในขณะนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
