'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  ShieldPlus,
  ShieldCheck,
  UserCheck,
  Loader2,
  CheckCircle2,
  Lock,
  Mail,
  User,
} from 'lucide-react';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface PlayerUser {
  id: number;
  telegramUsername: string;
  nickname?: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [playersList, setPlayersList] = useState<PlayerUser[]>([]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setAdminsList(data.admins || []);
      setPlayersList(data.players || []);
    } catch {
      setErrorMsg('تعذر تحميل بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إضافة المشرف');
      }

      setSuccessMsg(data.message);
      setUsername('');
      setEmail('');
      setPassword('');
      loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPlayerForAdmin = (player: PlayerUser) => {
    const cleanHandle = player.telegramUsername.replace(/^@/, '');
    setUsername(cleanHandle);
    setEmail(`${cleanHandle}@ahl-al-shir.com`);
    setPassword('admin123');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-poetry text-2xl sm:text-3xl font-bold text-stone-900">
          👑 إدارة المشرفين وتفويض الصلاحيات
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          يمكنك منح صلاحيات إدارة التحدي لأي شخص أو ترقية أحد اللاعبين المميزين إلى مشرف.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to Grant Admin */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <ShieldPlus className="w-5 h-5 text-amber-700" />
            <h2 className="font-bold text-stone-900 text-base">
              إضافة مشرف جديد
            </h2>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleGrantAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 text-right">
                اسم المستخدم للمشرف
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="fuad أو ahmed"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700 text-right text-xs sm:text-sm"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="fuad@ahl-al-shir.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700 text-left font-mono text-xs sm:text-sm"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700 text-right text-xs sm:text-sm"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 text-right">
                مستوى الصلاحية
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'super_admin')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700 text-right text-xs sm:text-sm"
              >
                <option value="admin">مشرف عادي (Admin) — تصحيح واعتماد</option>
                <option value="super_admin">مشرف عام (Super Admin) — كافة الصلاحيات</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري منح الصلاحية...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>منح صلاحية المشرف</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Admins & Recent Players */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Admins List */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>المشرفون الحاليون ({adminsList.length})</span>
            </h2>

            <div className="divide-y divide-stone-100">
              {adminsList.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-stone-700 text-xs">
                      {a.role === 'super_admin' ? '👑' : '🛡️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 font-mono text-sm">
                          {a.username}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {a.role}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400 font-mono">{a.email}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {new Date(a.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Promote from Players */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="space-y-0.5">
              <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-stone-600" />
                <span>لاعبو تيليجرام المسجلون (ترقية سريعة)</span>
              </h2>
              <p className="text-xs text-stone-500">
                يمكنك الضغط على «ترقية لمشرف» لتعبئة بيانات اللاعب فوراً في نموذج الصلاحيات.
              </p>
            </div>

            {playersList.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">لا يوجد لاعبون مسجلون بعد.</p>
            ) : (
              <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1">
                {playersList.map((player) => (
                  <div
                    key={player.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50/70 rounded-lg px-2"
                  >
                    <div>
                      <span className="font-bold text-stone-900 font-mono text-sm" dir="ltr">
                        {player.telegramUsername}
                      </span>
                      {player.nickname && (
                        <span className="text-xs text-stone-500 font-poetry block">
                          «{player.nickname}»
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectPlayerForAdmin(player)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      ترقية لمشرف ↗
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
