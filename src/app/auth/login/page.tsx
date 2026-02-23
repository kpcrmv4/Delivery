"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";


export default function LoginPage() {
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
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-3xl mx-auto flex items-center justify-center shadow-float mb-4">
            <span className="text-5xl">🍵</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">ร้านชาบ้านสวน</h1>
          <p className="text-sm text-muted mt-1">ยินดีต้อนรับ! เข้าสู่ระบบเพื่อสั่งซื้อ</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 shadow-card">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground mb-1.5 block">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-foreground mb-1.5 block">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านของคุณ"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button type="button" className="text-xs text-primary font-medium">
                ลืมรหัสผ่าน?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-float disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  เข้าสู่ระบบ
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-muted">หรือ</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* LINE Login */}
          <button className="w-full bg-[#06C755] hover:bg-[#05b34d] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            เข้าสู่ระบบด้วย LINE
          </button>

          {/* Guest */}
          <button
            onClick={() => router.push("/")}
            className="w-full mt-3 text-sm text-muted font-medium py-2 hover:text-foreground transition-colors"
          >
            เข้าชมร้านค้าแบบไม่ต้องเข้าสู่ระบบ
          </button>
        </div>

        {/* Register */}
        <p className="text-center text-sm text-muted mt-6">
          ยังไม่มีบัญชี?{" "}
          <button className="text-primary font-semibold">สมัครสมาชิก</button>
        </p>
      </div>
    </div>
  );
}
