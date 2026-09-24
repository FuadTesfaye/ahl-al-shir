import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, players } from '@/drizzle/schema';
import { eq, desc, asc, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    const topGames = await db
      .select({
        gameId: games.id,
        score: games.score,
        maxScore: games.maxScore,
        isWinner: games.isWinner,
        startedAt: games.startedAt,
        completedAt: games.completedAt,
        telegramUsername: players.telegramUsername,
        nickname: players.nickname,
      })
      .from(games)
      .innerJoin(players, eq(games.playerId, players.id))
      .where(and(eq(games.status, 'completed'), isNotNull(games.completedAt)))
      .orderBy(desc(games.score), desc(games.isWinner), asc(games.completedAt))
      .limit(50);

    return NextResponse.json({
      leaderboard: topGames,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching leaderboard:', message);
    return NextResponse.json({ error: 'تعذر جلب لوحة الصدارة' }, { status: 500 });
  }
}
