"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import type { Product, SelectedOption, ProductOption } from "@/types";

const mockProduct: Product = {
  id: "1",
  shop_id: "shop-1",
  category_id: "cat-3",
  name: "ชานมไข่มุก",
  description: "ชานมสูตรพิเศษ เข้มข้น หอมกลิ่นชา เสิร์ฟพร้อมไข่มุกนุ่มๆ เคี้ยวหนึบ อร่อยทุกคำ",
  price: 55,
  image_url: "🧋",
  sort_order: 1,
  status: "available",
  is_recommended: true,
  is_favorite: false,
  daily_limit: 100,
  daily_sold: 72,
  max_per_order: 10,
  options: [
    {
      id: "opt-size",
      name: "ขนาด",
      type: "single_select",
      is_required: true,
      sort_order: 1,
      choices: [
        { id: "size-s", name: "แก้วเล็ก (S)", price_adjustment: 0, is_available: true },
        { id: "size-m", name: "แก้วกลาง (M)", price_adjustment: 10, is_available: true },
        { id: "size-l", name: "แก้วใหญ่ (L)", price_adjustment: 20, is_available: true },
      ],
    },
    {
      id: "opt-sweet",
      name: "ระดับความหวาน",
      type: "single_select",
      is_required: true,
      sort_order: 2,
      choices: [
        { id: "sweet-100", name: "หวานปกติ (100%)", price_adjustment: 0, is_available: true },
        { id: "sweet-75", name: "หวานน้อย (75%)", price_adjustment: 0, is_available: true },
        { id: "sweet-50", name: "หวาน 50%", price_adjustment: 0, is_available: true },
        { id: "sweet-25", name: "หวาน 25%", price_adjustment: 0, is_available: true },
        { id: "sweet-0", name: "ไม่หวาน (0%)", price_adjustment: 0, is_available: true },
      ],
    },
    {
      id: "opt-topping",
      name: "ท็อปปิ้งเพิ่ม",
      type: "multi_select",
      is_required: false,
      sort_order: 3,
      choices: [
        { id: "top-pearl", name: "ไข่มุก", price_adjustment: 10, is_available: true },
        { id: "top-jelly", name: "เจลลี่", price_adjustment: 10, is_available: true },
        { id: "top-pudding", name: "พุดดิ้ง", price_adjustment: 15, is_available: true },
        { id: "top-cream", name: "วิปครีม", price_adjustment: 15, is_available: true },
        { id: "top-shot", name: "เอสเพรสโซ่ช็อต", price_adjustment: 20, is_available: false },
      ],
    },
  ],
};

export default function ProductDetailPage() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    mockProduct.options.forEach((opt) => {
      if (opt.is_required && opt.choices.length > 0) {
        initial[opt.id] = [opt.choices[0].id];
      }
    });
    return initial;
  });

  const product = mockProduct;
  const remaining = product.daily_limit ? product.daily_limit - product.daily_sold : null;
  const maxQty = Math.min(
    product.max_per_order || 99,
    remaining || 99
  );

  const getSelectedOptionsList = (): SelectedOption[] => {
    const list: SelectedOption[] = [];
    product.options.forEach((opt) => {
      const choiceIds = selectedOptions[opt.id] || [];
      choiceIds.forEach((cid) => {
        const choice = opt.choices.find((c) => c.id === cid);
        if (choice) {
          list.push({
            option_id: opt.id,
            option_name: opt.name,
            choice_id: choice.id,
            choice_name: choice.name,
            price_adjustment: choice.price_adjustment,
          });
        }
      });
    });
    return list;
  };

  const optionsPriceTotal = getSelectedOptionsList().reduce(
    (sum, o) => sum + o.price_adjustment, 0
  );
  const unitPrice = product.price + optionsPriceTotal;
  const totalPrice = unitPrice * quantity;

  const handleSelectOption = (option: ProductOption, choiceId: string) => {
    setSelectedOptions((prev) => {
      const current = prev[option.id] || [];
      if (option.type === "single_select") {
        return { ...prev, [option.id]: [choiceId] };
      }
      if (current.includes(choiceId)) {
        return { ...prev, [option.id]: current.filter((id) => id !== choiceId) };
      }
      return { ...prev, [option.id]: [...current, choiceId] };
    });
  };

  const handleAddToCart = () => {
    addItem(product, quantity, getSelectedOptionsList(), note);
    router.back();
  };

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto">
      {/* Hero Image */}
      <div className="relative h-64 bg-gradient-to-br from-mint-200 to-mint-400 flex items-center justify-center">
        <span className="text-8xl">{product.image_url}</span>
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center"
          aria-label="กลับ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center"
          aria-label="ถูกใจ"
        >
          <Heart className={cn("w-5 h-5", isFavorite ? "fill-accent text-accent" : "text-gray-500")} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative">
        <div className="bg-white rounded-t-3xl pt-6 pb-32">
          {/* Name & Price */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{product.name}</h1>
              <p className="text-sm text-muted mt-1">{product.description}</p>
            </div>
            <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
          </div>

          {remaining !== null && (
            <div className={cn(
              "mt-2 text-xs font-medium px-2 py-1 rounded-full inline-block",
              remaining <= 10 ? "bg-orange-100 text-orange-600" : "bg-mint-100 text-mint-600"
            )}>
              เหลือ {remaining} แก้ววันนี้
            </div>
          )}

          {/* Options */}
          {product.options.map((option) => (
            <div key={option.id} className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-sm">{option.name}</h3>
                {option.is_required && (
                  <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                    จำเป็น
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {option.choices.map((choice) => {
                  const isSelected = (selectedOptions[option.id] || []).includes(choice.id);
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectOption(option, choice.id)}
                      disabled={!choice.is_available}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-foreground border-gray-200 hover:border-primary",
                        !choice.is_available && "opacity-40 cursor-not-allowed line-through"
                      )}
                    >
                      {choice.name}
                      {choice.price_adjustment > 0 && (
                        <span className="ml-1 opacity-75">+{choice.price_adjustment}฿</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Note */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-2">หมายเหตุเพิ่มเติม</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ไม่ใส่น้ำแข็ง, แยกน้ำตาล..."
              className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-bottom z-50">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          {/* Quantity */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
              aria-label="ลดจำนวน"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-lg w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
              disabled={quantity >= maxQty}
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center disabled:opacity-40"
              aria-label="เพิ่มจำนวน"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-float"
          >
            <ShoppingBag className="w-5 h-5" />
            เพิ่มลงตะกร้า {formatPrice(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
