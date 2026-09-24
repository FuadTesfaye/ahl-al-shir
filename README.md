# 🏆 هل أنت أهلٌ للشعر؟ (Ahl Al-Shir)

تحدٍّ أدبي وتفاعلي ممتع لاختبار حفظ وإكمال روائع الشعر العربي. يتم اختيار 20 بيتاً شعرياً عشوائياً مختلفاً لكل لاعب من بنك يحوي 100 بيت خالد، مع نظام تصحيح فوري وتحقق آمن، ولوحة متصدرين حية، ولوحة تحكم متكاملة للمشرف للتصحيح اليدوي وتتويج الفائزين.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat&logo=tailwindcss)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=flat)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase)
![Bun](https://img.shields.io/badge/Bun-Fast-FBF0DF?style=flat&logo=bun)

---

## 🌟 مميزات المشروع

- **📜 بنك 100 بيت من عيون الشعر:** مختارات من المتنبي، امرؤ القيس، عنترة بن شداد، الإمام الشافعي، أحمد شوقي، جرير، الفرزدق، البحتري، قيس بن الملوح، الشابي، درويش، وغيرهم.
- **🎲 جلسات عشوائية فريدة (Anti-Cheat):** يختار الخادم 20 بيتاً عشوائياً مختلفاً لكل لاعب لمنع تبادل الإجابات، ولا يتم إرسال الإجابة الصحيحة للواجهة قبل الإرسال.
- **✨ محرك تطبيع ذكي للنص العربي:** معالجة دقيقة للأخطاء الإملائية وتجريد التشكيل بالكامل، وتوحيد الهمزات والألف المقصورة والتاء المربوطة، وحذف الكشيدة وعلامات الترقيم، مع حساب نسبة تشابه Levenshtein.
- **⚡ ردود فورية مرحة:** «أصبتَ! ما شاء الله 👏» مع أنيميشن احتفالي، أو «أفلت منك البيت 😭» وعرض العجز الصحيح.
- **🏆 مجلس أهل الشعر (Leaderboard):** لوحة متصدرين حية ترتب المتسابقين حسب أعلى الدرجات والسرعة مع إبراز وسام الفوز.
- **👑 لوحة المشرف والتصحيح اليدوي (`/admin`):**
  - استعراض إجابات كل متسابق بيتاً بيتاً ومقارنتها بالحل النموذجي.
  - تعديل الدرجات يدوياً واحتساب إجابات بديلة بنقرة زر مع تحديث المجموع فوراً.
  - تتويج الفائزين رسمياً بـ «وسام الفائز 👑».
  - إدارة المشرفين ومنح وتفويض الصلاحيات.
- **🎨 تصميم أدبي عتيق (Modern Manuscript):** خطوط عربية أصيلة (Amiri & Noto Sans Arabic) وتنسيق مستوحى من المخطوطات والورق العتيق.

---

## 🚀 التثبيت والتشغيل المحلي

### 1. استنساخ المشروع
```bash
git clone https://github.com/FuadTesfaye/ahl-al-shir.git
cd ahl-al-shir
```

### 2. تثبيت الحزم (باستخدام Bun أو NPM)
```bash
bun install
# أو
npm install
```

### 3. إعداد متغيرات البيئة
أنشئ ملف `.env` بناءً على `.env.example`:
```env
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@[HOST]:6543/postgres"
JWT_SECRET="your-super-secret-jwt-key"
```

### 4. تطبيق المخطط وزرع البيانات (Seed)
```bash
# إنشاء الجداول في Supabase
bunx drizzle-kit push

# زرع الـ 100 بيت وحساب المشرف الافتراضي
bun drizzle/seed.ts
```

### 5. تشغيل سيرفر التطوير
```bash
bun dev
```
افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

---

## 🔑 بيانات دخول المشرف الافتراضية

- **رابط الدخول:** `/admin/login`
- **اسم المستخدم:** `admin` (أو `fuad`)
- **كلمة المرور:** `admin123`

---

## 🛠️ التقنيات المستخدمة

- **Framework:** Next.js 15 (App Router, Turbopack, Server Actions)
- **Runtime & Package Manager:** Bun
- **Database:** Supabase PostgreSQL (Transaction Pooler Mode)
- **ORM:** Drizzle ORM & Drizzle Kit
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Typography:** Google Fonts (Amiri, Noto Sans Arabic)
- **Authentication:** Jose (JWT) & Bcryptjs

---

صُنِعَ بشغف لحفظ وتذوق رصيدنا الأدبي الخالد ❤️
