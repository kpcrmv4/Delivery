"use client";

import { useState } from "react";
import { Plus, Search, Tag, Calendar, Users, Truck, Gift, Zap, Clock, Edit, Trash2, Pause, Play, BarChart3, Copy } from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";

type PromotionType = "DELIVERY_DISCOUNT" | "ORDER_DISCOUNT" | "PRODUCT_DISCOUNT" | "BUY_X_GET_Y" | "FLASH_SALE" | "NEW_CUSTOMER" | "HAPPY_HOUR" | "BUNDLE" | "MIN_QUANTITY" | "PAYMENT_METHOD";

interface MockPromotion {
  id: string;
  name: string;
  description: string;
  type: PromotionType;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  usage_count: number;
  max_uses: number | null;
  budget_spent: number;
  max_budget: number | null;
  codes: string[];
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  DELIVERY_DISCOUNT: { label: "ส่วนลดค่าส่ง", icon: Truck, color: "bg-blue-100 text-blue-700" },
  ORDER_DISCOUNT: { label: "ส่วนลดออเดอร์", icon: Tag, color: "bg-green-100 text-green-700" },
  PRODUCT_DISCOUNT: { label: "ส่วนลดสินค้า", icon: Tag, color: "bg-purple-100 text-purple-700" },
  BUY_X_GET_Y: { label: "ซื้อ X แถม Y", icon: Gift, color: "bg-pink-100 text-pink-700" },
  FLASH_SALE: { label: "Flash Sale", icon: Zap, color: "bg-yellow-100 text-yellow-700" },
  NEW_CUSTOMER: { label: "ลูกค้าใหม่", icon: Users, color: "bg-cyan-100 text-cyan-700" },
  HAPPY_HOUR: { label: "Happy Hour", icon: Clock, color: "bg-orange-100 text-orange-700" },
  BUNDLE: { label: "เซ็ตเมนู", icon: Gift, color: "bg-indigo-100 text-indigo-700" },
  MIN_QUANTITY: { label: "สั่งขั้นต่ำ", icon: Tag, color: "bg-teal-100 text-teal-700" },
  PAYMENT_METHOD: { label: "วิธีชำระเงิน", icon: Tag, color: "bg-rose-100 text-rose-700" },
};

const mockPromotions: MockPromotion[] = [
  {
    id: "promo-1", name: "ส่งฟรี มื้อกลางวัน", description: "ฟรีค่าส่งภายใน 3 กม. (จ-ศ 11-13น.) สั่งขั้นต่ำ 150฿",
    type: "DELIVERY_DISCOUNT", is_active: true, starts_at: "2026-03-01", ends_at: "2026-03-31",
    usage_count: 234, max_uses: 1000, budget_spent: 11800, max_budget: 50000, codes: ["FREEDEL"],
  },
  {
    id: "promo-2", name: "ซื้อกาแฟ 2 แถมเค้ก", description: "ซื้อกาแฟ 2 แก้ว แถมเค้กชิ้นเล็ก 1",
    type: "BUY_X_GET_Y", is_active: true, starts_at: "2026-02-01", ends_at: null,
    usage_count: 89, max_uses: null, budget_spent: 6675, max_budget: null, codes: [],
  },
  {
    id: "promo-3", name: "Flash Sale ชานม 29฿", description: "ชานมไข่มุก ราคาพิเศษ 29฿ (จาก 55฿) จำกัด 50 แก้ว",
    type: "FLASH_SALE", is_active: true, starts_at: "2026-02-25", ends_at: "2026-02-25",
    usage_count: 0, max_uses: 50, budget_spent: 0, max_budget: null, codes: [],
  },
  {
    id: "promo-4", name: "ลูกค้าใหม่ลด 50%", description: "ออเดอร์แรก ลด 50% สูงสุด 100฿ + ฟรีค่าส่ง",
    type: "NEW_CUSTOMER", is_active: false, starts_at: "2026-01-01", ends_at: "2026-02-15",
    usage_count: 1000, max_uses: 1000, budget_spent: 85000, max_budget: 100000, codes: ["NEWBIE50"],
  },
  {
    id: "promo-5", name: "Happy Hour 14-16น.", description: "ทุกเมนูลด 25% ช่วง 14:00-16:00 ทุกวัน",
    type: "HAPPY_HOUR", is_active: true, starts_at: "2026-02-01", ends_at: null,
    usage_count: 567, max_uses: null, budget_spent: 28350, max_budget: null, codes: [],
  },
  {
    id: "promo-6", name: "สั่ง 5 แก้วลด 10%", description: "สั่ง 5 แก้วขึ้นไป ลดทั้งออเดอร์ 10%",
    type: "MIN_QUANTITY", is_active: true, starts_at: "2026-02-01", ends_at: null,
    usage_count: 145, max_uses: null, budget_spent: 14500, max_budget: null, codes: [],
  },
];

const filterOptions = ["ทั้งหมด", "กำลังใช้งาน", "หยุดชั่วคราว", "หมดอายุ", "ยังไม่เริ่ม"];

