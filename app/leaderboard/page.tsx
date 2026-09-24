'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  ArrowLeft,
  Loader2,
  Calendar,
  Flame,
} from 'lucide-react';

interface LeaderboardEntry {
  gameId: string;
  score: number;
  maxScore: number;
  isWinner: boolean;
  startedAt: string;
  completedAt: string;
  telegramUsername: string;
  nickname?: string | null;
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'winners'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل جلب لوحة الصدارة');
        setLeaderboard(data.leaderboard || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const displayedList =
    filter === 'winners'
      ? leaderboard.filter((item) => item.isWinner)
      : leaderboard;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-14 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-700" />
            <span>لوحة الشرف والتتويج</span>
          </div>
          <h1 className="font-poetry text-4xl sm:text-5xl font-bold text-stone-900">
            🏆 مَجْلِسُ أَهْلِ الشِّعْر
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
            أعلى النتائج المسجلة في تحدي إكمال الأبيات الشعرية، مفرزة حسب الدقة والسرعة.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            جميع المتصدرين ({leaderboard.length})
          </button>
          <button
            onClick={() => setFilter('winners')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              filter === 'winners'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>الفائزون المعتمدون ({leaderboard.filter((x) => x.isWinner).length})</span>
          </button>
        </div>

        {/* Leaderboard Table / Cards */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-2" />
            <p className="text-xs text-stone-500">جاري جمع نتائج أهل الشعر...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-white border border-stone-300 text-center text-sm text-rose-700">
            {error}
          </div>
        ) : displayedList.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-stone-200/90 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-poetry text-xl font-bold text-stone-900">
              المجلس ينتظر فارسه الأول!
            </h3>
            <p className="text-xs text-stone-500">
              كن أول من يخوض التحدي ويسجل اسمه في قمة المتصدرين.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-800 text-white text-sm font-semibold"
            >
              ابدأ الآن
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
            <div className="divide-y divide-stone-100">
              {displayedList.map((entry, index) => {
                const rank = index + 1;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;

                return (
                  <div
                    key={entry.gameId}
                    className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors hover:bg-stone-50/70 ${
                      entry.isWinner ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Rank & Player */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Rank Icon or Badge */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-sm sm:text-base ${
                          isTop1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isTop2
                            ? 'bg-stone-200 text-stone-800'
                            : isTop3
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {isTop1 ? (
                          <Crown className="w-5 h-5 text-amber-600 fill-amber-500" />
                        ) : (
                          <span>{rank}</span>
                        )}
                      </div>

                      {/* Username & Nickname */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 font-mono text-sm sm:text-base" dir="ltr">
                            {entry.telegramUsername}
                          </span>
                          {entry.isWinner && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] shadow-xs">
                              👑 فائز معتمد
                            </span>
                          )}
                        </div>
                        {entry.nickname && (
                          <span className="text-xs text-stone-500 font-poetry block">
                            «{entry.nickname}»
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score & View details */}
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <span className="font-poetry text-2xl sm:text-3xl font-bold text-amber-950">
                          {entry.score}
                        </span>
                        <span className="text-stone-400 text-xs sm:text-sm">
                          {' '}/ {entry.maxScore}
                        </span>
                      </div>

                      <Link
                        href={`/result/${entry.gameId}`}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                      >
                        النتيجة
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Game CTA */}
        <div className="pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-base shadow-md transition-all active:scale-95"
          >
            <span>خُض التحدي الآن لتنافسهم</span>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
