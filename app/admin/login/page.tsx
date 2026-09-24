'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, User, Loader2, ArrowLeft, Info } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      router.push('/admin');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 text-stone-100 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="font-poetry text-2xl sm:text-3xl font-bold text-stone-900">
              دخول لوحة المشرف
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              خاص بإدارة تحدي «أهل الشعر»، تصحيح الإجابات، واعتماد الفائزين.
            </p>
          </div>

          {/* Seed credentials callout for user convenience */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-right flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold">بيانات المشرف الافتراضية:</p>
              <p>اسم المستخدم: <span className="font-mono font-bold">admin</span> أو <span className="font-mono font-bold">fuad</span></p>
              <p>كلمة المرور: <span className="font-mono font-bold">admin123</span></p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 text-right">
                اسم المستخدم أو البريد
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700 text-right text-sm"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700 text-right text-sm"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
