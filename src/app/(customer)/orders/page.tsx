"use client";

import Link from "next/link";
import { Package, ChevronRight, Clock } from "lucide-react";
import { formatPrice, formatDateTime, getOrderStatusText, getOrderStatusColor, cn } from "@/lib/utils";

const mockOrders = [
  {
    id: "ORD-20260223-001",
    order_number: "ORD-20260223-001",
    status: "preparing",
    items: [
      { name: "ชานมไข่มุก", quantity: 2, total_price: 110 },
      { name: "มัทฉะลาเต้", quantity: 1, total_price: 65 },
    ],
    total: 175,
    created_at: "2026-02-23T10:30:00Z",
  },
  {
    id: "ORD-20260222-015",
    order_number: "ORD-20260222-015",
    status: "delivering",
    items: [
      { name: "กาแฟลาเต้เย็น", quantity: 1, total_price: 60 },
    ],
    total: 90,
    created_at: "2026-02-22T15:00:00Z",
  },
  {
    id: "ORD-20260220-008",
    order_number: "ORD-20260220-008",
    status: "delivered",
    items: [
      { name: "ชาเขียวมัทฉะ", quantity: 3, total_price: 195 },
      { name: "โกโก้ปั่น", quantity: 1, total_price: 55 },
    ],
    total: 250,
    created_at: "2026-02-20T12:00:00Z",
  },
  {
    id: "ORD-20260218-003",
    order_number: "ORD-20260218-003",
    status: "delivered",
    items: [
      { name: "ชาพีช", quantity: 2, total_price: 100 },
    ],
    total: 130,
    created_at: "2026-02-18T09:30:00Z",
  },
  {
    id: "ORD-20260215-021",
    order_number: "ORD-20260215-021",
    status: "cancelled",
    items: [
      { name: "อเมริกาโน่", quantity: 1, total_price: 45 },
    ],
    total: 75,
    created_at: "2026-02-15T14:00:00Z",
  },
];

export default function OrdersPage() {
  const activeOrders = mockOrders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );
  const pastOrders = mockOrders.filter(
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
                      {item.name} x{item.quantity}
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
                    {item.name} x{item.quantity}
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

      {mockOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="font-semibold text-lg">ยังไม่มีคำสั่งซื้อ</h3>
          <p className="text-sm text-muted mt-1">สั่งเครื่องดื่มแก้วแรกเลย!</p>
        </div>
      )}
    </div>
  );
}
