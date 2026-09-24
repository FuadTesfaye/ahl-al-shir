import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, gameQuestions } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const { questionId, isCorrect, points, adminNotes } = await req.json();

    if (!questionId || typeof isCorrect !== 'boolean') {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    // 1. Fetch question to get gameId
    const q = await db
      .select({ id: gameQuestions.id, gameId: gameQuestions.gameId })
      .from(gameQuestions)
      .where(eq(gameQuestions.id, questionId))
      .limit(1);

    if (q.length === 0) {
      return NextResponse.json({ error: 'السؤال غير موجود' }, { status: 404 });
    }

    const gameId = q[0].gameId;
    const finalPoints = typeof points === 'number' ? points : (isCorrect ? 1 : 0);

    // 2. Update question
    await db
      .update(gameQuestions)
      .set({
        isCorrect,
        points: finalPoints,
        adminGraded: true,
      })
      .where(eq(gameQuestions.id, questionId));

    // 3. Recalculate total score for game
    const [calc] = await db
      .select({
        totalScore: sql<number>`COALESCE(SUM(${gameQuestions.points}), 0)`,
      })
      .from(gameQuestions)
      .where(eq(gameQuestions.gameId, gameId));

    const newScore = Number(calc.totalScore);

    // 4. Update game with new score and reviewed status
    await db
      .update(games)
      .set({
        score: newScore,
        isReviewed: true,
        ...(adminNotes ? { adminNotes } : {}),
      })
      .where(eq(games.id, gameId));

    return NextResponse.json({
      success: true,
      newScore,
      message: 'تم تحديث التقييم بنجاح',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error grading question:', message);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ التقييم' }, { status: 500 });
  }
}
