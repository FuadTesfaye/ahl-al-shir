'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Gamepad2,
  Trophy,
  CheckCircle2,
  Crown,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface StatsData {
  totalPlayers: number;
  totalGames: number;
  totalPoems: number;
  totalWinners: number;
  unreviewedGames: number;
  averageScore: number;
  perfectScores: number;
}

interface RecentGame {
  id: string;
  score: number;
  maxScore: number;
  isReviewed: boolean;
  isWinner: boolean;
  startedAt: string;
  completedAt: string;
  telegramUsername: string;
  nickname?: string | null;
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);

        const [statsRes, gamesRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/games'),
        ]);

        if (statsRes.status === 401 || gamesRes.status === 401) {
          router.push('/admin/login');
          return;
        }

        const statsData = await statsRes.json();
        const gamesData = await gamesRes.json();

        setStats(statsData);
        setRecentGames((gamesData.games || []).slice(0, 10));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [router]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-2" />
        <p className="text-xs text-stone-500">جاري تحميل إحصائيات لوحة المشرف...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poetry text-3xl font-bold text-stone-900">
            📊 نظرة عامة على ديوان التحدي
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            متابعة فورية لنشاط اللاعبين، الإجابات، والنتائج.
          </p>
        </div>

        <Link
          href="/admin/games"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs"
        >
          <span>استعراض وتصحيح جميع الألعاب</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">اللاعبون</span>
            <Users className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {stats?.totalPlayers || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">الألعاب</span>
            <Gamepad2 className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {stats?.totalGames || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">متوسط الدرجات</span>
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-950">
            {stats?.averageScore || 0} <span className="text-xs text-stone-400">/ 20</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">العلامات الكاملة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {stats?.perfectScores || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">الفائزون المعتمدون</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {stats?.totalWinners || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">بانتظار المراجعة</span>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {stats?.unreviewedGames || 0}
          </div>
        </div>
      </div>

      {/* Recent Submissions for Manual Review */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-poetry text-xl font-bold text-stone-900">
              👥 أحدث الجلسات والتصحيح اليدوي
            </h2>
            <p className="text-xs text-stone-500">
              اضغط على أي جلسة لاستعراض إجابات المتسابق بيتاً بيتاً وتعديل الدرجات أو تتويجه.
            </p>
          </div>
          <Link
            href="/admin/games"
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentGames.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400">
            لا توجد ألعاب مسجلة حتى الآن.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentGames.map((game) => (
              <div
                key={game.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors rounded-xl px-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-stone-800 text-sm">
                    {game.score >= 16 ? '🔥' : game.score >= 10 ? '📚' : '📜'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 font-mono text-sm" dir="ltr">
                        {game.telegramUsername}
                      </span>
                      {game.isWinner && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] inline-flex items-center gap-1">
                          <Crown className="w-3 h-3" /> فائز معتمد
                        </span>
                      )}
                      {game.isReviewed ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          تمت المراجعة ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-semibold">
                          جديد
                        </span>
                      )}
                    </div>
                    {game.nickname && (
                      <span className="text-xs text-stone-500 font-poetry block">
                        «{game.nickname}»
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="font-poetry text-xl font-bold text-amber-950">
                      {game.score} / {game.maxScore}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      {new Date(game.startedAt).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/admin/games/${game.id}`}
                    className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                  >
                    <span>فحص وتصحيح</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
