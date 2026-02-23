"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface BannerCarouselProps {
  banners: { id: string; image_url: string; title?: string; subtitle?: string; color?: string }[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  if (banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mx-4">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="min-w-full h-36 rounded-2xl flex items-center px-6"
            style={{
              background: banner.color || "linear-gradient(135deg, #4ECDC4 0%, #26A69A 100%)",
            }}
          >
            <div className="text-white">
              <p className="text-sm font-medium opacity-90">{banner.subtitle || "โปรโมชั่นพิเศษ"}</p>
              <h3 className="text-xl font-bold mt-1">{banner.title || "สั่งวันนี้ส่งฟรี!"}</h3>
              <button className="mt-2 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                ดูเพิ่มเติม
              </button>
            </div>
            <div className="ml-auto text-5xl">
              {banner.image_url}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"
              )}
              aria-label={`แบนเนอร์ ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
