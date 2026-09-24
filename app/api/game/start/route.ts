import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, games, gameQuestions, poems } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { telegramUsername, nickname } = body;

    if (!telegramUsername || typeof telegramUsername !== 'string') {
      return NextResponse.json(
        { error: 'يرجى إدخال اسم المستخدم في تيليجرام' },
        { status: 400 }
      );
    }

    telegramUsername = telegramUsername.trim();
    if (!telegramUsername.startsWith('@')) {
      telegramUsername = `@${telegramUsername}`;
    }

    nickname = nickname?.trim() || null;

    // 1. Find or create player
    let player = await db
      .select()
      .from(players)
      .where(eq(players.telegramUsername, telegramUsername))
      .limit(1);

    let playerId: number;

    if (player.length === 0) {
      const inserted = await db
        .insert(players)
        .values({
          telegramUsername,
          nickname,
        })
        .returning({ id: players.id });
      playerId = inserted[0].id;
    } else {
      playerId = player[0].id;
      // Update nickname if provided
      if (nickname && nickname !== player[0].nickname) {
        await db
          .update(players)
          .set({ nickname })
          .where(eq(players.id, playerId));
      }
    }

    // 2. Create game session
    const insertedGame = await db
      .insert(games)
      .values({
        playerId,
        score: 0,
        maxScore: 20,
        status: 'in_progress',
      })
      .returning({ id: games.id });

    const gameId = insertedGame[0].id;

    // 3. Select 20 random poems from the 100-poem pool
    const selectedPoems = await db
      .select({ id: poems.id })
      .from(poems)
      .orderBy(sql`RANDOM()`)
      .limit(20);

    if (selectedPoems.length < 20) {
      return NextResponse.json(
        { error: 'عدد الأبيات في قاعدة البيانات غير كافٍ' },
        { status: 500 }
      );
    }

    // 4. Create 20 game_questions with shuffled order
    const questionRows = selectedPoems.map((p, idx) => ({
      gameId,
      poemId: p.id,
      questionNumber: idx + 1,
      isCorrect: false,
      points: 0,
    }));

    await db.insert(gameQuestions).values(questionRows);

    return NextResponse.json({
      success: true,
      gameId,
      totalQuestions: 20,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error starting game:', message);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء بدء التحدي، يرجى المحاولة ثانية' },
      { status: 500 }
    );
  }
}
