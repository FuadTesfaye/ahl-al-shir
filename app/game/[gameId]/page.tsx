'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';
import {
  Feather,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
  Trophy,
  HelpCircle,
} from 'lucide-react';

interface QuestionItem {
  id: number;
  questionNumber: number;
  poet: string;
  era: string;
  title: string;
  firstLine: string;
  isAnswered: boolean;
  userAnswer?: string | null;
  isCorrect?: boolean | null;
  points?: number;
  expectedAnswer?: string | null;
}

interface GameData {
  id: string;
  score: number;
  maxScore: number;
  status: string;
  telegramUsername: string;
  nickname?: string | null;
}

export default function GamePage() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [game, setGame] = useState<GameData | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    isClose?: boolean;
    message?: string;
    expectedAnswer: string;
    points: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch game state
  useEffect(() => {
    async function loadGame() {
      try {
        setLoading(true);
        const res = await fetch(`/api/game/${gameId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'تعذر تحميل التحدي');
        }

        if (data.isCompleted) {
          router.replace(`/result/${gameId}`);
          return;
        }

        setGame(data.game);
        setQuestions(data.questions);

        // Find current question to display
        const firstUnansweredIndex = data.questions.findIndex(
          (q: QuestionItem) => !q.isAnswered
        );

        if (firstUnansweredIndex !== -1) {
          setCurrentIdx(firstUnansweredIndex);
        } else {
          // If all answered, route to result
          router.replace(`/result/${gameId}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    if (gameId) {
      loadGame();
    }
  }, [gameId, router]);

  // Auto focus input on index change
  useEffect(() => {
    if (!feedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIdx, feedback]);

  const currentQuestion = questions[currentIdx];

  const handleSubmitAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submitting || feedback) return;

    if (!userAnswer.trim()) {
      setError('اكتب عجز البيت أو تكملته أولاً يا شاعر');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/game/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          questionNumber: currentQuestion.questionNumber,
          answer: userAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل التحقق من الإجابة');
      }

      // Update feedback state
      setFeedback({
        isCorrect: data.isCorrect,
        isClose: data.isClose,
        message: data.message,
        expectedAnswer: data.expectedAnswer,
        points: data.points,
      });

      // Trigger confetti if correct
      if (data.isCorrect) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#D97706', '#059669', '#F59E0B'],
        });
      }

      // Update local game score
      setGame((prev) => (prev ? { ...prev, score: data.currentScore } : prev));

      // Mark this question as answered locally
      setQuestions((prev) =>
        prev.map((q, idx) =>
          idx === currentIdx
            ? {
                ...q,
                isAnswered: true,
                userAnswer: userAnswer.trim(),
                isCorrect: data.isCorrect,
                expectedAnswer: data.expectedAnswer,
              }
            : q
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setUserAnswer('');
    setError(null);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      router.push(`/result/${gameId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-700/10 text-amber-800 flex items-center justify-center mx-auto animate-pulse">
              <Feather className="w-8 h-8" />
            </div>
            <h2 className="font-poetry text-2xl font-bold text-stone-800">
              جاري فتح ديوان الأبيات...
            </h2>
            <p className="text-stone-500 text-xs">نجهّز لك 20 بيتاً مختارة بعناية</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-stone-300 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">{error}</h2>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progressPercentage = ((currentIdx + (feedback ? 1 : 0)) / 20) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col justify-center">
        {/* Top Header info */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-600 animate-ping" />
            <span className="text-sm font-semibold text-stone-800">
              {game?.nickname || game?.telegramUsername}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-950 text-xs sm:text-sm font-semibold">
            <Trophy className="w-4 h-4 text-amber-700" />
            <span>حصيلة شاعريتك:</span>
            <span className="font-bold text-amber-900 text-base">{game?.score || 0}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 mb-8">
          <div className="flex justify-between items-center text-xs font-semibold text-stone-600">
            <span>السؤال {currentQuestion.questionNumber} من 20</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-stone-200/90 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-700 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Main Question Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-md relative overflow-hidden">
          {/* Poet and Era pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-stone-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium">
              <Feather className="w-3.5 h-3.5 text-amber-800" />
              <span>الشاعر: {currentQuestion.poet}</span>
            </div>
            <span className="text-xs text-stone-400 font-medium">
              {currentQuestion.era}
            </span>
          </div>

          {/* First Hemistich (صدر البيت) */}
          <div className="py-8 sm:py-12 text-center space-y-4">
            <span className="text-xs uppercase tracking-wider text-amber-800/80 font-bold block">
              صدر البيت
            </span>
            <blockquote className="font-poetry text-2xl sm:text-4xl md:text-5xl font-bold text-stone-900 leading-relaxed px-2">
              «{currentQuestion.firstLine}»
            </blockquote>
          </div>

          {/* Answer Form or Feedback View */}
          {!feedback ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-4 max-w-2xl mx-auto">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 text-right">
                  أكمل عجز البيت:
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    disabled={submitting}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="اكتب تكملة البيت هنا..."
                    className="w-full px-5 py-4 rounded-2xl bg-[#FAF7F2] border-2 border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-700 focus:bg-white text-right text-lg sm:text-xl font-poetry font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري التحقق والموازنة...</span>
                    </>
                  ) : (
                    <>
                      <span>تحقق</span>
                      <ArrowLeft className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
              {/* Feedback Alert Card */}
              {feedback.isCorrect ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-950 font-poetry">
                    {feedback.message || 'أصبتَ! ما شاء الله 👏'}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800">
                    أحسنت القول والإكمال يا شاعر! +1 نقطة
                  </p>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl text-center space-y-3 border ${
                  feedback.isClose
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                    : 'bg-stone-100 border-stone-200 text-stone-900'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                    feedback.isClose
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {feedback.isClose ? <Sparkles className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-poetry">
                    {feedback.message || 'أفلت منك البيت 😭'}
                  </h3>
                  <div className="pt-2 text-right bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[11px] font-semibold text-stone-500 block">
                      العجز الصحيح:
                    </span>
                    <p className="font-poetry text-lg sm:text-xl font-bold text-amber-950">
                      «{feedback.expectedAnswer}»
                    </p>
                    {userAnswer && (
                      <p className="text-xs text-stone-500 pt-1">
                        ما كتبته: <span className="line-through">{userAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Next Question Button */}
              <button
                onClick={handleNextQuestion}
                className="w-full py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>
                  {currentIdx + 1 >= 20 ? 'عرض النتيجة النهائية 🏆' : 'هاتِ ما بعده →'}
                </span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
