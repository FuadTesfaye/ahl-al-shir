'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { getScoreTier, generateShareText } from '@/lib/scoring';
import {
  Trophy,
  Share2,
  Check,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Crown,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface QuestionResult {
  id: number;
  questionNumber: number;
  poet: string;
  era: string;
  title: string;
  firstLine: string;
  userAnswer?: string | null;
  isCorrect?: boolean | null;
  points?: number;
  expectedAnswer?: string | null;
}

interface GameResultData {
  id: string;
  score: number;
  maxScore: number;
  status: string;
  isReviewed: boolean;
  isWinner: boolean;
  telegramUsername: string;
  nickname?: string | null;
  completedAt?: string;
}

export default function ResultPage() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GameResultData | null>(null);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        const res = await fetch(`/api/game/${gameId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'تعذر تحميل النتيجة');
        }

        setGame(data.game);
        setQuestions(data.questions);

        // Confetti for good scores
        if (data.game?.score >= 12) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    if (gameId) {
      loadResult();
    }
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-amber-800 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-stone-800 font-bold mb-4">{error || 'النتيجة غير موجودة'}</p>
          <Link
            href="/"
            className="px-6 py-2 rounded-xl bg-amber-800 text-white text-sm"
          >
            العودة للرئيسية
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const score = game.score;
  const maxScore = game.maxScore || 20;
  const wrongCount = maxScore - score;
  const tier = getScoreTier(score, maxScore);

  const handleCopyShare = () => {
    const text = generateShareText(score, maxScore, game.nickname || game.telegramUsername);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTelegram = () => {
    const text = generateShareText(score, maxScore, game.nickname || game.telegramUsername);
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 md:py-14 space-y-8">
        {/* Crown Banner if officially marked winner by Admin */}
        {game.isWinner && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-950 flex items-center justify-center gap-3 text-center shadow-md animate-bounce">
            <Crown className="w-7 h-7 text-amber-600 fill-amber-500" />
            <div>
              <h2 className="font-poetry text-xl font-bold">
                تتويج رسمي: أنت أحد الفائزين المعتمدين في مجلس أهل الشعر! 👑
              </h2>
              <p className="text-xs text-amber-900 mt-0.5">
                تم اعتماد نتيجتك واختيارك رسمياً من قِبل المشرف.
              </p>
            </div>
          </div>
        )}

        {/* Main Result Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle gradient background based on tier */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${tier.bgGradient} pointer-events-none`}
          />

          <div className="relative z-10 space-y-6">
            {/* Header Title */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm font-semibold">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>نتيجتك في التحدي</span>
            </div>

            {/* Big Score Display */}
            <div className="space-y-1">
              <div className="font-poetry text-6xl sm:text-7xl md:text-8xl font-black text-stone-900 tracking-tight">
                {score} <span className="text-3xl sm:text-4xl text-stone-400 font-sans font-normal">/ {maxScore}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500">
                لصاحب المعرف: <span className="font-mono font-bold text-stone-800">{game.telegramUsername}</span>
                {game.nickname && <span> ({game.nickname})</span>}
              </p>
            </div>

            {/* Playful Tier Badge and Description */}
            <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/70 max-w-lg mx-auto space-y-2">
              <div className={`text-xl sm:text-2xl font-bold font-poetry ${tier.color}`}>
                {tier.badge}
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {tier.description}
              </p>
            </div>

            {/* Correct & Wrong Stats */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-950">
                <span className="text-xs text-emerald-700 block">إجابات صحيحة</span>
                <span className="text-2xl font-bold">{score}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-700">
                <span className="text-xs text-stone-500 block">إجابات خاطئة</span>
                <span className="text-2xl font-bold">{wrongCount}</span>
              </div>
            </div>

            {/* Sharing buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleShareTelegram}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>شارك عبر تيليجرام</span>
              </button>

              <button
                onClick={handleCopyShare}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تم نسخ النتيجة! 🎉</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>انسخ نص النتيجة</span>
                  </>
                )}
              </button>
            </div>

            {/* Review status note */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-stone-400" />
              <span>
                {game.isReviewed
                  ? 'تمت مراجعة هذه الجلسة وتدقيقها يدوياً بواسطة المشرف ✅'
                  : 'جلسة مسجلة في قاعدة البيانات وبانتظار اعتماد المشرف.'}
              </span>
            </div>
          </div>
        </div>

        {/* Call to leaderboard */}
        <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-right space-y-1">
            <h3 className="font-poetry text-xl font-bold text-amber-950">
              هل تستطيع أن تتصدر القائمة؟
            </h3>
            <p className="text-xs text-stone-600">
              شاهد ترتيبك بين جميع الشعراء والمتسابقين في المجلس.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-sm shadow-sm transition-colors text-center"
          >
            🏆 عرض مجلس أهل الشعر
          </Link>
        </div>

        {/* Toggle Breakdown of the 20 questions */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full p-5 flex items-center justify-between text-right hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-poetry text-lg font-bold text-stone-900">
                مراجعة إجابات الـ 20 بيتاً بالتفصيل
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {questions.length} بيت
              </span>
            </div>
            {showBreakdown ? (
              <ChevronUp className="w-5 h-5 text-stone-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-500" />
            )}
          </button>

          {showBreakdown && (
            <div className="divide-y divide-stone-100 p-4 sm:p-6 space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-500">
                      السؤال #{q.questionNumber} — {q.poet} ({q.era})
                    </span>
                    {q.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> أصبت (+1)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                        <XCircle className="w-4 h-4" /> لم تصب (0)
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-stone-200/80 space-y-2">
                    <div>
                      <span className="text-[11px] text-stone-400 block">صدر البيت:</span>
                      <p className="font-poetry text-base font-bold text-stone-900">
                        «{q.firstLine}»
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[11px]">ما كتبته:</span>
                        <p className={`font-poetry font-medium ${q.isCorrect ? 'text-emerald-800' : 'text-stone-700 line-through'}`}>
                          {q.userAnswer || 'لم تتم الإجابة'}
                        </p>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[11px]">العجز الصحيح:</span>
                        <p className="font-poetry font-bold text-amber-950">
                          {q.expectedAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Play Again button */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>خُض تحدياً جديداً (20 بيتاً أخرى)</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
