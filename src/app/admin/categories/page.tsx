"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, GripVertical, FolderOpen, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  getCategoriesWithCount,
  getShopId,
  upsertCategory,
  deleteCategory as deleteCategoryQuery,
} from "@/lib/supabase/queries";

interface CategoryWithCount {
  id: string;
  shop_id: string;
  name: string;
  icon: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

const emojiOptions = [
  "🧊", "☕", "🧋", "🍵", "🥤", "🍰", "🥐", "🍩",
  "🍪", "🧁", "🎂", "🍫", "🍋", "🥛", "🍹", "🫧",
  "🍓", "🥝", "🍑", "🫐", "🥥", "🍦", "🧇", "🥞",
];

interface FormState {
  id: string | null;
  name: string;
  emoji: string;
  sortOrder: number;
}

const emptyForm: FormState = {
  id: null,
  name: "",
  emoji: "🧊",
  sortOrder: 0,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const shopId = getShopId();

  const fetchCategories = useCallback(async () => {
    const supabase = createClient();
    const { data } = await getCategoriesWithCount(supabase, shopId);
    if (data) setCategories(data as CategoryWithCount[]);
    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function openAddForm() {
    const maxSort = categories.reduce(
      (max, c) => Math.max(max, c.sort_order),
      0
    );
    setForm({ ...emptyForm, sortOrder: maxSort + 1 });
    setShowEmojiPicker(false);
  }

  function openEditForm(category: CategoryWithCount) {
    setForm({
      id: category.id,
      name: category.name,
      emoji: category.icon,
      sortOrder: category.sort_order,
    });
    setShowEmojiPicker(false);
  }

  function closeForm() {
    setForm(null);
    setShowEmojiPicker(false);
  }

  async function saveForm() {
    if (!form || !form.name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const payload: Record<string, unknown> = {
      shop_id: shopId,
      name: form.name.trim(),
      icon: form.emoji,
      sort_order: form.sortOrder,
    };
    if (form.id) payload.id = form.id;

    const { error } = await upsertCategory(supabase, payload as Parameters<typeof upsertCategory>[1]);
    if (!error) {
      await fetchCategories();
      closeForm();
    }
    setSaving(false);
  }

  async function toggleActive(id: string) {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", id);

    if (!error) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_active: !c.is_active } : c
        )
      );
    }
  }

  async function handleDeleteCategory(id: string) {
    const supabase = createClient();
    const { error } = await deleteCategoryQuery(supabase, id);
    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (form?.id === id) closeForm();
    }
  }

  const sortedCategories = [...categories].sort(
    (a, b) => a.sort_order - b.sort_order
  );

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              จัดการหมวดหมู่
            </h1>
            <p className="text-sm text-muted">
              {categories.length} หมวดหมู่
            </p>
          </div>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors shadow-soft"
        >
          <Plus className="w-4 h-4" />
          เพิ่มหมวดหมู่
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category List */}
        <div className="lg:col-span-2 space-y-3">
          {sortedCategories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted text-sm">ยังไม่มีหมวดหมู่</p>
            </div>
          ) : (
            sortedCategories.map((category) => (
              <div
                key={category.id}
                className={cn(
                  "bg-white rounded-2xl border border-gray-100 p-4 shadow-soft hover:shadow-card transition-all group",
                  !category.is_active && "opacity-60"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Drag handle */}
                  <button
                    className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
                    aria-label="ลากเพื่อเรียง"
                  >
                    <GripVertical className="w-5 h-5" />
                  </button>

                  {/* Emoji icon */}
                  <div className="w-12 h-12 bg-mint-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {category.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {category.product_count} สินค้า &middot; ลำดับที่{" "}
                      {category.sort_order}
                    </p>
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={() => toggleActive(category.id)}
                    className="relative flex-shrink-0"
                    aria-label={
                      category.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"
                    }
                  >
                    <div
                      className={cn(
                        "w-10 h-6 rounded-full transition-colors",
                        category.is_active ? "bg-primary" : "bg-gray-300"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
                          category.is_active
                            ? "translate-x-[18px]"
                            : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </button>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(category)}
                      className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      aria-label="แก้ไข"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add / Edit Form */}
        <div className="lg:col-span-1">
          {form !== null ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-5 sticky top-24">
              {/* Form header */}
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-foreground">
                  {form.id ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-1.5 text-muted hover:text-foreground hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="ปิด"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Emoji picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ไอคอน
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-16 h-16 bg-mint-50 hover:bg-mint-100 border-2 border-dashed border-mint-300 rounded-xl flex items-center justify-center text-3xl transition-colors"
                  >
                    {form.emoji}
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-20 left-0 z-10 bg-white border border-gray-200 rounded-xl shadow-card p-3 w-64">
                      <div className="grid grid-cols-6 gap-1">
                        {emojiOptions.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setForm((prev) =>
                                prev ? { ...prev, emoji } : prev
                              );
                              setShowEmojiPicker(false);
                            }}
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center text-xl hover:bg-mint-50 transition-colors",
                              form.emoji === emoji &&
                                "bg-mint-100 ring-2 ring-primary"
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Name input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                  placeholder="เช่น เครื่องดื่มเย็น"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Sort order */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ลำดับการแสดง
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, sortOrder: Number(e.target.value) || 1 }
                        : prev
                    )
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={saveForm}
                  disabled={!form.name.trim() || saving}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    form.name.trim() && !saving
                      ? "bg-primary hover:bg-primary-dark text-white shadow-soft"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : form.id ? (
                    "บันทึกการแก้ไข"
                  ) : (
                    "เพิ่มหมวดหมู่"
                  )}
                </button>
                <button
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-muted hover:bg-gray-200 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-8 text-center">
              <div className="w-16 h-16 bg-mint-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-mint-400" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">
                จัดการหมวดหมู่
              </h3>
              <p className="text-xs text-muted leading-relaxed mb-4">
                เลือกหมวดหมู่เพื่อแก้ไข
                <br />
                หรือกดปุ่มเพิ่มเพื่อสร้างหมวดหมู่ใหม่
              </p>
              <button
                onClick={openAddForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-mint-50 hover:bg-mint-100 text-primary rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                เพิ่มหมวดหมู่ใหม่
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
