import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, players, gameQuestions, poems } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const { gameId } = await params;

    const game = await db
      .select({
        id: games.id,
        playerId: games.playerId,
        score: games.score,
        maxScore: games.maxScore,
        status: games.status,
        isReviewed: games.isReviewed,
        isWinner: games.isWinner,
        adminNotes: games.adminNotes,
        startedAt: games.startedAt,
        completedAt: games.completedAt,
        telegramUsername: players.telegramUsername,
        nickname: players.nickname,
      })
      .from(games)
      .innerJoin(players, eq(games.playerId, players.id))
      .where(eq(games.id, gameId))
      .limit(1);

    if (game.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على التحدي' }, { status: 404 });
    }

    const questionsList = await db
      .select({
        id: gameQuestions.id,
        questionNumber: gameQuestions.questionNumber,
        userAnswer: gameQuestions.userAnswer,
        isCorrect: gameQuestions.isCorrect,
        points: gameQuestions.points,
        adminGraded: gameQuestions.adminGraded,
        answeredAt: gameQuestions.answeredAt,
        poemId: poems.id,
        title: poems.title,
        poet: poems.poet,
        era: poems.era,
        firstLine: poems.firstLine,
        expectedAnswer: poems.answer,
      })
      .from(gameQuestions)
      .innerJoin(poems, eq(gameQuestions.poemId, poems.id))
      .where(eq(gameQuestions.gameId, gameId))
      .orderBy(gameQuestions.questionNumber);

    return NextResponse.json({
      game: game[0],
      questions: questionsList,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching admin game detail:', message);
    return NextResponse.json({ error: 'تعذر جلب تفاصيل التحدي' }, { status: 500 });
  }
}
