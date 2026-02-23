"use client";

import { useState } from "react";
import { ArrowLeft, Minus, Plus, Trash2, Tag, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 150 ? 0 : 30;
  const discount = promoDiscount;
  const total = subtotal + deliveryFee - discount;
  const maxItemsPerOrder = 20;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoApplied(false);
    setPromoDiscount(0);

    try {
      const res = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });

      const data = await res.json();

      if (data.valid) {
        setPromoDiscount(data.discount || 0);
        setPromoApplied(true);
        setPromoError("");
      } else {
        setPromoError(data.error || "โค้ดไม่ถูกต้อง");
        setPromoApplied(false);
        setPromoDiscount(0);
      }
    } catch {
      setPromoError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setPromoLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-lg font-semibold text-foreground">ตะกร้าว่างเปล่า</h2>
        <p className="text-sm text-muted mt-1">เลือกเมนูที่ชอบแล้วเพิ่มลงตะกร้าเลย!</p>
        <Link
          href="/"
          className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          ดูเมนู
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
        <button onClick={() => router.back()} className="p-1" aria-label="กลับ">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1">ตะกร้าสินค้า</h1>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-600"
        >
          ล้างตะกร้า
        </button>
      </div>

      {/* Items limit warning */}
      {totalItems > maxItemsPerOrder - 5 && (
        <div className="mx-4 mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
          🛒 สินค้าในตะกร้า {totalItems}/{maxItemsPerOrder} ชิ้น
          {totalItems >= maxItemsPerOrder && " (เต็มแล้ว)"}
        </div>
      )}

      {/* Cart Items */}
      <div className="px-4 mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow-soft animate-fade-in"
          >
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-mint-100 flex items-center justify-center text-3xl flex-shrink-0">
                {item.product.image_url.startsWith("/") ? "☕" : item.product.image_url}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                {item.selected_options.length > 0 && (
                  <p className="text-[11px] text-muted mt-0.5">
                    {item.selected_options.map((o) => o.choice_name).join(", ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-[11px] text-orange-500 mt-0.5">📝 {item.note}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary font-bold text-sm">
                    {formatPrice(item.total_price)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        item.quantity <= 1
                          ? removeItem(item.id)
                          : updateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                      aria-label="ลดจำนวน"
                    >
                      {item.quantity <= 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="font-semibold text-sm w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={totalItems >= maxItemsPerOrder}
                      className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center disabled:opacity-40"
                      aria-label="เพิ่มจำนวน"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">โค้ดส่วนลด</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="กรอกโค้ดส่วนลด"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              onClick={handleApplyPromo}
              disabled={promoLoading}
              className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-70"
            >
              {promoLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "ใช้โค้ด"
              )}
            </button>
          </div>
          {promoApplied && (
            <p className="text-xs text-green-600 mt-2">
              ใช้โค้ดสำเร็จ! ลด {formatPrice(promoDiscount)}
            </p>
          )}
          {promoError && (
            <p className="text-xs text-red-500 mt-2">
              {promoError}
            </p>
          )}
        </div>
      </div>

      {/* Price Summary */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="font-semibold text-sm mb-3">สรุปราคา</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">ค่าสินค้า</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ค่าจัดส่ง</span>
              <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                {deliveryFee === 0 ? "ฟรี" : formatPrice(deliveryFee)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>ส่วนลด</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>ยอดรวม</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-bottom z-50">
        <div className="max-w-lg mx-auto">
          <Link
            href="/checkout"
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-float"
          >
            <ShoppingBag className="w-5 h-5" />
            สั่งซื้อ — {formatPrice(total)}
          </Link>
        </div>
      </div>
    </div>
  );
}
