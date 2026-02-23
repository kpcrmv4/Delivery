export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return `฿${price.toLocaleString("th-TH", { minimumFractionDigits: 0 })}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} ม.`;
  return `${km.toFixed(1)} กม.`;
}

export function getOrderStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: "รอยืนยัน",
    confirmed: "ยืนยันแล้ว",
    preparing: "กำลังเตรียม",
    ready: "พร้อมส่ง",
    delivering: "กำลังจัดส่ง",
    delivered: "ส่งสำเร็จ",
    cancelled: "ยกเลิก",
  };
  return map[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-orange-100 text-orange-700",
    ready: "bg-purple-100 text-purple-700",
    delivering: "bg-cyan-100 text-cyan-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `ORD-${dateStr}-${rand}`;
}
