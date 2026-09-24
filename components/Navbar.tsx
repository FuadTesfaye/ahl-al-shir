'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Trophy, ShieldCheck, Feather } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-stone-900 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-700/10 border border-amber-700/20 flex items-center justify-center text-amber-800 shadow-xs group-hover:bg-amber-700/15 transition-colors">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <span className="font-poetry text-xl sm:text-2xl font-bold tracking-tight text-amber-950 block leading-tight">
              أهلُ الشِّعْر
            </span>
            <span className="text-[11px] text-stone-500 block -mt-0.5">
              تحدي روائع الشعر العربي
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-stone-200/60 text-stone-950 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            الرئيسية
          </Link>
          <Link
            href="/leaderboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/leaderboard'
                ? 'bg-amber-100 text-amber-950 font-semibold border border-amber-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>مجلس أهل الشعر</span>
          </Link>
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith('/admin')
                ? 'bg-stone-900 text-stone-100 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-stone-400" />
            <span className="hidden sm:inline">لوحة المشرف</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
