'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Sparkles,
  ArrowLeft,
  Feather,
  BookOpen,
  Shuffle,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramUsername.trim()) {
      setError('يرجى كتابة اسم المستخدم في تيليجرام أولاً');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUsername: telegramUsername.trim(),
          nickname: nickname.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر بدء التحدي');
      }

      router.push(`/game/${data.gameId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-20 relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-12 left-10 text-stone-200/40 select-none pointer-events-none font-poetry text-8xl md:text-9xl -rotate-12">
          بِسْمِ الله
        </div>
        <div className="absolute bottom-10 right-8 text-stone-200/30 select-none pointer-events-none font-poetry text-7xl md:text-8xl rotate-6">
          شِعْر
        </div>

        <div className="max-w-3xl w-full mx-auto text-center z-10 space-y-8">
          {/* Header Bismillah / Classic touch */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200/80 text-amber-900 text-xs sm:text-sm font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-4">
            <h1 className="font-poetry text-5xl sm:text-6xl md:text-7xl font-bold text-stone-900 tracking-tight leading-tight">
              🏆 من أهل الشعر؟
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-stone-700 font-medium max-w-2xl mx-auto leading-relaxed">
              اختبر ذاكرتك الشعرية… هل تحفظ ما يتداوله الناس في كل مكان؟
            </p>
          </div>

          {/* Tagline Badge */}
          <div className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 py-2.5 rounded-full bg-stone-900 text-stone-100 text-sm sm:text-base font-medium shadow-md">
            <span>20 بيتًا</span>
            <span className="text-amber-400">•</span>
            <span>تحدٍّ واحد</span>
            <span className="text-amber-400">•</span>
            <span>لا غش 😭</span>
          </div>

          {/* Call to action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsOpenModal(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-semibold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>ابدأ التحدي</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            <Link
              href="/leaderboard"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-medium text-base border border-stone-300 shadow-xs hover:border-stone-400 transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>مجلس أهل الشعر</span>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
            <div className="p-5 rounded-2xl bg-white/80 border border-stone-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-stone-900 text-base mb-1">
                100 بيت من عيون الشعر
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                مختارات خالدة من المتنبي، امرئ القيس، عنترة، والشافعي، وشوقي.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 border border-stone-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
                <Shuffle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-stone-900 text-base mb-1">
                تحدٍّ فريد لكل لاعب
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                20 بيتاً عشوائياً مختلفاً بترتيب فريد في كل جولة لضمان النزاهة التامة.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 border border-stone-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-stone-900 text-base mb-1">
                تصحيح ذكي ومراجعة حية
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                تطبيع ذكي للهمزات والتشكيل، مع تدقيق يدوي من المشرف وتتويج الفائزين.
              </p>
            </div>
          </div>
        </div>

        {/* Modal for Telegram Username & Starting */}
        {isOpenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="max-w-md w-full bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-2xl relative">
              <button
                onClick={() => setIsOpenModal(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors text-sm font-bold"
              >
                ✕
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-700/10 text-amber-800 mx-auto flex items-center justify-center">
                  <Feather className="w-6 h-6" />
                </div>
                <h3 className="font-poetry text-2xl sm:text-3xl font-bold text-stone-900">
                  قبل أن نبدأ المعركة ⚔️
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">
                  أدخل معرف تيليجرام لنتمكن من توثيق اسمك وتتويجك في لوحة المتصدرين.
                </p>
              </div>

              <form onSubmit={handleStartGame} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 text-right">
                    اسمك في تيليجرام <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      required
                      placeholder="@fuad_tesfaye"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-700 focus:border-amber-700 text-left font-mono text-sm"
                    />
                    <Send className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 text-right">
                    اسم مستعار — اختياري
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: فؤاد أو أبو الطيب"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-700 focus:border-amber-700 text-right text-sm"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-right">
                  <p className="text-xs font-medium text-amber-950 leading-relaxed">
                    جاهز؟ 👀 سنعرض لك صدر البيت، وأنت أكمل العجز.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري إعداد ديوانك الخاص...</span>
                    </>
                  ) : (
                    <>
                      <span>يلا نبدأ 🔥</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
