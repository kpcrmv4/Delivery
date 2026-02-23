"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Package,
  BarChart3,
  Loader2,
} from "lucide-react";
import { cn, formatPrice, getOrderStatusText, getOrderStatusColor } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getDashboardStats, getOrders, getShopId, subscribeToOrders } from "@/lib/supabase/queries";
import type { Order } from "@/types";

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} ชม.ที่แล้ว`;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const shopId = getShopId();

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [statsResult, ordersResult] = await Promise.all([
      getDashboardStats(supabase, shopId),
      getOrders(supabase, { shopId, limit: 5 }),
    ]);

    setStats({
      ordersToday: statsResult.ordersToday,
      revenueToday: statsResult.revenueToday,
      pendingOrders: statsResult.pendingOrders,
    });

    if (ordersResult.data) {
      setRecentOrders(ordersResult.data);
    }

    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!shopId) return;
    const supabase = createClient();
    const channel = subscribeToOrders(supabase, shopId, () => {
      fetchData();
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, fetchData]);

  const today = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statsCards = [
    {
      label: "รายได้วันนี้",
      value: formatPrice(stats.revenueToday),
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "ออเดอร์วันนี้",
      value: String(stats.ordersToday),
      icon: ShoppingBag,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "รอดำเนินการ",
      value: String(stats.pendingOrders),
      icon: Clock,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "อัตราสำเร็จ",
      value: stats.ordersToday > 0 ? `${Math.round(((stats.ordersToday - stats.pendingOrders) / stats.ordersToday) * 100)}%` : "0%",
      icon: TrendingUp,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          สวัสดี, แอดมิน 👋
        </h1>
        <p className="text-muted text-sm mt-1">{today}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-soft p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  card.iconBg
                )}
              >
                <card.icon className={cn("w-5 h-5", card.iconColor)} />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-foreground">
            ออเดอร์ล่าสุด
          </h2>
          <a
            href="/admin/orders"
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          >
            ดูทั้งหมด
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm">ยังไม่มีออเดอร์</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-muted text-xs">
                    <th className="text-left px-5 py-3 font-medium">เลขออเดอร์</th>
                    <th className="text-left px-5 py-3 font-medium">ลูกค้า</th>
                    <th className="text-center px-5 py-3 font-medium">รายการ</th>
                    <th className="text-right px-5 py-3 font-medium">ยอดรวม</th>
                    <th className="text-center px-5 py-3 font-medium">สถานะ</th>
                    <th className="text-right px-5 py-3 font-medium">เวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {order.order_number}
                      </td>
                      <td className="px-5 py-3 text-gray-700">{order.customer_name}</td>
                      <td className="px-5 py-3 text-center text-gray-600">
                        {order.items?.length || 0} รายการ
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-foreground">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            getOrderStatusColor(order.status)
                          )}
                        >
                          {getOrderStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(order.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-5 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {order.order_number}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                        getOrderStatusColor(order.status)
                      )}
                    >
                      {getOrderStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{order.customer_name}</span>
                    <span>{order.items?.length || 0} รายการ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(order.total)}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(order.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <a
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shadow-soft"
        >
          <Package className="w-4 h-4" />
          รับออเดอร์ใหม่
        </a>
        <a
          href="/admin/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-foreground rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-soft border border-gray-100"
        >
          <ShoppingBag className="w-4 h-4" />
          จัดการสินค้า
        </a>
        <a
          href="/admin/reports"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-foreground rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-soft border border-gray-100"
        >
          <BarChart3 className="w-4 h-4" />
          ดูรายงาน
        </a>
      </div>
    </div>
  );
}
