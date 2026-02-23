"use client";

import { useState } from "react";
import { Store, Clock, MapPin, CreditCard, Bell, Calendar, Package, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("shop");
  const [isOpen, setIsOpen] = useState(true);
  const [schedulingEnabled, setSchedulingEnabled] = useState(true);

  const tabs = [
    { id: "shop", label: "ข้อมูลร้าน", icon: Store },
    { id: "hours", label: "เวลาเปิด-ปิด", icon: Clock },
    { id: "delivery", label: "พื้นที่จัดส่ง", icon: MapPin },
    { id: "payment", label: "การชำระเงิน", icon: CreditCard },
    { id: "scheduling", label: "สั่งล่วงหน้า", icon: Calendar },
    { id: "limits", label: "จำกัดจำนวน", icon: Package },
    { id: "notifications", label: "แจ้งเตือน", icon: Bell },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">ตั้งค่าร้านค้า</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border-l-3 border-primary"
                    : "text-muted hover:bg-gray-50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Shop Info */}
          {activeTab === "shop" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-base mb-4">ข้อมูลร้านค้า</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">ชื่อร้าน</label>
                  <input type="text" defaultValue="ร้านชาบ้านสวน" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">เบอร์โทร</label>
                  <input type="tel" defaultValue="02-123-4567" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">ที่อยู่</label>
                  <textarea defaultValue="123 ถ.สุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">สถานะร้าน</label>
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => setIsOpen(!isOpen)}
                      className={cn("w-12 h-6 rounded-full transition-colors relative cursor-pointer", isOpen ? "bg-primary" : "bg-gray-300")}
                    >
                      <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow", isOpen ? "translate-x-6" : "translate-x-0.5")} />
                    </div>
                    <span className={cn("text-sm font-medium", isOpen ? "text-green-600" : "text-red-500")}>
                      {isOpen ? "เปิดรับออเดอร์" : "ปิดรับออเดอร์"}
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                  <Save className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </div>
          )}

          {/* Operating Hours */}
          {activeTab === "hours" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-base mb-4">เวลาเปิด-ปิดร้าน</h2>
              <div className="space-y-3">
                {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"].map((day, i) => (
                  <div key={day} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                    <div className={cn("w-12 h-6 rounded-full transition-colors relative cursor-pointer", i < 6 ? "bg-primary" : "bg-gray-300")}>
                      <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow", i < 6 ? "translate-x-6" : "translate-x-0.5")} />
                    </div>
                    <span className="w-20 text-sm font-medium">{day}</span>
                    <input type="time" defaultValue={i < 6 ? "08:00" : ""} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm" />
                    <span className="text-muted text-sm">-</span>
                    <input type="time" defaultValue={i < 6 ? "20:00" : ""} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm" />
                  </div>
                ))}
              </div>
              <button className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" /> บันทึก
              </button>
            </div>
          )}

          {/* Delivery Zones */}
          {activeTab === "delivery" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-base mb-4">พื้นที่จัดส่ง & ค่าจัดส่ง</h2>
              <div className="space-y-3">
                {[
                  { zone: "โซน A (0-3 กม.)", fee: "ฟรี" },
                  { zone: "โซน B (3-5 กม.)", fee: "฿20" },
                  { zone: "โซน C (5-10 กม.)", fee: "฿40" },
                ].map((z) => (
                  <div key={z.zone} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{z.zone}</p>
                    </div>
                    <span className={cn("text-sm font-bold", z.fee === "ฟรี" ? "text-green-600" : "text-foreground")}>{z.fee}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-mint-50 border border-mint-200">
                <p className="text-sm font-medium">ยอดสั่งซื้อขั้นต่ำ</p>
                <div className="flex items-center gap-2 mt-2">
                  <input type="number" defaultValue={100} className="w-32 px-4 py-2 rounded-xl border border-gray-200 text-sm" />
                  <span className="text-sm text-muted">บาท</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          {activeTab === "payment" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-base mb-4">วิธีการชำระเงิน</h2>
              <div className="space-y-3">
                {[
                  { label: "พร้อมเพย์ QR", desc: "รับชำระผ่าน PromptPay", enabled: true },
                  { label: "โอนเงิน", desc: "รับโอนผ่านบัญชีธนาคาร", enabled: true },
                  { label: "เงินสด", desc: "ชำระเงินปลายทาง", enabled: true },
                ].map((pm) => (
                  <div key={pm.label} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{pm.label}</p>
                      <p className="text-xs text-muted">{pm.desc}</p>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full transition-colors relative cursor-pointer", pm.enabled ? "bg-primary" : "bg-gray-300")}>
                      <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow", pm.enabled ? "translate-x-6" : "translate-x-0.5")} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium mb-1.5 block">PromptPay ID</label>
                <input type="text" defaultValue="0812345678" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          )}

          {/* Scheduling */}
          {activeTab === "scheduling" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base">ระบบสั่งล่วงหน้า</h2>
                <div
                  onClick={() => setSchedulingEnabled(!schedulingEnabled)}
                  className={cn("w-12 h-6 rounded-full transition-colors relative cursor-pointer", schedulingEnabled ? "bg-primary" : "bg-gray-300")}
                >
                  <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow", schedulingEnabled ? "translate-x-6" : "translate-x-0.5")} />
                </div>
              </div>
              {schedulingEnabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted mb-1 block">สั่งล่วงหน้าอย่างน้อย (นาที)</label>
                      <input type="number" defaultValue={60} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-sm text-muted mb-1 block">ล่วงหน้าได้สูงสุด (วัน)</label>
                      <input type="number" defaultValue={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-sm text-muted mb-1 block">ช่วงเวลาทุกๆ (นาที)</label>
                      <input type="number" defaultValue={30} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-sm text-muted mb-1 block">จำกัด order/ช่วงเวลา</label>
                      <input type="number" defaultValue={10} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">วันที่ปิดรับจอง</label>
                    <div className="flex flex-wrap gap-2">
                      {["2026-03-01", "2026-03-05"].map((date) => (
                        <span key={date} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
                          {date} ✕
                        </span>
                      ))}
                      <button className="px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-muted hover:border-primary hover:text-primary">
                        + เพิ่มวัน
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">วันที่ปิดรับจองประจำ</label>
                    <div className="flex flex-wrap gap-2">
                      {["อาทิตย์"].map((day) => (
                        <span key={day} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
                          {day} ✕
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                    <Save className="w-4 h-4" /> บันทึก
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Order Limits */}
          {activeTab === "limits" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-base mb-4">จำกัดจำนวนสินค้า</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-mint-50 border border-mint-200">
                  <h3 className="text-sm font-semibold mb-3">ระดับร้าน</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted mb-1 block">สินค้ารวมต่อ 1 order (ชิ้น)</label>
                      <input type="number" defaultValue={20} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">รับ order สูงสุดต่อวัน</label>
                      <input type="number" defaultValue={200} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">ระดับสินค้า (ตั้งค่าแต่ละเมนู)</h3>
                  <div className="space-y-2">
                    {[
                      { name: "ชาเขียวมัทฉะ", daily: 50, perOrder: 5 },
                      { name: "ชานมไข่มุก", daily: 100, perOrder: 10 },
                      { name: "เค้กส้ม", daily: 20, perOrder: 3 },
                    ].map((product) => (
                      <div key={product.name} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                        <span className="text-sm font-medium flex-1">{product.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">ต่อวัน:</span>
                          <input type="number" defaultValue={product.daily} className="w-16 px-2 py-1 rounded-lg border text-sm text-center" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">ต่อออเดอร์:</span>
                          <input type="number" defaultValue={product.perOrder} className="w-16 px-2 py-1 rounded-lg border text-sm text-center" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                  <Save className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-base mb-4">การแจ้งเตือน</h2>
              <div className="space-y-3">
                {[
                  { label: "เสียงแจ้งเตือนออเดอร์ใหม่", enabled: true },
                  { label: "Push notification", enabled: true },
                  { label: "แจ้งเตือน LINE", enabled: false },
                  { label: "อีเมลสรุปรายวัน", enabled: false },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium">{n.label}</span>
                    <div className={cn("w-12 h-6 rounded-full transition-colors relative cursor-pointer", n.enabled ? "bg-primary" : "bg-gray-300")}>
                      <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow", n.enabled ? "translate-x-6" : "translate-x-0.5")} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
