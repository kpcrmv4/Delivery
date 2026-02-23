"use client";

import { useState } from "react";
import { Search, Bell, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import CategoryScroll from "@/components/customer/category-scroll";
import BannerCarousel from "@/components/customer/banner-carousel";
import ProductCard from "@/components/customer/product-card";
import { useCartStore } from "@/stores/cart-store";
import type { Category, Product } from "@/types";

// ─── Mock Data ───────────────────────────────────────────────

const categories: Category[] = [
  { id: "cat-1", name: "เครื่องดื่มเย็น", icon: "🧊", image_url: "", shop_id: "shop-1", sort_order: 1, is_active: true },
  { id: "cat-2", name: "เครื่องดื่มร้อน", icon: "☕", image_url: "", shop_id: "shop-1", sort_order: 2, is_active: true },
  { id: "cat-3", name: "ชานม", icon: "🧋", image_url: "", shop_id: "shop-1", sort_order: 3, is_active: true },
  { id: "cat-4", name: "กาแฟ", icon: "🫘", image_url: "", shop_id: "shop-1", sort_order: 4, is_active: true },
  { id: "cat-5", name: "ของหวาน", icon: "🍰", image_url: "", shop_id: "shop-1", sort_order: 5, is_active: true },
  { id: "cat-6", name: "เบเกอรี่", icon: "🥐", image_url: "", shop_id: "shop-1", sort_order: 6, is_active: true },
];

const products: Product[] = [
  {
    id: "prod-1", shop_id: "shop-1", category_id: "cat-1", name: "ชาเขียวมัทฉะ",
    description: "ชาเขียวมัทฉะเกรดพรีเมียมจากญี่ปุ่น หอมละมุน", price: 65,
    image_url: "🍵", sort_order: 1, status: "available", is_recommended: true,
    is_favorite: true, daily_limit: null, daily_sold: 0, max_per_order: null, options: [],
  },
  {
    id: "prod-2", shop_id: "shop-1", category_id: "cat-4", name: "กาแฟลาเต้เย็น",
    description: "กาแฟคั่วกลางผสมนมสดรสชาติกลมกล่อม", price: 55,
    image_url: "☕", sort_order: 2, status: "available", is_recommended: true,
    is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [],
  },
  {
    id: "prod-3", shop_id: "shop-1", category_id: "cat-3", name: "ชานมไข่มุก",
    description: "ชานมสูตรต้นตำรับ เสิร์ฟพร้อมไข่มุกนุ่มหนึบ", price: 55,
    image_url: "🧋", sort_order: 3, status: "available", is_recommended: true,
    is_favorite: true, daily_limit: 50, daily_sold: 45, max_per_order: 5, options: [],
  },
  {
    id: "prod-4", shop_id: "shop-1", category_id: "cat-1", name: "โกโก้ปั่น",
    description: "โกโก้เข้มข้นปั่นกับน้ำแข็ง ท็อปด้วยวิปครีม", price: 60,
    image_url: "🍫", sort_order: 4, status: "available", is_recommended: false,
    is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [],
  },
  {
    id: "prod-5", shop_id: "shop-1", category_id: "cat-1", name: "ชาพีช",
    description: "ชาหอมกลิ่นลูกพีชสดชื่น เหมาะกับอากาศร้อน", price: 45,
    image_url: "🍑", sort_order: 5, status: "sold_out", is_recommended: false,
    is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [],
  },
  {
    id: "prod-6", shop_id: "shop-1", category_id: "cat-2", name: "มัทฉะลาเต้",
    description: "มัทฉะร้อนตีฟองนม เข้มข้นหอมละมุน", price: 75,
    image_url: "🍵", sort_order: 6, status: "available", is_recommended: true,
    is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [],
  },
  {
    id: "prod-7", shop_id: "shop-1", category_id: "cat-4", name: "อเมริกาโน่",
    description: "กาแฟดำสไตล์อิตาเลียน เข้มกลมกล่อม", price: 45,
    image_url: "☕", sort_order: 7, status: "available", is_recommended: false,
    is_favorite: true, daily_limit: null, daily_sold: 0, max_per_order: null, options: [],
  },
  {
    id: "prod-8", shop_id: "shop-1", category_id: "cat-3", name: "ชาไทย",
    description: "ชาไทยสูตรโบราณ หวานมันกลมกล่อม", price: 35,
    image_url: "🥤", sort_order: 8, status: "available", is_recommended: true,
    is_favorite: false, daily_limit: null, daily_sold: 0, max_per_order: null, options: [],
  },
];

const banners = [
  {
    id: "banner-1",
    image_url: "🛵",
    title: "ส่งฟรีทุกออเดอร์!",
    subtitle: "สั่งขั้นต่ำ 150 บาท",
    color: "linear-gradient(135deg, #4ECDC4 0%, #26A69A 100%)",
  },
  {
    id: "banner-2",
    image_url: "🧋",
    title: "ซื้อ 1 แถม 1",
    subtitle: "เฉพาะเครื่องดื่มชา",
    color: "linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)",
  },
  {
    id: "banner-3",
    image_url: "🎉",
    title: "สมาชิกใหม่ลด 50%",
    subtitle: "ใช้โค้ด NEWBIE50",
    color: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)",
  },
];

// ─── Component ───────────────────────────────────────────────

export default function CustomerHomePage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const addItem = useCartStore((s) => s.addItem);
  const itemCount = useCartStore((s) => s.getItemCount());

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

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ───── Header ───── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              สวัสดี, คุณลูกค้า 👋
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

      {/* ───── Categories ───── */}
      <section className="mt-5">
        <CategoryScroll
          categories={categories}
          activeId={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </section>

      {/* ───── Banner Carousel ───── */}
      <section className="mt-5">
        <BannerCarousel banners={banners} />
      </section>

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
    </div>
  );
}
