"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/customer/product-card";
import { useCartStore } from "@/stores/cart-store";
import { createClient } from "@/lib/supabase/client";
import { getCategories, getProducts } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export default function MenuPage() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      setIsLoading(true);
      const [catResult, prodResult] = await Promise.all([
        getCategories(supabase),
        getProducts(supabase),
      ]);

      const cats: { id: string; name: string }[] = [{ id: "", name: "ทั้งหมด" }];
      if (catResult.data) {
        catResult.data.forEach((c) => cats.push({ id: c.id, name: c.name }));
      }
      setCategories(cats);

      if (prodResult.data) setAllProducts(prodResult.data);
      setIsLoading(false);
    }

    loadData();
  }, []);

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
        {isLoading ? (
          // Loading skeleton
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-soft flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-2/3 h-4 rounded bg-gray-200 animate-pulse" />
                <div className="w-full h-3 rounded bg-gray-200 animate-pulse" />
                <div className="w-1/3 h-4 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
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
