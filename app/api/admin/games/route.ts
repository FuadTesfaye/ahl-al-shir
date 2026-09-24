import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, players } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const allGames = await db
      .select({
        id: games.id,
        score: games.score,
        maxScore: games.maxScore,
        status: games.status,
        isReviewed: games.isReviewed,
        isWinner: games.isWinner,
        startedAt: games.startedAt,
        completedAt: games.completedAt,
        adminNotes: games.adminNotes,
        playerId: players.id,
        telegramUsername: players.telegramUsername,
        nickname: players.nickname,
      })
      .from(games)
      .innerJoin(players, eq(games.playerId, players.id))
      .orderBy(desc(games.startedAt))
      .limit(100);

    return NextResponse.json({ games: allGames });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching admin games:', message);
    return NextResponse.json({ error: 'تعذر جلب الألعاب' }, { status: 500 });
  }
}
