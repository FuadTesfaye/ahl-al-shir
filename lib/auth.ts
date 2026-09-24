import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';
import { admins } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ahl-al-shir-super-secret-jwt-key-2026-arabic-poetry'
);

const COOKIE_NAME = 'ahl_admin_token';

export interface AdminPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export async function createAdminToken(payload: AdminPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyAdminToken(token);
  if (!payload) return null;

  // Verify that admin still exists in db
  const admin = await db
    .select({
      id: admins.id,
      username: admins.username,
      email: admins.email,
      role: admins.role,
    })
    .from(admins)
    .where(eq(admins.id, payload.id))
    .limit(1);

  if (admin.length === 0) return null;

  return admin[0];
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
