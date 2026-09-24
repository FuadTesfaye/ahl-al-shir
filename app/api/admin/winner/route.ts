import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const { gameId, isWinner } = await req.json();

    if (!gameId || typeof isWinner !== 'boolean') {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    await db
      .update(games)
      .set({ isWinner })
      .where(eq(games.id, gameId));

    return NextResponse.json({
      success: true,
      isWinner,
      message: isWinner ? 'تم تتويج اللاعب كفائز رسمي 👑' : 'تم إلغاء لقب الفائز',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error toggling winner status:', message);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديد الفائز' }, { status: 500 });
  }
}
