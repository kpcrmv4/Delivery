"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ChevronRight, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { getOrders } from "@/lib/supabase/queries";
import { formatPrice, formatDateTime, getOrderStatusText, getOrderStatusColor, cn } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading: authLoading, initialize } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const supabase = createClient();

    async function loadOrders() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data } = await getOrders(supabase, { customerId: user.id });
      if (data) setOrders(data);
      setIsLoading(false);
    }

    if (!authLoading) {
      loadOrders();
    }
  }, [user?.id, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white px-4 py-4 shadow-sm">
          <h1 className="text-lg font-bold">คำสั่งซื้อ</h1>
        </div>
        <div className="px-4 mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-soft space-y-3">
              <div className="flex justify-between">
                <div className="w-32 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="w-20 h-5 bg-gray-200 animate-pulse rounded-full" />
              </div>
              <div className="w-full h-3 bg-gray-200 animate-pulse rounded" />
              <div className="w-2/3 h-3 bg-gray-200 animate-pulse rounded" />
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <div className="w-24 h-3 bg-gray-200 animate-pulse rounded" />
                <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white px-4 py-4 shadow-sm">
          <h1 className="text-lg font-bold">คำสั่งซื้อ</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-12">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="font-semibold text-lg">กรุณาเข้าสู่ระบบ</h3>
          <p className="text-sm text-muted mt-1">เข้าสู่ระบบเพื่อดูคำสั่งซื้อของคุณ</p>
          <Link
            href="/auth/login"
            className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );
  const pastOrders = orders.filter(
    (o) => ["delivered", "cancelled"].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <h1 className="text-lg font-bold">คำสั่งซื้อ</h1>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="px-4 mt-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            กำลังดำเนินการ
          </h2>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-2xl p-4 shadow-soft border border-primary/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted">{order.order_number}</span>
                  <span className={cn(
                    "text-[10px] font-semibold px-2.5 py-1 rounded-full",
                    getOrderStatusColor(order.status)
                  )}>
                    {getOrderStatusText(order.status)}
                  </span>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-sm">
                      {item.product_name} x{item.quantity}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(order.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past Orders */}
      {pastOrders.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">ประวัติคำสั่งซื้อ</h2>
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-2xl p-4 shadow-soft"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted">{order.order_number}</span>
                  <span className={cn(
                    "text-[10px] font-semibold px-2.5 py-1 rounded-full",
                    getOrderStatusColor(order.status)
                  )}>
                    {getOrderStatusText(order.status)}
                  </span>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-sm text-muted">
                      {item.product_name} x{item.quantity}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(order.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{formatPrice(order.total)}</span>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="font-semibold text-lg">ยังไม่มีคำสั่งซื้อ</h3>
          <p className="text-sm text-muted mt-1">สั่งเครื่องดื่มแก้วแรกเลย!</p>
        </div>
      )}
    </div>
  );
}
