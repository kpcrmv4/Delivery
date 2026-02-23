"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Store } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-float mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted mt-1">ร้านชาบ้านสวน</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="text-sm font-medium mb-1.5 block">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" autoComplete="email" />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password" className="text-sm font-medium mb-1.5 block">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="admin-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-70">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
