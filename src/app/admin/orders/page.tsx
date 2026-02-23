"use client";

import { useState } from "react";
import {
  LayoutGrid,
  List,
  Clock,
  ChevronRight,
  Package,
} from "lucide-react";
import {
  cn,
  formatPrice,
  formatDateTime,
  getOrderStatusText,
  getOrderStatusColor,
} from "@/lib/utils";

type OrderStatus = "pending" | "preparing" | "ready" | "delivering";

interface Order {
  id: string;
  order_number: string;
  customer: string;
  items: { name: string; qty: number }[];
  total: number;
  status: OrderStatus;
  payment_status: "paid" | "unpaid";
  created_at: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    order_number: "ORD-20260223-001",
    customer: "สมชาย ใจดี",
    items: [
      { name: "ชาเขียวมัทฉะ", qty: 2 },
      { name: "เค้กส้ม", qty: 1 },
    ],
    total: 450,
    status: "pending",
    payment_status: "paid",
    created_at: "2026-02-23T09:15:00",
  },
  {
    id: "2",
    order_number: "ORD-20260223-002",
    customer: "วิภา สุขใจ",
    items: [{ name: "ชานมไข่มุก", qty: 1 }],
    total: 120,
    status: "pending",
    payment_status: "unpaid",
    created_at: "2026-02-23T09:30:00",
  },
  {
    id: "3",
    order_number: "ORD-20260223-003",
    customer: "ธนพล รักษ์ดี",
    items: [
      { name: "ชาไทย", qty: 3 },
      { name: "วาฟเฟิล", qty: 2 },
    ],
    total: 890,
    status: "preparing",
    payment_status: "paid",
    created_at: "2026-02-23T08:45:00",
  },
  {
    id: "4",
    order_number: "ORD-20260223-004",
    customer: "นภา แสนสุข",
    items: [
      { name: "ชาเย็น", qty: 1 },
      { name: "ขนมปัง", qty: 1 },
    ],
    total: 260,
    status: "preparing",
    payment_status: "paid",
    created_at: "2026-02-23T08:50:00",
  },
  {
    id: "5",
    order_number: "ORD-20260223-005",
    customer: "พิชัย มั่นคง",
    items: [
      { name: "ชาอู่หลง", qty: 2 },
      { name: "เค้กชาเขียว", qty: 2 },
    ],
    total: 720,
    status: "ready",
    payment_status: "paid",
    created_at: "2026-02-23T08:20:00",
  },
  {
    id: "6",
    order_number: "ORD-20260223-006",
    customer: "อรุณี วงศ์สกุล",
    items: [{ name: "ชาดำเย็น", qty: 1 }],
    total: 80,
    status: "ready",
    payment_status: "paid",
    created_at: "2026-02-23T08:10:00",
  },
  {
    id: "7",
    order_number: "ORD-20260223-007",
    customer: "กิตติ เจริญผล",
    items: [
      { name: "ชาเขียวนม", qty: 1 },
      { name: "โดนัท", qty: 3 },
    ],
    total: 340,
    status: "delivering",
    payment_status: "paid",
    created_at: "2026-02-23T07:55:00",
  },
  {
    id: "8",
    order_number: "ORD-20260223-008",
    customer: "ปรียา จันทร์ฉาย",
    items: [
      { name: "ชามะลิ", qty: 2 },
      { name: "เค้กช็อกโกแลต", qty: 1 },
    ],
    total: 520,
    status: "delivering",
    payment_status: "paid",
    created_at: "2026-02-23T07:40:00",
  },
];

const columns: { status: OrderStatus; label: string; headerColor: string }[] = [
  { status: "pending", label: "รอยืนยัน", headerColor: "bg-yellow-400" },
  { status: "preparing", label: "กำลังเตรียม", headerColor: "bg-orange-400" },
  { status: "ready", label: "พร้อมส่ง", headerColor: "bg-purple-400" },
  { status: "delivering", label: "กำลังจัดส่ง", headerColor: "bg-cyan-400" },
];

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivering",
  delivering: null,
};

const nextStatusLabel: Record<OrderStatus, string> = {
  pending: "เริ่มเตรียม",
  preparing: "พร้อมส่ง",
  ready: "ส่งเลย",
  delivering: "",
};

function getTimeAgo(dateStr: string): string {
  const now = new Date("2026-02-23T10:00:00");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} ชม.ที่แล้ว`;
}

export default function AdminOrdersPage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const handleStatusChange = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const next = nextStatus[order.status];
          if (next) return { ...order, status: next };
        }
        return order;
      })
    );
  };

  const getOrdersByStatus = (status: OrderStatus) =>
    orders.filter((o) => o.status === status);

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
                            {order.customer}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(order.created_at)}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-gray-400" />
                            <span>
                              {item.name} x{item.qty}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(order.total)}
                        </span>
                        {nextStatus[order.status] && (
                          <button
                            onClick={() => handleStatusChange(order.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                          >
                            {nextStatusLabel[order.status]}
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
                      {order.customer}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {order.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
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
                <p className="text-xs text-gray-500">{order.customer}</p>
                <p className="text-xs text-gray-400">
                  {order.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
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
