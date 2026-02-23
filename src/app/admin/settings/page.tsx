"use client";

import { useState, useEffect, useCallback } from "react";
import { Store, Clock, MapPin, CreditCard, Bell, Calendar, Package, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getShop, getShopId } from "@/lib/supabase/queries";
import type { Shop } from "@/types";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("shop");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [shop, setShop] = useState<Shop | null>(null);

  // Editable shop fields
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [openingHours, setOpeningHours] = useState<Shop["opening_hours"]>({});
  const [deliveryZones, setDeliveryZones] = useState<Shop["delivery_zones"]>([]);
  const [minOrderAmount, setMinOrderAmount] = useState(100);
  const [settings, setSettings] = useState<Shop["settings"]>({
    currency: "THB",
    tax_rate: 0,
    accept_cash: true,
    accept_transfer: true,
    accept_promptpay: true,
  });
  const [promptpayId, setPromptpayId] = useState("");
  const [schedulingEnabled, setSchedulingEnabled] = useState(true);
  const [schedulingSettings, setSchedulingSettings] = useState<Shop["scheduling_settings"]>({
    enabled: true,
    min_advance_minutes: 60,
    max_advance_days: 3,
    slot_interval_minutes: 30,
    max_orders_per_slot: 10,
    blocked_dates: [],
    blocked_weekdays: [],
    blocked_slots: [],
  });
  const [orderLimits, setOrderLimits] = useState<Shop["order_limits"]>({
    max_items_per_order: 20,
    max_orders_per_day: 200,
  });

  const shopId = getShopId();

  const fetchShop = useCallback(async () => {
    const supabase = createClient();
    const { data } = await getShop(supabase, shopId);
    if (data) {
      setShop(data);
      setShopName(data.name || "");
      setShopPhone(data.phone || "");
      setShopAddress(data.address || "");
      setIsOpen(data.is_open ?? true);
      setOpeningHours(data.opening_hours || {});
      setDeliveryZones(data.delivery_zones || []);
      setMinOrderAmount(data.min_order_amount || 100);
      setSettings(data.settings || { currency: "THB", tax_rate: 0, accept_cash: true, accept_transfer: true, accept_promptpay: true });
      setPromptpayId(data.promptpay_id || "");
      setSchedulingEnabled(data.scheduling_settings?.enabled ?? true);
      setSchedulingSettings(data.scheduling_settings || {
        enabled: true, min_advance_minutes: 60, max_advance_days: 3,
        slot_interval_minutes: 30, max_orders_per_slot: 10,
        blocked_dates: [], blocked_weekdays: [], blocked_slots: [],
      });
      setOrderLimits(data.order_limits || { max_items_per_order: 20, max_orders_per_day: 200 });
    }
    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  const handleSave = async (updates: Record<string, unknown>) => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("shops")
      .update(updates)
      .eq("id", shopId);

    if (!error) {
      await fetchShop();
    }
    setSaving(false);
  };

  const saveShopInfo = () => handleSave({
    name: shopName,
    phone: shopPhone,
    address: shopAddress,
    is_open: isOpen,
  });

  const saveHours = () => handleSave({ opening_hours: openingHours });

  const saveDelivery = () => handleSave({
    delivery_zones: deliveryZones,
    min_order_amount: minOrderAmount,
  });

  const savePayment = () => handleSave({
    settings,
    promptpay_id: promptpayId,
  });

  const saveScheduling = () => handleSave({
    scheduling_settings: { ...schedulingSettings, enabled: schedulingEnabled },
  });

  const saveLimits = () => handleSave({ order_limits: orderLimits });

  const tabs = [
    { id: "shop", label: "ข้อมูลร้าน", icon: Store },
    { id: "hours", label: "เวลาเปิด-ปิด", icon: Clock },
    { id: "delivery", label: "พื้นที่จัดส่ง", icon: MapPin },
    { id: "payment", label: "การชำระเงิน", icon: CreditCard },
    { id: "scheduling", label: "สั่งล่วงหน้า", icon: Calendar },
    { id: "limits", label: "จำกัดจำนวน", icon: Package },
    { id: "notifications", label: "แจ้งเตือน", icon: Bell },
  ];

  const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayLabels = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">เบอร์โทร</label>
                  <input type="tel" value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">ที่อยู่</label>
                  <textarea value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20" />
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
                <button onClick={saveShopInfo} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} บันทึก
                </button>
              </div>
            </div>
          )}

          {/* Operating Hours */}
          {activeTab === "hours" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-base mb-4">เวลาเปิด-ปิดร้าน</h2>
              <div className="space-y-3">
                {dayKeys.map((dayKey, i) => {
                  const dayData = openingHours[dayKey] || { open: "08:00", close: "20:00", is_open: true };
                  return (
                    <div key={dayKey} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                      <div
                        onClick={() => {
                          setOpeningHours((prev) => ({
                            ...prev,
                            [dayKey]: { ...dayData, is_open: !dayData.is_open },
                          }));
                        }}
                        className={cn("w-12 h-6 rounded-full transition-colors relative cursor-pointer", dayData.is_open ? "bg-primary" : "bg-gray-300")}
                      >
                        <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow", dayData.is_open ? "translate-x-6" : "translate-x-0.5")} />
                      </div>
                      <span className="w-20 text-sm font-medium">{dayLabels[i]}</span>
                      <input
                        type="time"
                        value={dayData.open}
                        onChange={(e) => {
                          setOpeningHours((prev) => ({
                            ...prev,
                            [dayKey]: { ...dayData, open: e.target.value },
                          }));
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                      />
                      <span className="text-muted text-sm">-</span>
                      <input
                        type="time"
                        value={dayData.close}
                        onChange={(e) => {
                          setOpeningHours((prev) => ({
                            ...prev,
                            [dayKey]: { ...dayData, close: e.target.value },
                          }));
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                  );
                })}
              </div>
              <button onClick={saveHours} disabled={saving} className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} บันทึก
              </button>
            </div>
          )}

          {/* Delivery Zones */}
          {activeTab === "delivery" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-base mb-4">พื้นที่จัดส่ง & ค่าจัดส่ง</h2>
              <div className="space-y-3">
                {deliveryZones.map((z, idx) => (
                  <div key={z.id || idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{z.name}</p>
                    </div>
                    <span className={cn("text-sm font-bold", z.fee === 0 ? "text-green-600" : "text-foreground")}>
                      {z.fee === 0 ? "ฟรี" : `฿${z.fee}`}
                    </span>
                  </div>
                ))}
                {deliveryZones.length === 0 && (
                  <p className="text-sm text-muted text-center py-4">ยังไม่มีโซนจัดส่ง</p>
                )}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-mint-50 border border-mint-200">
                <p className="text-sm font-medium">ยอดสั่งซื้อขั้นต่ำ</p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-32 px-4 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                  <span className="text-sm text-muted">บาท</span>
                </div>
              </div>
              <button onClick={saveDelivery} disabled={saving} className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} บันทึก
              </button>
            </div>
          )}

          {/* Payment */}
          {activeTab === "payment" && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-base mb-4">วิธีการชำระเงิน</h2>
              <div className="space-y-3">
                {[
                  { key: "accept_promptpay" as const, label: "พร้อมเพย์ QR", desc: "รับชำระผ่าน PromptPay" },
                  { key: "accept_transfer" as const, label: "โอนเงิน", desc: "รับโอนผ่านบัญชีธนาคาร" },
                  { key: "accept_cash" as const, label: "เงินสด", desc: "ชำระเงินปลายทาง" },
                ].map((pm) => (
                  <div key={pm.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{pm.label}</p>
                      <p className="text-xs text-muted">{pm.desc}</p>
                    </div>
                    <div
                      onClick={() => setSettings((prev) => ({ ...prev, [pm.key]: !prev[pm.key] }))}
                      className={cn("w-12 h-6 rounded-full transition-colors relative cursor-pointer", settings[pm.key] ? "bg-primary" : "bg-gray-300")}
                    >
                      <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow", settings[pm.key] ? "translate-x-6" : "translate-x-0.5")} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium mb-1.5 block">PromptPay ID</label>
                <input type="text" value={promptpayId} onChange={(e) => setPromptpayId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button onClick={savePayment} disabled={saving} className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} บันทึก
              </button>
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
                      <input
                        type="number"
                        value={schedulingSettings.min_advance_minutes}
                        onChange={(e) => setSchedulingSettings((prev) => ({ ...prev, min_advance_minutes: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted mb-1 block">ล่วงหน้าได้สูงสุด (วัน)</label>
                      <input
                        type="number"
                        value={schedulingSettings.max_advance_days}
                        onChange={(e) => setSchedulingSettings((prev) => ({ ...prev, max_advance_days: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted mb-1 block">ช่วงเวลาทุกๆ (นาที)</label>
                      <input
                        type="number"
                        value={schedulingSettings.slot_interval_minutes}
                        onChange={(e) => setSchedulingSettings((prev) => ({ ...prev, slot_interval_minutes: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted mb-1 block">จำกัด order/ช่วงเวลา</label>
                      <input
                        type="number"
                        value={schedulingSettings.max_orders_per_slot}
                        onChange={(e) => setSchedulingSettings((prev) => ({ ...prev, max_orders_per_slot: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">วันที่ปิดรับจอง</label>
                    <div className="flex flex-wrap gap-2">
                      {(schedulingSettings.blocked_dates || []).map((date) => (
                        <span
                          key={date}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium cursor-pointer"
                          onClick={() =>
                            setSchedulingSettings((prev) => ({
                              ...prev,
                              blocked_dates: prev.blocked_dates.filter((d) => d !== date),
                            }))
                          }
                        >
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
                      {(schedulingSettings.blocked_weekdays || []).map((wd) => {
                        const wdLabels = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
                        return (
                          <span
                            key={wd}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium cursor-pointer"
                            onClick={() =>
                              setSchedulingSettings((prev) => ({
                                ...prev,
                                blocked_weekdays: prev.blocked_weekdays.filter((d) => d !== wd),
                              }))
                            }
                          >
                            {wdLabels[wd]} ✕
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={saveScheduling} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} บันทึก
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
                      <input
                        type="number"
                        value={orderLimits.max_items_per_order}
                        onChange={(e) => setOrderLimits((prev) => ({ ...prev, max_items_per_order: Number(e.target.value) }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">รับ order สูงสุดต่อวัน</label>
                      <input
                        type="number"
                        value={orderLimits.max_orders_per_day}
                        onChange={(e) => setOrderLimits((prev) => ({ ...prev, max_orders_per_day: Number(e.target.value) }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>
                <button onClick={saveLimits} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} บันทึก
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
