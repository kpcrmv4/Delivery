"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, ShoppingBag, Users, Package, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getShopId } from "@/lib/supabase/queries";

const periods = ["วันนี้", "สัปดาห์นี้", "เดือนนี้", "3 เดือน"];

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
  emoji: string;
}

interface DailyData {
  day: string;
  revenue: number;
  orders: number;
}

interface PaymentSummary {
  method: string;
  amount: number;
  percent: number;
  color: string;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("สัปดาห์นี้");
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [avgPerOrder, setAvgPerOrder] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);

  const shopId = getShopId();

  const getDateRange = useCallback((p: string) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start: Date;

    switch (p) {
      case "วันนี้":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      case "สัปดาห์นี้": {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff, 0, 0, 0);
        break;
      }
      case "เดือนนี้":
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        break;
      case "3 เดือน":
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
    }

    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { start, end } = getDateRange(period);

    // Fetch delivered orders in date range
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total, payment_method, customer_id, created_at")
      .eq("shop_id", shopId)
      .eq("status", "delivered")
      .gte("created_at", start)
      .lte("created_at", end);

    const orderList = (orders || []) as { id: string; total: number; payment_method: string; customer_id: string; created_at: string }[];
    const revenue = orderList.reduce((sum: number, o) => sum + Number(o.total || 0), 0);
    const uniqueCustomers = new Set(orderList.map((o: { customer_id: string }) => o.customer_id)).size;

    setTotalRevenue(revenue);
    setTotalOrders(orderList.length);
    setTotalCustomers(uniqueCustomers);
    setAvgPerOrder(orderList.length > 0 ? Math.round(revenue / orderList.length) : 0);

    // Fetch top products from order_items
    const orderIds = orderList.map((o: { id: string }) => o.id);
    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, product_image, quantity, total_price")
        .in("order_id", orderIds);

      if (items) {
        const productMap: Record<string, { name: string; sold: number; revenue: number; image: string }> = {};
        (items as { product_name: string; product_image: string; quantity: number; total_price: number }[]).forEach((item) => {
          const key = item.product_name;
          if (!productMap[key]) {
            productMap[key] = { name: key, sold: 0, revenue: 0, image: item.product_image || "" };
          }
          productMap[key].sold += item.quantity;
          productMap[key].revenue += Number(item.total_price || 0);
        });
        const sorted = Object.values(productMap).sort((a, b) => b.sold - a.sold).slice(0, 5);
        setTopProducts(sorted.map((p) => ({
          name: p.name,
          sold: p.sold,
          revenue: p.revenue,
          emoji: "📦",
        })));
      }
    } else {
      setTopProducts([]);
    }

    // Build daily data
    const dayMap: Record<string, { revenue: number; orders: number }> = {};
    const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    orderList.forEach((o: { total: number; created_at: string }) => {
      const d = new Date(o.created_at);
      const key = d.toISOString().split("T")[0];
      if (!dayMap[key]) dayMap[key] = { revenue: 0, orders: 0 };
      dayMap[key].revenue += Number(o.total || 0);
      dayMap[key].orders += 1;
    });

    // Get last 7 days
    const days: DailyData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days.push({
        day: dayNames[d.getDay()],
        revenue: dayMap[key]?.revenue || 0,
        orders: dayMap[key]?.orders || 0,
      });
    }
    setDailyData(days);

    // Payment summary
    const pmMap: Record<string, number> = {};
    orderList.forEach((o: { payment_method: string; total: number }) => {
      const method = o.payment_method || "other";
      pmMap[method] = (pmMap[method] || 0) + Number(o.total || 0);
    });
    const pmColors: Record<string, string> = {
      promptpay: "bg-blue-500",
      transfer: "bg-green-500",
      cash: "bg-yellow-500",
    };
    const pmLabels: Record<string, string> = {
      promptpay: "พร้อมเพย์",
      transfer: "โอนเงิน",
      cash: "เงินสด",
    };
    const pmTotal = Object.values(pmMap).reduce((s, v) => s + v, 0) || 1;
    setPaymentSummary(
      Object.entries(pmMap).map(([method, amount]) => ({
        method: pmLabels[method] || method,
        amount,
        percent: Math.round((amount / pmTotal) * 100),
        color: pmColors[method] || "bg-gray-500",
      }))
    );

    setLoading(false);
  }, [period, shopId, getDateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold">รายงาน</h1>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                period === p
                  ? "bg-primary text-white"
                  : "bg-white text-muted border border-gray-200 hover:border-primary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "รายได้รวม", value: formatPrice(totalRevenue), icon: DollarSign, color: "bg-green-100 text-green-600" },
          { label: "ออเดอร์ทั้งหมด", value: String(totalOrders), icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
          { label: "ลูกค้า", value: String(totalCustomers), icon: Users, color: "bg-purple-100 text-purple-600" },
          { label: "ค่าเฉลี่ย/ออเดอร์", value: formatPrice(avgPerOrder), icon: Package, color: "bg-orange-100 text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-soft">
          <h3 className="font-bold text-sm mb-4">รายได้รายวัน</h3>
          <div className="flex items-end gap-3 h-48">
            {dailyData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted font-medium">
                  {d.revenue > 0 ? formatPrice(d.revenue) : ""}
                </span>
                <div
                  className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden"
                  style={{ height: `${d.revenue > 0 ? (d.revenue / maxRevenue) * 100 : 2}%` }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                    style={{ height: "100%" }}
                  />
                </div>
                <span className="text-xs font-medium text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <h3 className="font-bold text-sm mb-4">สินค้าขายดี</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-mint-100 rounded-lg flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-lg">{product.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-[10px] text-muted">{product.sold} ชิ้น</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      {paymentSummary.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-soft">
          <h3 className="font-bold text-sm mb-4">สรุปการชำระเงิน</h3>
          <div className="grid grid-cols-3 gap-4">
            {paymentSummary.map((pm) => (
              <div key={pm.method} className="text-center">
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className={cn("h-2 rounded-full", pm.color)} style={{ width: `${pm.percent}%` }} />
                </div>
                <p className="text-sm font-bold">{formatPrice(pm.amount)}</p>
                <p className="text-xs text-muted">{pm.method} ({pm.percent}%)</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
