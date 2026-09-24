import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, players, gameQuestions, poems } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
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

    const currentGame = game[0];

    // Get all questions for this game ordered by questionNumber
    const questionsList = await db
      .select({
        id: gameQuestions.id,
        questionNumber: gameQuestions.questionNumber,
        userAnswer: gameQuestions.userAnswer,
        isCorrect: gameQuestions.isCorrect,
        points: gameQuestions.points,
        answeredAt: gameQuestions.answeredAt,
        poemId: gameQuestions.poemId,
        poet: poems.poet,
        era: poems.era,
        title: poems.title,
        firstLine: poems.firstLine,
        // Only include actual answer if question has been answered or game completed
        expectedAnswer: poems.answer,
      })
      .from(gameQuestions)
      .innerJoin(poems, eq(gameQuestions.poemId, poems.id))
      .where(eq(gameQuestions.gameId, gameId))
      .orderBy(gameQuestions.questionNumber);

    const isCompleted = currentGame.status === 'completed';

    // Find the current active question index (first unanswered question)
    const currentUnanswered = questionsList.find((q) => q.answeredAt === null);

    // Sanitize questions for in-progress games to prevent cheating
    const sanitizedQuestions = questionsList.map((q) => {
      const isAlreadyAnswered = q.answeredAt !== null;
      return {
        id: q.id,
        questionNumber: q.questionNumber,
        poet: q.poet,
        era: q.era,
        title: q.title,
        firstLine: q.firstLine,
        isAnswered: isAlreadyAnswered,
        userAnswer: isAlreadyAnswered ? q.userAnswer : null,
        isCorrect: isAlreadyAnswered ? q.isCorrect : null,
        points: isAlreadyAnswered ? q.points : 0,
        // NEVER expose expected answer if not yet answered!
        expectedAnswer: isAlreadyAnswered || isCompleted ? q.expectedAnswer : null,
      };
    });

    return NextResponse.json({
      game: currentGame,
      isCompleted,
      currentQuestionNumber: currentUnanswered ? currentUnanswered.questionNumber : 20,
      totalQuestions: 20,
      questions: sanitizedQuestions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching game:', message);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب بيانات التحدي' }, { status: 500 });
  }
}
