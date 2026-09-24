'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, Feather, Loader2, Sparkles } from 'lucide-react';

interface PoemWithStats {
  id: number;
  title: string;
  poet: string;
  era: string;
  firstLine: string;
  answer: string;
  totalAsked: number;
  totalCorrect: number;
}

export default function AdminPoemsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [poems, setPoems] = useState<PoemWithStats[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPoems() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/poems');
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        setPoems(data.poems || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadPoems();
  }, [router]);

  const filteredPoems = poems.filter(
    (p) =>
      p.poet.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.firstLine.toLowerCase().includes(search.toLowerCase()) ||
      p.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poetry text-2xl sm:text-3xl font-bold text-stone-900">
            📖 بنك الـ 100 بيت وإحصائيات الدقة
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            استعرض جميع الأبيات المعتمدة، شعراءها، ومعدلات إجابة اللاعبين عليها لمعرفة أصعب الأبيات.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md w-full">
        <input
          type="text"
          placeholder="ابحث بالشاعر، العنوان، أو كلمات البيت..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-700 text-right text-xs sm:text-sm"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
      </div>

      {/* Poems Table / Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-2" />
          <p className="text-xs text-stone-500">جاري تحميل ديوان الأبيات...</p>
        </div>
      ) : filteredPoems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center text-xs text-stone-400">
          لم يتم العثور على أبيات مطابقة للبحث.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div className="divide-y divide-stone-100">
            {filteredPoems.map((p, idx) => {
              const accuracy =
                p.totalAsked > 0
                  ? Math.round((p.totalCorrect / p.totalAsked) * 100)
                  : null;

              return (
                <div
                  key={p.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-600 flex items-center justify-center font-mono text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        {p.poet}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-500 font-medium">{p.era}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-500">{p.title}</span>
                    </div>

                    {/* Both hemistichs */}
                    <div className="font-poetry text-base sm:text-lg text-stone-900 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-bold text-stone-800">
                        «{p.firstLine}»
                      </span>
                      <span className="text-amber-800/60 text-xs font-sans">...</span>
                      <span className="font-bold text-amber-950">
                        «{p.answer}»
                      </span>
                    </div>
                  </div>

                  {/* Frequency and accuracy badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs">
                      <span className="text-stone-400 block text-[11px]">معدل الحل:</span>
                      {accuracy !== null ? (
                        <span
                          className={`font-bold ${
                            accuracy >= 70
                              ? 'text-emerald-700'
                              : accuracy >= 40
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {accuracy}% ({p.totalCorrect}/{p.totalAsked})
                        </span>
                      ) : (
                        <span className="text-stone-400">لم يُختبر بعد</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
