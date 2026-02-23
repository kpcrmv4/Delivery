"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const periods = ["วันนี้", "สัปดาห์นี้", "เดือนนี้", "3 เดือน"];

const topProducts = [
  { name: "ชานมไข่มุก", sold: 342, revenue: 18810, emoji: "🧋" },
  { name: "กาแฟลาเต้เย็น", sold: 256, revenue: 15360, emoji: "☕" },
  { name: "ชาเขียวมัทฉะ", sold: 198, revenue: 12870, emoji: "🍵" },
  { name: "มัทฉะลาเต้", sold: 167, revenue: 10855, emoji: "🍵" },
  { name: "ชาพีช", sold: 145, revenue: 7250, emoji: "🍑" },
];

const dailyData = [
  { day: "จ", revenue: 8500, orders: 32 },
  { day: "อ", revenue: 12400, orders: 48 },
  { day: "พ", revenue: 9800, orders: 38 },
  { day: "พฤ", revenue: 15200, orders: 56 },
  { day: "ศ", revenue: 18900, orders: 72 },
  { day: "ส", revenue: 22100, orders: 85 },
  { day: "อา", revenue: 14300, orders: 55 },
];

const maxRevenue = Math.max(...dailyData.map((d) => d.revenue));

export default function ReportsPage() {
  const [period, setPeriod] = useState("สัปดาห์นี้");

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
          { label: "รายได้รวม", value: formatPrice(101200), change: "+18%", up: true, icon: DollarSign, color: "bg-green-100 text-green-600" },
          { label: "ออเดอร์ทั้งหมด", value: "386", change: "+12%", up: true, icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
          { label: "ลูกค้า", value: "245", change: "+8%", up: true, icon: Users, color: "bg-purple-100 text-purple-600" },
          { label: "ค่าเฉลี่ย/ออเดอร์", value: formatPrice(262), change: "-3%", up: false, icon: Package, color: "bg-orange-100 text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn("text-xs font-semibold flex items-center gap-0.5", stat.up ? "text-green-600" : "text-red-500")}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </span>
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
            {dailyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted font-medium">
                  {formatPrice(d.revenue)}
                </span>
                <div
                  className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
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
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mt-6 bg-white rounded-2xl p-5 shadow-soft">
        <h3 className="font-bold text-sm mb-4">สรุปการชำระเงิน</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { method: "พร้อมเพย์", amount: 58200, percent: 57, color: "bg-blue-500" },
            { method: "โอนเงิน", amount: 28500, percent: 28, color: "bg-green-500" },
            { method: "เงินสด", amount: 14500, percent: 15, color: "bg-yellow-500" },
          ].map((pm) => (
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
    </div>
  );
}
