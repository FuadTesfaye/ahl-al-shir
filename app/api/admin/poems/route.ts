import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { poems, gameQuestions } from '@/drizzle/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const poemsWithStats = await db
      .select({
        id: poems.id,
        title: poems.title,
        poet: poems.poet,
        era: poems.era,
        firstLine: poems.firstLine,
        answer: poems.answer,
        totalAsked: sql<number>`COALESCE(COUNT(${gameQuestions.id}), 0)`,
        totalCorrect: sql<number>`COALESCE(SUM(CASE WHEN ${gameQuestions.isCorrect} THEN 1 ELSE 0 END), 0)`,
      })
      .from(poems)
      .leftJoin(gameQuestions, eq(poems.id, gameQuestions.poemId))
      .groupBy(poems.id)
      .orderBy(desc(sql`COUNT(${gameQuestions.id})`));

    return NextResponse.json({ poems: poemsWithStats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching admin poems:', message);
    return NextResponse.json({ error: 'تعذر جلب الأبيات الشعرية' }, { status: 500 });
  }
}
