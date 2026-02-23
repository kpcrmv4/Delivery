"use client";

import { useState, useEffect, useMemo } from "react";
import { Package, MapPin, Clock, Navigation, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getOrders, updateProfile } from "@/lib/supabase/queries";
import type { Order } from "@/types";

export default function DriverDashboard() {
  const { user, profile } = useAuthStore();
  const [isAvailable, setIsAvailable] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Load driver availability from profile
  useEffect(() => {
    if (profile) {
      // default to true if not set
      setIsAvailable(profile.role === "driver");
    }
  }, [profile]);

  // Load active orders assigned to driver
  useEffect(() => {
    if (!user?.id) return;

    async function loadOrders() {
      setLoading(true);
      const { data } = await getOrders(supabase, {
        driverId: user!.id,
        status: ["ready", "delivering"],
      });
      setOrders(data || []);
      setLoading(false);
    }

    loadOrders();
  }, [user?.id, supabase]);

  // Count delivered today
  const todayStr = new Date().toISOString().split("T")[0];
  const deliveredToday = useMemo(() => {
    // We'll fetch delivered orders count separately
    return 0;
  }, []);

  const [stats, setStats] = useState({ deliveredToday: 0, totalEarnings: 0 });

  useEffect(() => {
    if (!user?.id) return;

    async function loadStats() {
      const todayStart = `${todayStr}T00:00:00`;
      const todayEnd = `${todayStr}T23:59:59`;

      const { data } = await getOrders(supabase, {
        driverId: user!.id,
        status: "delivered",
      });

      const todayDelivered = (data || []).filter((o) => {
        const created = o.created_at?.split("T")[0];
        return created === todayStr;
      });

      setStats({
        deliveredToday: todayDelivered.length,
        totalEarnings: todayDelivered.length * 30, // 30 THB per delivery
      });
    }

    loadStats();
  }, [user?.id, supabase, todayStr]);

  const handleToggleAvailability = async () => {
    const newValue = !isAvailable;
    setIsAvailable(newValue);
    if (user?.id) {
      await updateProfile(supabase, user.id, {
        role: "driver",
      } as never);
    }
  };

  // Format items summary from order
  const formatItems = (order: Order) => {
    return order.items
      .map((item) => `${item.product_name} x${item.quantity}`)
      .join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-primary to-primary-dark px-4 pt-6 pb-8 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white">
              <div className="h-5 w-32 bg-white/20 rounded animate-pulse mb-1" />
              <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full animate-pulse" />
          </div>
          <div className="bg-white/15 backdrop-blur rounded-2xl p-4 h-16 animate-pulse" />
        </div>
        <div className="px-4 -mt-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-3 shadow-soft h-20 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="px-4 mt-6 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-soft h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const driverName = profile?.full_name || "พนักงานจัดส่ง";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <h1 className="text-lg font-bold">สวัสดี, {driverName}</h1>
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
            onClick={handleToggleAvailability}
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
            { label: "งานวันนี้", value: String(stats.deliveredToday + orders.length), icon: Package },
            { label: "ส่งแล้ว", value: String(stats.deliveredToday), icon: MapPin },
            { label: "รายได้", value: formatPrice(stats.totalEarnings), icon: TrendingUp },
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
          งานที่ต้องจัดส่ง ({orders.length})
        </h2>
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/driver/orders/${order.id}`}
              className="block bg-white rounded-2xl p-4 shadow-soft border border-primary/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted">{order.order_number}</span>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  order.status === "ready"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                )}>
                  {order.status === "ready" ? "พร้อมรับ" : "กำลังส่ง"}
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
                <span className="text-sm font-bold text-primary">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 && (
        <div className="px-4 mt-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold">ยังไม่มีงาน</p>
          <p className="text-sm text-muted mt-1">รอรับงานจัดส่งจากร้านค้า</p>
        </div>
      )}
    </div>
  );
}
