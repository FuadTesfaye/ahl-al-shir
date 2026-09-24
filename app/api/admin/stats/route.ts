import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, players, poems } from '@/drizzle/schema';
import { count, sql, eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const [playersCount] = await db.select({ val: count() }).from(players);
    const [gamesCount] = await db.select({ val: count() }).from(games);
    const [poemsCount] = await db.select({ val: count() }).from(poems);
    const [winnersCount] = await db
      .select({ val: count() })
      .from(games)
      .where(eq(games.isWinner, true));

    const [unreviewedCount] = await db
      .select({ val: count() })
      .from(games)
      .where(eq(games.isReviewed, false));

    const [scoreStats] = await db
      .select({
        avgScore: sql<number>`COALESCE(AVG(${games.score}), 0)`,
        perfectScores: sql<number>`COALESCE(SUM(CASE WHEN ${games.score} >= 20 THEN 1 ELSE 0 END), 0)`,
      })
      .from(games);

    return NextResponse.json({
      totalPlayers: Number(playersCount.val),
      totalGames: Number(gamesCount.val),
      totalPoems: Number(poemsCount.val),
      totalWinners: Number(winnersCount.val),
      unreviewedGames: Number(unreviewedCount.val),
      averageScore: Number(Number(scoreStats.avgScore).toFixed(1)),
      perfectScores: Number(scoreStats.perfectScores),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching admin stats:', message);
    return NextResponse.json({ error: 'تعذر جلب الإحصائيات' }, { status: 500 });
  }
}
