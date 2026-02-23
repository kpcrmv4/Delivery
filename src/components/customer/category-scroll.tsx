"use client";

import { cn } from "@/lib/utils";
import { Category } from "@/types";

interface CategoryScrollProps {
  categories: Category[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export default function CategoryScroll({ categories, activeId, onSelect }: CategoryScrollProps) {
  return (
    <div className="px-4">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
        <button
          onClick={() => onSelect("")}
          className={cn(
            "flex flex-col items-center gap-1.5 flex-shrink-0 transition-all",
            !activeId ? "scale-105" : "opacity-70"
          )}
        >
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all",
              !activeId
                ? "bg-primary text-white shadow-float"
                : "bg-white text-gray-600 shadow-soft"
            )}
          >
            🍽️
          </div>
          <span
            className={cn(
              "text-[10px] font-medium",
              !activeId ? "text-primary" : "text-muted"
            )}
          >
            ทั้งหมด
          </span>
        </button>

        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 flex-shrink-0 transition-all",
                isActive ? "scale-105" : "opacity-70"
              )}
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all",
                  isActive
                    ? "bg-primary text-white shadow-float"
                    : "bg-white text-gray-600 shadow-soft"
                )}
              >
                {cat.icon}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isActive ? "text-primary" : "text-muted"
                )}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
