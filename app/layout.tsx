import type { Metadata } from 'next';
import { Amiri, Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';

const amiri = Amiri({
  variable: '--font-amiri',
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: '--font-noto-sans-arabic',
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'هل أنت أهلٌ للشعر؟ | تحدي روائع الشعر العربي',
  description: 'اختبر ذاكرتك الشعرية… هل تحفظ ما يتداوله الناس في كل مكان؟ 20 بيتاً شعرياً مختارة بعناية لإكمال عجز البيت.',
  openGraph: {
    title: 'هل أنت أهلٌ للشعر؟ 🏆',
    description: '20 بيتًا • تحدٍّ واحد • لا غش 😭 اختبر ذاكرتك الشعرية الآن!',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${amiri.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
