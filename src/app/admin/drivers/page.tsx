"use client";

import { useState } from "react";
import { Plus, Phone, MapPin, Clock, Star, Edit, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const mockDrivers = [
  { id: "d1", name: "สมชาย ดีมาก", phone: "089-123-4567", avatar: "🧑‍💼", status: "available" as const, total_deliveries: 342, rating: 4.8, today_deliveries: 12, joined: "2025-06-15" },
  { id: "d2", name: "สมหญิง ใจดี", phone: "091-234-5678", avatar: "👩‍💼", status: "busy" as const, total_deliveries: 256, rating: 4.9, today_deliveries: 8, joined: "2025-08-20" },
  { id: "d3", name: "วิชัย ส่งไว", phone: "082-345-6789", avatar: "🧑‍💼", status: "available" as const, total_deliveries: 189, rating: 4.7, today_deliveries: 5, joined: "2025-10-01" },
  { id: "d4", name: "นภา จัดส่ง", phone: "093-456-7890", avatar: "👩‍💼", status: "offline" as const, total_deliveries: 78, rating: 4.5, today_deliveries: 0, joined: "2026-01-10" },
];

const statusConfig = {
  available: { label: "ว่าง", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  busy: { label: "กำลังส่ง", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  offline: { label: "ออฟไลน์", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
};

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = mockDrivers.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">พนักงานจัดส่ง</h1>
          <p className="text-sm text-muted mt-0.5">{mockDrivers.length} คน — ว่าง {mockDrivers.filter((d) => d.status === "available").length} คน</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
          <Plus className="w-4 h-4" />
          เพิ่มพนักงาน
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาพนักงาน..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="available">ว่าง</option>
          <option value="busy">กำลังส่ง</option>
          <option value="offline">ออฟไลน์</option>
        </select>
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((driver) => {
          const status = statusConfig[driver.status];
          return (
            <div key={driver.id} className="bg-white rounded-2xl p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-mint-100 rounded-2xl flex items-center justify-center text-3xl">
                    {driver.avatar}
                  </div>
                  <div className={cn("absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white", status.dot)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{driver.name}</h3>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", status.color)}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {driver.phone}
                  </p>
                  <div className="flex gap-4 mt-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      วันนี้ {driver.today_deliveries} งาน
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      รวม {driver.total_deliveries} งาน
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {driver.rating}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400" aria-label="แก้ไข">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-50 text-red-400" aria-label="ลบ">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
