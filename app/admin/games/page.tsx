'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  Crown,
  Search,
  ArrowLeft,
  Loader2,
  Filter,
} from 'lucide-react';

interface GameRow {
  id: string;
  score: number;
  maxScore: number;
  status: string;
  isReviewed: boolean;
  isWinner: boolean;
  startedAt: string;
  completedAt: string;
  telegramUsername: string;
  nickname?: string | null;
}

export default function AdminGamesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<GameRow[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unreviewed' | 'winners'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/games');
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        setGames(data.games || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, [router]);

  const filteredGames = games.filter((g) => {
    const matchesSearch =
      g.telegramUsername.toLowerCase().includes(search.toLowerCase()) ||
      (g.nickname && g.nickname.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'unreviewed') return !g.isReviewed;
    if (filter === 'winners') return g.isWinner;

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poetry text-2xl sm:text-3xl font-bold text-stone-900">
            📜 سجل الألعاب والتصحيح اليدوي
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            استعرض إجابات كل متسابق بالتفصيل، عدل الدرجات يدوياً، وتوج الفائزين.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="ابحث باسم المستخدم أو اللقب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-700 text-right text-xs sm:text-sm"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            الكل ({games.length})
          </button>
          <button
            onClick={() => setFilter('unreviewed')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'unreviewed'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-orange-800 hover:bg-orange-50 border border-orange-200'
            }`}
          >
            بحاجة لمراجعة ({games.filter((x) => !x.isReviewed).length})
          </button>
          <button
            onClick={() => setFilter('winners')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              filter === 'winners'
                ? 'bg-amber-800 text-white'
                : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>الفائزون ({games.filter((x) => x.isWinner).length})</span>
          </button>
        </div>
      </div>

      {/* Games List Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-2" />
          <p className="text-xs text-stone-500">جاري تحميل سجل الألعاب...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center text-xs text-stone-400">
          لا توجد نتائج مطابقة لبحثك.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div className="divide-y divide-stone-100">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold text-sm">
                    {game.score}
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
                          بانتظار المراجعة
                        </span>
                      )}
                    </div>
                    {game.nickname && (
                      <span className="text-xs text-stone-500 font-poetry">
                        «{game.nickname}»
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-xs text-stone-400 block">
                      {new Date(game.startedAt).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/admin/games/${game.id}`}
                    className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>فتح وتصحيح الإجابات</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