export default function PromotionsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ทั้งหมด");
  const [showCreate, setShowCreate] = useState(false);
  const [promotions, setPromotions] = useState(mockPromotions);

  const toggleActive = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  const now = new Date().toISOString();
  const filtered = promotions.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "กำลังใช้งาน") return p.is_active;
    if (filter === "หยุดชั่วคราว") return !p.is_active && (!p.ends_at || p.ends_at >= now);
    if (filter === "หมดอายุ") return p.ends_at && p.ends_at < now;
    if (filter === "ยังไม่เริ่ม") return p.starts_at > now;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">จัดการโปรโมชั่น</h1>
          <p className="text-sm text-muted mt-0.5">{promotions.length} โปรโมชั่นทั้งหมด</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          สร้างโปรโมชั่น
        </button>
      </div>

      {/* Create Form (collapsed) */}
      {showCreate && (
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-6 animate-scale-in">
          <h3 className="font-bold text-base mb-4">สร้างโปรโมชั่นใหม่</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">ชื่อโปรโมชั่น</label>
              <input type="text" placeholder="เช่น ส่งฟรีเดือนมีนา" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">ประเภท</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                {Object.entries(typeConfig).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">วันเริ่มต้น</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">วันสิ้นสุด</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>

          {/* Conditions section */}
          <div className="border-t pt-4 mb-4">
            <h4 className="font-semibold text-sm mb-3">เงื่อนไข</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted mb-1 block">ยอดสั่งซื้อขั้นต่ำ (฿)</label>
                <input type="number" placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">ส่วนลด (% หรือ ฿)</label>
                <input type="number" placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">ส่วนลดสูงสุด (฿)</label>
                <input type="number" placeholder="ไม่จำกัด" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">โค้ดส่วนลด</label>
                <input type="text" placeholder="เช่น FREEDEL50" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Limits section */}
          <div className="border-t pt-4 mb-4">
            <h4 className="font-semibold text-sm mb-3">ข้อจำกัด</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted mb-1 block">จำนวนใช้สูงสุด</label>
                <input type="number" placeholder="ไม่จำกัด" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">ต่อลูกค้า (ครั้ง)</label>
                <input type="number" placeholder="ไม่จำกัด" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">งบประมาณรวม (฿)</label>
                <input type="number" placeholder="ไม่จำกัด" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
              ยกเลิก
            </button>
            <button className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
              บันทึก
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาโปรโมชั่น..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border",
                filter === opt
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-200 text-muted hover:border-primary"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Promotion Cards */}
      <div className="space-y-3">
        {filtered.map((promo) => {
          const config = typeConfig[promo.type] || typeConfig.ORDER_DISCOUNT;
          const Icon = config.icon;
          const isExpired = promo.ends_at && promo.ends_at < now;
          const isFull = promo.max_uses && promo.usage_count >= promo.max_uses;

          return (
            <div key={promo.id} className={cn("bg-white rounded-2xl p-5 shadow-soft border", promo.is_active && !isExpired ? "border-transparent" : "border-gray-200 opacity-75")}>
              <div className="flex items-start gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">{promo.name}</h3>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", config.color)}>
                      {config.label}
                    </span>
                    {promo.is_active && !isExpired && !isFull && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">กำลังใช้งาน</span>
                    )}
                    {isExpired && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">หมดอายุ</span>
                    )}
                    {isFull && !isExpired && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">หมดโควตา</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">{promo.description}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(promo.starts_at)}
                      {promo.ends_at ? ` - ${formatDate(promo.ends_at)}` : " (ไม่มีวันหมดอายุ)"}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      ใช้แล้ว {promo.usage_count}{promo.max_uses ? `/${promo.max_uses}` : ""} ครั้ง
                    </span>
                    {promo.max_budget && (
                      <span>งบ: {formatPrice(promo.budget_spent)}/{formatPrice(promo.max_budget)}</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {promo.max_uses && (
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={cn("h-1.5 rounded-full transition-all", promo.usage_count >= promo.max_uses ? "bg-red-400" : "bg-primary")}
                        style={{ width: `${Math.min((promo.usage_count / promo.max_uses) * 100, 100)}%` }}
                      />
                    </div>
                  )}

                  {/* Codes */}
                  {promo.codes.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {promo.codes.map((code) => (
                        <span key={code} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded text-[11px] font-mono">
                          {code}
                          <Copy className="w-3 h-3 text-muted cursor-pointer hover:text-primary" />
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleActive(promo.id)} className={cn("p-2 rounded-lg transition-colors", promo.is_active ? "hover:bg-yellow-50 text-yellow-600" : "hover:bg-green-50 text-green-600")} aria-label={promo.is_active ? "หยุดชั่วคราว" : "เปิดใช้งาน"}>
                    {promo.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400" aria-label="แก้ไข">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-50 text-red-400" aria-label="ลบ">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-muted">ไม่พบโปรโมชั่น</p>
        </div>
      )}
    </div>
  );
}
