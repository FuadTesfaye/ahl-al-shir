import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, gameQuestions, poems } from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import { isAnswerAcceptable } from '@/lib/arabic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameId, questionNumber, answer } = body;

    if (!gameId || typeof questionNumber !== 'number') {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const userAnswerText = typeof answer === 'string' ? answer.trim() : '';

    // 1. Fetch the question and its associated poem
    const questionResult = await db
      .select({
        id: gameQuestions.id,
        gameId: gameQuestions.gameId,
        questionNumber: gameQuestions.questionNumber,
        answeredAt: gameQuestions.answeredAt,
        poemId: poems.id,
        poet: poems.poet,
        firstLine: poems.firstLine,
        expectedAnswer: poems.answer,
        normalizedAnswer: poems.normalizedAnswer,
      })
      .from(gameQuestions)
      .innerJoin(poems, eq(gameQuestions.poemId, poems.id))
      .where(
        and(
          eq(gameQuestions.gameId, gameId),
          eq(gameQuestions.questionNumber, questionNumber)
        )
      )
      .limit(1);

    if (questionResult.length === 0) {
      return NextResponse.json({ error: 'السؤال غير موجود' }, { status: 404 });
    }

    const question = questionResult[0];

    // If already answered, don't allow resubmission
    if (question.answeredAt !== null) {
      return NextResponse.json(
        { error: 'تمت الإجابة عن هذا السؤال مسبقاً' },
        { status: 400 }
      );
    }

    // 2. Validate user answer with Arabic normalization
    const evaluation = isAnswerAcceptable(userAnswerText, question.expectedAnswer);
    const pointsAwarded = evaluation.isCorrect ? 1 : 0;

    // 3. Update game_questions
    await db
      .update(gameQuestions)
      .set({
        userAnswer: userAnswerText,
        isCorrect: evaluation.isCorrect,
        points: pointsAwarded,
        answeredAt: new Date(),
      })
      .where(eq(gameQuestions.id, question.id));

    // 4. Update games score
    await db
      .update(games)
      .set({
        score: sql`${games.score} + ${pointsAwarded}`,
      })
      .where(eq(games.id, gameId));

    // Check if this was the last question (20)
    const isGameOver = questionNumber >= 20;
    if (isGameOver) {
      await db
        .update(games)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(games.id, gameId));
    }

    // Fetch updated total score
    const updatedGame = await db
      .select({ score: games.score })
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    const currentScore = updatedGame[0]?.score || 0;

    return NextResponse.json({
      success: true,
      isCorrect: evaluation.isCorrect,
      similarity: evaluation.similarity,
      points: pointsAwarded,
      currentScore,
      expectedAnswer: question.expectedAnswer,
      poet: question.poet,
      isGameOver,
      nextQuestionNumber: isGameOver ? null : questionNumber + 1,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error submitting answer:', message);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء فحص الإجابة' },
      { status: 500 }
    );
  }
}
