"use client";

import { Heart } from "lucide-react";
import ProductCard from "@/components/customer/product-card";
import type { Product } from "@/types";

const favoriteProducts: Product[] = [
  {
    id: "1", shop_id: "shop-1", category_id: "cat-3", name: "ชานมไข่มุก",
    description: "ชานมสูตรพิเศษ เข้มข้น หอมกลิ่นชา เสิร์ฟพร้อมไข่มุกนุ่มๆ",
    price: 55, image_url: "🧋", sort_order: 1, status: "available",
    is_recommended: true, is_favorite: true, daily_limit: null, daily_sold: 0,
    max_per_order: null, options: [],
  },
  {
    id: "3", shop_id: "shop-1", category_id: "cat-4", name: "กาแฟลาเต้เย็น",
    description: "เอสเพรสโซ่เข้มข้น ผสมนมสด เนื้อนุ่มละมุน",
    price: 60, image_url: "☕", sort_order: 3, status: "available",
    is_recommended: false, is_favorite: true, daily_limit: null, daily_sold: 0,
    max_per_order: null, options: [],
  },
  {
    id: "5", shop_id: "shop-1", category_id: "cat-1", name: "ชาพีช",
    description: "ชาผลไม้ หอมกลิ่นพีช สดชื่นทุกคำ",
    price: 50, image_url: "🍑", sort_order: 5, status: "available",
    is_recommended: false, is_favorite: true, daily_limit: null, daily_sold: 0,
    max_per_order: null, options: [],
  },
];

export default function FavoritesPage() {
  if (favoriteProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold">ยังไม่มีรายการโปรด</h2>
        <p className="text-sm text-muted mt-1">กดหัวใจเพื่อบันทึกเมนูที่ชอบ</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white px-4 py-4 shadow-sm">
        <h1 className="text-lg font-bold">เมนูที่ชอบ</h1>
        <p className="text-xs text-muted mt-0.5">{favoriteProducts.length} รายการ</p>
      </div>
      <div className="px-4 mt-4 space-y-3">
        {favoriteProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
