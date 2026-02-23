"use client";

import { Heart, Plus } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
}

export default function ProductCard({ product, onAddToCart, onToggleFavorite }: ProductCardProps) {
  const isSoldOut = product.status === "sold_out";
  const remainingDaily = product.daily_limit
    ? product.daily_limit - product.daily_sold
    : null;
  const isLowStock = remainingDaily !== null && remainingDaily <= 10 && remainingDaily > 0;

  return (
    <div className={cn(
      "flex gap-3 p-3 bg-white rounded-2xl shadow-soft transition-all",
      isSoldOut && "opacity-60"
    )}>
      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="relative flex-shrink-0">
        <div className="w-24 h-24 rounded-xl bg-mint-100 flex items-center justify-center text-4xl overflow-hidden">
          {product.image_url.startsWith("/") ? (
            <div className="w-full h-full bg-gradient-to-br from-mint-200 to-mint-300 flex items-center justify-center text-3xl">
              ☕
            </div>
          ) : (
            <span>{product.image_url}</span>
          )}
        </div>
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-red-500 px-2 py-0.5 rounded-full">
              หมด
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm text-foreground truncate">
            {product.name}
          </h3>
          <p className="text-xs text-muted mt-0.5 line-clamp-2">
            {product.description}
          </p>
        </Link>

        {isLowStock && (
          <p className="text-[10px] text-orange-500 font-medium mt-1">
            เหลือ {remainingDaily} แก้ววันนี้
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold text-sm">
            {formatPrice(product.price)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite?.();
              }}
              className="p-1.5 rounded-full hover:bg-mint-50 transition-colors"
              aria-label={product.is_favorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
            >
              <Heart
                className={cn(
                  "w-4 h-4",
                  product.is_favorite
                    ? "fill-accent text-accent"
                    : "text-gray-300"
                )}
              />
            </button>

            {!isSoldOut && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart?.();
                }}
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm hover:bg-primary-dark transition-colors"
                aria-label="เพิ่มลงตะกร้า"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
