"use client";

import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/customer/product-card";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const categories = [
  { id: "", name: "ทั้งหมด" },
  { id: "cat-1", name: "เครื่องดื่มเย็น" },
  { id: "cat-2", name: "เครื่องดื่มร้อน" },
  { id: "cat-3", name: "ชานม" },
  { id: "cat-4", name: "กาแฟ" },
  { id: "cat-5", name: "ของหวาน" },
  { id: "cat-6", name: "เบเกอรี่" },
];

const allProducts: Product[] = [
  { id: "1", shop_id: "s1", category_id: "cat-1", name: "ชาเขียวมัทฉะ", description: "ชาเขียวเกรดพรีเมียม หอมมัทฉะแท้จากญี่ปุ่น", price: 65, image_url: "🍵", sort_order: 1, status: "available", is_recommended: true, is_favorite: false, daily_limit: 50, daily_sold: 45, max_per_order: 5, options: [] },
  { id: "2", shop_id: "s1", category_id: "cat-4", name: "กาแฟลาเต้เย็น", description: "เอสเพรสโซ่เข้มข้น ผสมนมสด", price: 60, image_url: "☕", sort_order: 2, status: "available", is_recommended: true, is_favorite: true, daily_limit: null, daily_sold: 0, max_per_order: null, options: [] },
  { id: "3", shop_id: "s1", category_id: "cat-3", name: "ชานมไข่มุก", description: "ชานมสูตรพิเศษ พร้อมไข่มุกนุ่มๆ", price: 55, image_url: "🧋", sort_order: 3, status: "available", is_recommended: true, is_favorite: false, daily_limit: 100, daily_sold: 72, max_per_order: 10, options: [] },
  { id: "4", shop_id: "s1", category_id: "cat-1", name: "โกโก้ปั่น", description: "โกโก้เข้มข้น ปั่นละเอียดเนียน", price: 55, image_url: "🍫", sort_order: 4, status: "sold_out", is_recommended: false, is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [] },
  { id: "5", shop_id: "s1", category_id: "cat-1", name: "ชาพีช", description: "ชาผลไม้ หอมกลิ่นพีช", price: 50, image_url: "🍑", sort_order: 5, status: "available", is_recommended: false, is_favorite: true, daily_limit: null, daily_sold: 0, max_per_order: null, options: [] },
  { id: "6", shop_id: "s1", category_id: "cat-3", name: "มัทฉะลาเต้", description: "มัทฉะผสมนมสด หวานมัน", price: 65, image_url: "🍵", sort_order: 6, status: "available", is_recommended: true, is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [] },
  { id: "7", shop_id: "s1", category_id: "cat-4", name: "อเมริกาโน่", description: "เอสเพรสโซ่แท้ เข้มเต็มรสชาติ", price: 45, image_url: "☕", sort_order: 7, status: "available", is_recommended: false, is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [] },
  { id: "8", shop_id: "s1", category_id: "cat-3", name: "ชาไทย", description: "ชาไทยสูตรโบราณ หวานมัน", price: 45, image_url: "🧋", sort_order: 8, status: "available", is_recommended: false, is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [] },
  { id: "9", shop_id: "s1", category_id: "cat-2", name: "ชาร้อนมะลิ", description: "ชามะลิหอมกรุ่น ดื่มอุ่นๆ", price: 35, image_url: "🫖", sort_order: 9, status: "available", is_recommended: false, is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [] },
  { id: "10", shop_id: "s1", category_id: "cat-5", name: "เค้กส้ม", description: "เค้กส้มนุ่มฟู ชุ่มฉ่ำ", price: 75, image_url: "🍰", sort_order: 10, status: "available", is_recommended: false, is_favorite: false, daily_limit: 20, daily_sold: 18, max_per_order: 3, options: [] },
];

export default function MenuPage() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const filtered = allProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1" aria-label="กลับ">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเมนู..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                activeCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-muted hover:bg-gray-200"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="px-4 mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm text-muted">ไม่พบเมนูที่ค้นหา</p>
          </div>
        ) : (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => addItem(product, 1, [], "")}
            />
          ))
        )}
      </div>
    </div>
  );
}
