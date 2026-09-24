'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Crown,
  CheckCircle2,
  XCircle,
  Save,
  Feather,
  Loader2,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';

interface QuestionDetail {
  id: number;
  questionNumber: number;
  poet: string;
  era: string;
  title: string;
  firstLine: string;
  expectedAnswer: string;
  userAnswer?: string | null;
  isCorrect: boolean;
  points: number;
  adminGraded: boolean;
  answeredAt?: string | null;
}

interface GameDetail {
  id: string;
  score: number;
  maxScore: number;
  status: string;
  isReviewed: boolean;
  isWinner: boolean;
  adminNotes?: string | null;
  startedAt: string;
  completedAt?: string | null;
  telegramUsername: string;
  nickname?: string | null;
}

export default function AdminGameDetailPage() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GameDetail | null>(null);
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingWinner, setSavingWinner] = useState(false);
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGameDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/games/${gameId}`);
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'تعذر تحميل بيانات اللعبة');

        setGame(data.game);
        setQuestions(data.questions);
        setAdminNotes(data.game.adminNotes || '');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    if (gameId) {
      loadGameDetails();
    }
  }, [gameId, router]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleWinner = async () => {
    if (!game) return;
    setSavingWinner(true);
    try {
      const newWinnerStatus = !game.isWinner;
      const res = await fetch('/api/admin/winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          isWinner: newWinnerStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تحديث حالة الفائز');

      setGame({ ...game, isWinner: newWinnerStatus });
      showNotification(data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      alert(msg);
    } finally {
      setSavingWinner(false);
    }
  };

  const handleGradeQuestion = async (
    questionId: number,
    newIsCorrect: boolean,
    points: number
  ) => {
    setGradingId(questionId);
    try {
      const res = await fetch('/api/admin/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          isCorrect: newIsCorrect,
          points,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ التقييم');

      // Update question locally
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, isCorrect: newIsCorrect, points, adminGraded: true }
            : q
        )
      );

      // Update game score and review status
      setGame((prev) =>
        prev
          ? { ...prev, score: data.newScore, isReviewed: true }
          : prev
      );

      showNotification('تم تحديث درجة السؤال والمجموع بنجاح!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      alert(msg);
    } finally {
      setGradingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-2" />
        <p className="text-xs text-stone-500">جاري تحميل تفاصيل الجلسة للتصحيح...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-700 font-bold">{error || 'لم يتم العثور على الجلسة'}</p>
        <Link href="/admin/games" className="text-xs font-bold text-amber-800 underline">
          العودة لقائمة الألعاب
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-stone-900 text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/games"
            className="w-9 h-9 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-poetry text-2xl sm:text-3xl font-bold text-stone-900">
              تصحيح ومراجعة إجابات اللاعب
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              معرف اللعبة: {game.id}
            </p>
          </div>
        </div>

        {/* Winner Toggle Button */}
        <button
          onClick={handleToggleWinner}
          disabled={savingWinner}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
            game.isWinner
              ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 border border-amber-600'
              : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
          }`}
        >
          <Crown className={`w-4 h-4 ${game.isWinner ? 'fill-stone-950' : 'text-amber-600'}`} />
          <span>
            {game.isWinner ? '👑 فائز معتمد (إلغاء التتويج)' : 'تتويج اللاعب كفائز رسمي 👑'}
          </span>
        </button>
      </div>

      {/* Player Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-300/80 flex items-center justify-center text-amber-900 font-poetry text-2xl font-bold">
            {game.score >= 16 ? '👑' : '📜'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-stone-900" dir="ltr">
                {game.telegramUsername}
              </span>
              {game.isWinner && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs">
                  فائز معتمد 👑
                </span>
              )}
            </div>
            {game.nickname && (
              <p className="text-xs text-stone-500 font-poetry mt-0.5">
                الاسم المستعار: «{game.nickname}»
              </p>
            )}
            <p className="text-[11px] text-stone-400 mt-1">
              بدأ الاختبار: {new Date(game.startedAt).toLocaleString('ar-EG')}
            </p>
          </div>
        </div>

        {/* Score & Review Status */}
        <div className="flex items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs text-stone-400 block font-medium">الدرجة الإجمالية الحالية</span>
            <div className="font-poetry text-4xl sm:text-5xl font-black text-amber-950">
              {game.score}{' '}
              <span className="text-xl sm:text-2xl text-stone-400 font-sans font-normal">
                / {game.maxScore}
              </span>
            </div>
          </div>

          <div className="border-r border-stone-200 pr-6">
            <span className="text-xs text-stone-400 block font-medium mb-1">حالة التدقيق</span>
            {game.isReviewed ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> تمت المراجعة
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold inline-flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> بانتظار المراجعة
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Questions Grading List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-poetry text-xl font-bold text-stone-900">
            أبيات الاختبار الـ 20 وتدقيق الإجابات
          </h2>
          <span className="text-xs text-stone-500">
            يمكنك الضغط على «صحيحة» أو «خاطئة» لتعديل درجات أي سؤال فوراً.
          </span>
        </div>

        <div className="space-y-3">
          {questions.map((q) => {
            const isProcessing = gradingId === q.id;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl bg-white border transition-all ${
                  q.isCorrect
                    ? 'border-emerald-200/80 shadow-xs'
                    : 'border-stone-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-stone-100">
                  {/* Question Title & Poet */}
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs">
                      #{q.questionNumber}
                    </span>
                    <span className="text-xs font-bold text-stone-900">
                      {q.poet}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-stone-500">{q.era}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-stone-500">{q.title}</span>

                    {q.adminGraded && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold mr-2">
                        معدل يدوياً ✍️
                      </span>
                    )}
                  </div>

                  {/* Grading Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isProcessing}
                      onClick={() => handleGradeQuestion(q.id, true, 1)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        q.isCorrect
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>صحيحة (+1)</span>
                    </button>

                    <button
                      disabled={isProcessing}
                      onClick={() => handleGradeQuestion(q.id, false, 0)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        !q.isCorrect
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>خاطئة (0)</span>
                    </button>

                    {isProcessing && (
                      <Loader2 className="w-4 h-4 text-amber-800 animate-spin" />
                    )}
                  </div>
                </div>

                {/* Poem lines side-by-side comparison */}
                <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* First line */}
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-200/70">
                    <span className="text-[11px] font-semibold text-stone-500 block mb-1">
                      صدر البيت (المعروض):
                    </span>
                    <p className="font-poetry text-base font-bold text-stone-900">
                      «{q.firstLine}»
                    </p>
                  </div>

                  {/* Player's answer */}
                  <div
                    className={`p-3 rounded-xl border ${
                      q.isCorrect
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-stone-500 block mb-1">
                      ما كتبه المتسابق:
                    </span>
                    <p className="font-poetry text-base font-bold">
                      {q.userAnswer ? `«${q.userAnswer}»` : '— لم يكتب شيئاً —'}
                    </p>
                  </div>

                  {/* Expected model answer */}
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
                    <span className="text-[11px] font-semibold text-amber-900/80 block mb-1">
                      العجز الأصلي (الحل النموذجي):
                    </span>
                    <p className="font-poetry text-base font-bold text-amber-950">
                      «{q.expectedAnswer}»
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
