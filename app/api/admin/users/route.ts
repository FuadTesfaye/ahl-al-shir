import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins, players } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { getAdminSession, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const adminList = await db
      .select({
        id: admins.id,
        username: admins.username,
        email: admins.email,
        role: admins.role,
        createdAt: admins.createdAt,
      })
      .from(admins)
      .orderBy(desc(admins.createdAt));

    const playersList = await db
      .select({
        id: players.id,
        telegramUsername: players.telegramUsername,
        nickname: players.nickname,
        createdAt: players.createdAt,
      })
      .from(players)
      .orderBy(desc(players.createdAt))
      .limit(50);

    return NextResponse.json({
      admins: adminList,
      players: playersList,
      currentAdmin: admin,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching admin users:', message);
    return NextResponse.json({ error: 'تعذر جلب المستخدمين' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentAdmin = await getAdminSession();
    if (!currentAdmin) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 });
    }

    const { username, email, password, role } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال اسم المستخدم، البريد، وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().replace(/^@/, '');
    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);
    const assignedRole = role === 'super_admin' ? 'super_admin' : 'admin';

    await db.insert(admins).values({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
    });

    return NextResponse.json({
      success: true,
      message: `تم منح صلاحية المشرف (${assignedRole}) للمستخدم ${cleanUsername} بنجاح! 🎉`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error creating admin user:', message);
    return NextResponse.json(
      { error: 'حدث خطأ أو أن اسم المستخدم/البريد مسجل مسبقاً' },
      { status: 400 }
    );
  }
}
