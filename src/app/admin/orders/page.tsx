"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutGrid,
  List,
  Clock,
  ChevronRight,
  Package,
  Loader2,
} from "lucide-react";
import {
  cn,
  formatPrice,
  formatDateTime,
  getOrderStatusText,
  getOrderStatusColor,
} from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  getOrders,
  getShopId,
  updateOrderStatus,
  subscribeToOrders,
} from "@/lib/supabase/queries";
import type { Order } from "@/types";

type BoardStatus = "pending" | "preparing" | "ready" | "delivering";

const columns: { status: BoardStatus; label: string; headerColor: string }[] = [
  { status: "pending", label: "รอยืนยัน", headerColor: "bg-yellow-400" },
  { status: "preparing", label: "กำลังเตรียม", headerColor: "bg-orange-400" },
  { status: "ready", label: "พร้อมส่ง", headerColor: "bg-purple-400" },
  { status: "delivering", label: "กำลังจัดส่ง", headerColor: "bg-cyan-400" },
];

const nextStatus: Record<BoardStatus, BoardStatus | null> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivering",
  delivering: null,
};

const nextStatusLabel: Record<BoardStatus, string> = {
  pending: "เริ่มเตรียม",
  preparing: "พร้อมส่ง",
  ready: "ส่งเลย",
  delivering: "",
};

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

export default function AdminOrdersPage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const shopId = getShopId();

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    const { data } = await getOrders(supabase, { shopId });
    if (data) setOrders(data);
    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription
  useEffect(() => {
    if (!shopId) return;
    const supabase = createClient();
    const channel = subscribeToOrders(supabase, shopId, () => {
      fetchOrders();
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, fetchOrders]);

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    const next = nextStatus[currentStatus as BoardStatus];
    if (!next) return;

    const supabase = createClient();
    const { error } = await updateOrderStatus(supabase, orderId, next);
    if (!error) {
      // Optimistic update
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: next } : order
        )
      );
    }
  };

  const getOrdersByStatus = (status: BoardStatus) =>
    orders.filter((o) => o.status === status);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-foreground">จัดการออเดอร์</h1>
        <div className="flex items-center bg-white rounded-xl shadow-soft border border-gray-100 p-1">
          <button
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              view === "board"
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Board View</span>
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              view === "list"
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            )}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List View</span>
          </button>
        </div>
      </div>

      {/* Board View */}
      {view === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {columns.map((col) => {
            const colOrders = getOrdersByStatus(col.status);
            return (
              <div
                key={col.status}
                className="min-w-[280px] flex-1 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={cn("w-2.5 h-2.5 rounded-full", col.headerColor)}
                  />
                  <h2 className="text-sm font-semibold text-foreground">
                    {col.label}
                  </h2>
                  <span className="ml-auto text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {colOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-soft p-4 space-y-3 border border-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {order.order_number}
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            {order.customer_name}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(order.created_at)}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-gray-400" />
                            <span>
                              {item.product_name} x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(order.total)}
                        </span>
                        {nextStatus[order.status as BoardStatus] && (
                          <button
                            onClick={() => handleStatusChange(order.id, order.status)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                          >
                            {nextStatusLabel[order.status as BoardStatus]}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colOrders.length === 0 && (
                    <div className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 p-6 flex items-center justify-center">
                      <p className="text-xs text-gray-400">ไม่มีออเดอร์</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-muted text-xs">
                  <th className="text-left px-5 py-3 font-medium">เลขออเดอร์</th>
                  <th className="text-left px-5 py-3 font-medium">ลูกค้า</th>
                  <th className="text-left px-5 py-3 font-medium">รายการ</th>
                  <th className="text-right px-5 py-3 font-medium">ยอดรวม</th>
                  <th className="text-center px-5 py-3 font-medium">สถานะ</th>
                  <th className="text-center px-5 py-3 font-medium">ชำระเงิน</th>
                  <th className="text-right px-5 py-3 font-medium">วันที่สร้าง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {order.customer_name}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {(order.items || []).map((i) => `${i.product_name} x${i.quantity}`).join(", ")}
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
                    <td className="px-5 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {order.payment_status === "paid"
                          ? "ชำระแล้ว"
                          : "ยังไม่ชำระ"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500 text-xs whitespace-nowrap">
                      {formatDateTime(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {orders.map((order) => (
              <div key={order.id} className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
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
                <p className="text-xs text-gray-500">{order.customer_name}</p>
                <p className="text-xs text-gray-400">
                  {(order.items || []).map((i) => `${i.product_name} x${i.quantity}`).join(", ")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(order.total)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {order.payment_status === "paid"
                        ? "ชำระแล้ว"
                        : "ยังไม่ชำระ"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatDateTime(order.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
