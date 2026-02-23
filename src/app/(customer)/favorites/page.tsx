"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import ProductCard from "@/components/customer/product-card";
import { createClient } from "@/lib/supabase/client";
import { getProducts } from "@/lib/supabase/queries";
import type { Product } from "@/types";

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadFavorites() {
      setIsLoading(true);
      const { data } = await getProducts(supabase, undefined, { recommended: true });
      if (data) setProducts(data);
      setIsLoading(false);
    }

    loadFavorites();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white px-4 py-4 shadow-sm">
          <h1 className="text-lg font-bold">เมนูที่ชอบ</h1>
          <div className="w-16 h-3 bg-gray-200 animate-pulse rounded mt-1" />
        </div>
        <div className="px-4 mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-soft flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-2/3 h-4 rounded bg-gray-200 animate-pulse" />
                <div className="w-full h-3 rounded bg-gray-200 animate-pulse" />
                <div className="w-1/3 h-4 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
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
        <p className="text-xs text-muted mt-0.5">{products.length} รายการ</p>
      </div>
      <div className="px-4 mt-4 space-y-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
