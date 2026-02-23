"use client";

import { useState } from "react";
import { ArrowLeft, MapPin, Clock, CreditCard, Banknote, QrCode, Calendar, Truck, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";

const mockAddresses = [
  { id: "addr-1", label: "บ้าน", address_text: "123/45 หมู่บ้านสวนสวย ซ.ลาดพร้าว 71 กรุงเทพฯ 10230", latitude: 13.8, longitude: 100.6, note: "ตึกซ้ายมือ", is_default: true },
  { id: "addr-2", label: "ที่ทำงาน", address_text: "อาคาร ABC ชั้น 15 ถ.สาทร กรุงเทพฯ 10120", latitude: 13.72, longitude: 100.53, note: "", is_default: false },
];

const timeSlots = [
  "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
  "11:00 - 11:30", "11:30 - 12:00", "13:00 - 13:30", "13:30 - 14:00",
  "14:00 - 14:30", "14:30 - 15:00", "15:00 - 15:30", "15:30 - 16:00",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal } = useCartStore();
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "promptpay">("promptpay");
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedDate, setSelectedDate] = useState("วันนี้");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [note, setNote] = useState("");

  const subtotal = getSubtotal();
  const distance = 2.3;
  const deliveryFee = orderType === "pickup" ? 0 : (subtotal >= 150 ? 0 : 30);
  const total = subtotal + deliveryFee;

  const handleConfirmOrder = () => {
    router.push("/orders/ORD-20260223-001");
  };

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
        <button onClick={() => router.back()} className="p-1" aria-label="กลับ">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">ชำระเงิน</h1>
      </div>

      {/* Delivery / Pickup Toggle */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-1.5 flex shadow-soft">
          <button
            onClick={() => setOrderType("delivery")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
              orderType === "delivery"
                ? "bg-primary text-white shadow-sm"
                : "text-muted"
            )}
          >
            <Truck className="w-4 h-4" />
            จัดส่ง
          </button>
          <button
            onClick={() => setOrderType("pickup")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
              orderType === "pickup"
                ? "bg-primary text-white shadow-sm"
                : "text-muted"
            )}
          >
            <Store className="w-4 h-4" />
            รับที่ร้าน
          </button>
        </div>
      </div>

      {/* Map */}
      {orderType === "delivery" && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
            <div className="h-40 bg-gradient-to-br from-mint-100 to-mint-200 relative flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-primary mx-auto" />
                <p className="text-xs text-muted mt-1">แผนที่จุดจัดส่ง</p>
              </div>
              <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-lg text-xs font-medium shadow">
                📍 {distance} กม.
              </div>
            </div>

            {/* Address Selection */}
            <div className="p-4 border-t">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                ที่อยู่จัดส่ง
              </h3>
              <div className="space-y-2">
                {mockAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      selectedAddress.id === addr.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{addr.label}</span>
                      {addr.is_default && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          ค่าเริ่มต้น
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{addr.address_text}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Delivery */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              เวลาจัดส่ง
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-muted">สั่งล่วงหน้า</span>
              <div
                onClick={() => setIsScheduled(!isScheduled)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative cursor-pointer",
                  isScheduled ? "bg-primary" : "bg-gray-300"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                    isScheduled ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </div>
            </label>
          </div>

          {!isScheduled ? (
            <p className="text-sm text-muted mt-2">จัดส่งทันที (ประมาณ 30-45 นาที)</p>
          ) : (
            <div className="mt-3">
              {/* Date Selection */}
              <div className="flex gap-2 mb-3">
                {["วันนี้", "พรุ่งนี้", "มะรืนนี้"].map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                      selectedDate === date
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200"
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    {date}
                  </button>
                ))}
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot, i) => {
                  const isFull = i === 5;
                  return (
                    <button
                      key={slot}
                      onClick={() => !isFull && setSelectedSlot(slot)}
                      disabled={isFull}
                      className={cn(
                        "py-2 rounded-xl text-xs font-medium border transition-all",
                        selectedSlot === slot
                          ? "bg-primary text-white border-primary"
                          : isFull
                          ? "border-gray-100 bg-gray-50 text-gray-300"
                          : "border-gray-200 hover:border-primary"
                      )}
                    >
                      {slot}
                      {isFull && <p className="text-[9px] text-red-400">เต็ม</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-primary" />
            วิธีชำระเงิน
          </h3>
          <div className="space-y-2">
            {[
              { id: "promptpay" as const, icon: <QrCode className="w-5 h-5 text-blue-500" />, label: "พร้อมเพย์ QR", desc: "สแกนจ่ายผ่าน QR Code" },
              { id: "transfer" as const, icon: <CreditCard className="w-5 h-5 text-green-500" />, label: "โอนเงิน", desc: "โอนผ่านธนาคาร" },
              { id: "cash" as const, icon: <Banknote className="w-5 h-5 text-yellow-600" />, label: "เงินสด", desc: "ชำระเงินปลายทาง" },
            ].map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                  paymentMethod === pm.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                )}
              >
                {pm.icon}
                <div className="text-left flex-1">
                  <p className="text-sm font-medium">{pm.label}</p>
                  <p className="text-[11px] text-muted">{pm.desc}</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  paymentMethod === pm.id ? "border-primary" : "border-gray-300"
                )}>
                  {paymentMethod === pm.id && <div className="w-3 h-3 bg-primary rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order Note */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="font-semibold text-sm mb-2">หมายเหตุถึงร้านค้า</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น ฝากไว้ที่ล็อบบี้..."
            className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* Price Summary */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">ค่าสินค้า ({items.length} รายการ)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {orderType === "delivery" && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted">ระยะทาง</span>
                  <span>{distance} กม.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ค่าจัดส่ง</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryFee === 0 ? "ฟรี!" : formatPrice(deliveryFee)}
                  </span>
                </div>
              </>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>ยอดรวมทั้งหมด</span>
              <span className="text-primary text-lg">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-bottom z-50">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleConfirmOrder}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-float"
          >
            ยืนยันสั่งซื้อ — {formatPrice(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
