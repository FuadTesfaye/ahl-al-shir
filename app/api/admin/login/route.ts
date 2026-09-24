import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins } from '@/drizzle/schema';
import { eq, or } from 'drizzle-orm';
import { verifyPassword, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال اسم المستخدم أو البريد وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    const adminUser = await db
      .select()
      .from(admins)
      .where(
        or(
          eq(admins.username, cleanIdentifier),
          eq(admins.email, cleanIdentifier)
        )
      )
      .limit(1);

    if (adminUser.length === 0) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    const user = adminUser[0];
    const isValid = verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    const token = await createAdminToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error during admin login:', message);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
