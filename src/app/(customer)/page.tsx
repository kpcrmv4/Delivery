"use client";

import { useState, useEffect } from "react";
import { Search, Bell, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import CategoryScroll from "@/components/customer/category-scroll";
import BannerCarousel from "@/components/customer/banner-carousel";
import ProductCard from "@/components/customer/product-card";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { getCategories, getProducts, getBanners } from "@/lib/supabase/queries";
import type { Category, Product } from "@/types";

const FALLBACK_GRADIENT_COLORS = [
  "linear-gradient(135deg, #4ECDC4 0%, #26A69A 100%)",
  "linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)",
  "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)",
  "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
];

export default function CustomerHomePage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<{ id: string; image_url: string; title: string; subtitle: string; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const addItem = useCartStore((s) => s.addItem);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { profile, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      setIsLoading(true);
      const [catResult, prodResult, bannerResult] = await Promise.all([
        getCategories(supabase),
        getProducts(supabase),
        getBanners(supabase),
      ]);

      if (catResult.data) setCategories(catResult.data);
      if (prodResult.data) setProducts(prodResult.data);
      if (bannerResult.data) {
        const mapped = bannerResult.data.map((b, i) => {
          const raw = b as unknown as Record<string, unknown>;
          return {
            id: b.id,
            image_url: (raw.image_url as string) || "",
            title: (raw.title as string) || "โปรโมชั่นพิเศษ",
            subtitle: (raw.subtitle as string) || "",
            color: FALLBACK_GRADIENT_COLORS[i % FALLBACK_GRADIENT_COLORS.length],
          };
        });
        setBanners(mapped);
      }
      setIsLoading(false);
    }

    loadData();
  }, []);

  const addToCart = (product: Product) => {
    addItem(product, 1, [], "");
  };

  // ── Filtering ──────────────────────────────────────────────

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory
      ? p.category_id === selectedCategory
      : true;
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const greeting = isAuthenticated && profile?.full_name
    ? `สวัสดี, ${profile.full_name}`
    : "สวัสดี, คุณลูกค้า";

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ───── Header ───── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {greeting} 👋
            </h1>
            <p className="text-sm text-muted mt-0.5">อยากดื่มอะไรวันนี้?</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              className="relative w-10 h-10 rounded-full bg-mint-50 flex items-center justify-center hover:bg-mint-100 transition-colors"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>

            {/* Cart icon with badge */}
            <Link
              href="/cart"
              className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label="ตะกร้าสินค้า"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ───── Search Bar ───── */}
      <div className="px-4 mt-4">
        <div className="relative flex items-center bg-white rounded-xl shadow-soft">
          <Search className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเมนู..."
            className="w-full py-3 pl-10 pr-12 bg-transparent text-sm text-foreground placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            className="absolute right-2 p-1.5 rounded-lg bg-mint-50 hover:bg-mint-100 transition-colors"
            aria-label="ตัวกรอง"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {isLoading ? (
        // ───── Loading Skeleton ─────
        <div className="px-4 mt-5 space-y-6">
          {/* Category skeleton */}
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse" />
                <div className="w-10 h-3 rounded bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
          {/* Banner skeleton */}
          <div className="h-36 rounded-2xl bg-gray-200 animate-pulse" />
          {/* Product skeletons */}
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
      ) : (
        <>
          {/* ───── Categories ───── */}
          <section className="mt-5">
            <CategoryScroll
              categories={categories}
              activeId={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </section>

          {/* ───── Banner Carousel ───── */}
          {banners.length > 0 && (
            <section className="mt-5">
              <BannerCarousel banners={banners} />
            </section>
          )}

          {/* ───── Popular Section Heading ───── */}
          <section className="mt-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground">เมนูยอดนิยม</h2>
              <Link
                href="/menu"
                className="text-sm font-medium text-primary hover:underline"
              >
                ดูทั้งหมด
              </Link>
            </div>

            {/* ───── Product List ───── */}
            <div className="flex flex-col gap-3">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => addToCart(product)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl mb-3">🔍</span>
                  <p className="text-sm text-muted">ไม่พบเมนูที่ค้นหา</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                    }}
                    className="mt-2 text-sm font-medium text-primary hover:underline"
                  >
                    ล้างตัวกรอง
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
