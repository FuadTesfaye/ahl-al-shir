'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Users,
  LogOut,
  ArrowRight,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If login page, don't show admin chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { href: '/admin', label: 'الإحصائيات', icon: LayoutDashboard },
    { href: '/admin/games', label: 'الألعاب والتصحيح اليدوي', icon: CheckSquare },
    { href: '/admin/poems', label: 'بنك الـ 100 بيت', icon: BookOpen },
    { href: '/admin/users', label: 'إدارة المشرفين', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4EF]">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-stone-100 hover:text-amber-400 transition-colors font-bold text-base"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className="font-poetry text-lg">لوحة تحكم المشرف</span>
            </Link>

            <span className="text-stone-700 hidden sm:inline">|</span>

            <Link
              href="/"
              className="text-xs text-stone-400 hover:text-stone-200 transition-colors hidden sm:flex items-center gap-1"
            >
              <span>معاينة الموقع الرئيسي</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Subnav links */}
        <div className="bg-stone-950/70 border-t border-stone-800/80 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
