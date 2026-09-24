import Link from 'next/link';
import { Feather, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-stone-100/60 py-8 text-stone-600 text-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-stone-800 font-poetry text-lg">
          <Feather className="w-4 h-4 text-amber-700" />
          <span>«هل أنت أهلٌ للشعر؟»</span>
          <span className="text-xs font-sans text-stone-500">
            — ديوان الأبيات الخالدة
          </span>
        </div>
        <p className="text-xs text-stone-500 flex items-center gap-1">
          صُنِعَ بشغف لحفظ رصيدنا الأدبي الخالد
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </p>
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <Link href="/leaderboard" className="hover:text-amber-800 transition-colors">
            لوحة الصدارة
          </Link>
          <span className="text-stone-300">•</span>
          <Link href="/admin" className="hover:text-amber-800 transition-colors">
            دخول المشرف
          </Link>
        </div>
      </div>
    </footer>
  );
}
