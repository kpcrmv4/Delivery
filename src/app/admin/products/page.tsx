"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit, Trash2, Package, Filter, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getProducts, getShopId, deleteProduct as deleteProductQuery } from "@/lib/supabase/queries";
import type { Product } from "@/types";

type ProductStatus = "available" | "sold_out" | "hidden";

const filterTabs: { key: string; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "available", label: "พร้อมขาย" },
  { key: "sold_out", label: "หมด" },
  { key: "hidden", label: "ซ่อน" },
];

const statusConfig: Record<
  ProductStatus,
  { label: string; color: string; dot: string }
> = {
  available: {
    label: "พร้อมขาย",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  sold_out: {
    label: "สินค้าหมด",
    color: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  hidden: {
    label: "ซ่อน",
    color: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const shopId = getShopId();

  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await getProducts(supabase, shopId);
    if (data) setProducts(data);
    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || product.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filterCounts: Record<string, number> = {
    all: products.length,
    available: products.filter((p) => p.status === "available").length,
    sold_out: products.filter((p) => p.status === "sold_out").length,
    hidden: products.filter((p) => p.status === "hidden").length,
  };

  async function toggleStatus(id: string) {
    const product = products.find((p) => p.id === id);
    if (!product || product.status === "sold_out") return;

    const newStatus: ProductStatus =
      product.status === "available" ? "hidden" : "available";

    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: newStatus } : p
        )
      );
    }
  }

  async function handleDeleteProduct(id: string) {
    const supabase = createClient();
    const { error } = await deleteProductQuery(supabase, id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">จัดการสินค้า</h1>
            <p className="text-sm text-muted">
              {products.length} รายการ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          {/* Add button */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors shadow-soft whitespace-nowrap">
            <Plus className="w-4 h-4" />
            เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-100 shadow-soft w-fit">
        <Filter className="w-4 h-4 text-muted ml-2 mr-1" />
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeFilter === tab.key
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground hover:bg-gray-50"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 text-xs",
                activeFilter === tab.key
                  ? "text-white/80"
                  : "text-muted"
              )}
            >
              ({filterCounts[tab.key]})
            </span>
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted text-sm">ไม่พบสินค้า</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const status = statusConfig[product.status];
            const limitReached =
              product.daily_limit !== null &&
              product.daily_sold >= product.daily_limit;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-soft hover:shadow-card transition-shadow group"
              >
                {/* Image / Emoji area */}
                <div className="relative bg-mint-100 h-36 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">{"📦"}</span>
                  )}
                  {/* Status badge */}
                  <div
                    className={cn(
                      "absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      status.color
                    )}
                  >
                    <span
                      className={cn("w-1.5 h-1.5 rounded-full", status.dot)}
                    />
                    {status.label}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {((product as unknown as Record<string, unknown>).category as Record<string, string> | undefined)?.name || ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.daily_limit !== null && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          limitReached
                            ? "bg-red-50 text-red-600"
                            : "bg-mint-50 text-mint-600"
                        )}
                      >
                        ขายแล้ว {product.daily_sold}/{product.daily_limit}
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {/* Toggle switch */}
                    <button
                      onClick={() => toggleStatus(product.id)}
                      className="relative"
                      aria-label={
                        product.status === "available"
                          ? "ปิดการขาย"
                          : "เปิดการขาย"
                      }
                      disabled={product.status === "sold_out"}
                    >
                      <div
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors",
                          product.status === "available"
                            ? "bg-primary"
                            : "bg-gray-300",
                          product.status === "sold_out" && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
                            product.status === "available"
                              ? "translate-x-[18px]"
                              : "translate-x-0.5"
                          )}
                        />
                      </div>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        aria-label="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
