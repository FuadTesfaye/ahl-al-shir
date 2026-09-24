export interface TierInfo {
  title: string;
  badge: string;
  description: string;
  color: string;
  bgGradient: string;
}

export function getScoreTier(score: number, maxScore: number = 20): TierInfo {
  const percentage = (score / maxScore) * 100;

  if (score >= 20) {
    return {
      title: 'أمير الشعراء 👑',
      badge: '👑 من أهل الشعر بلا منازع',
      description: 'أنت من أهل الشعر بلا شك! ذاكرة ديوانية فولاذية لا يُشقّ لها غبار.',
      color: 'text-amber-600 dark:text-amber-400',
      bgGradient: 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30',
    };
  }

  if (score >= 16) {
    return {
      title: 'شاعر مفلق 🔥',
      badge: '🔥 ذاكرتك الشعرية خطيرة',
      description: 'ما شاء الله عليك يا شاعر! ذائقة راقية وحفظ متين لأشهر ما تداولته العرب.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/30',
    };
  }

  if (score >= 11) {
    return {
      title: 'متذوّق واعد 📚',
      badge: '📚 عندك أساس… لكن نحتاج مراجعة بسيطة',
      description: 'أحسنت! لديك حصيلة جيدة وشغف ملحوظ، قليل من المراجعة وتصل للقمة.',
      color: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'from-blue-500/20 via-blue-500/10 to-transparent border-blue-500/30',
    };
  }

  if (score >= 6) {
    return {
      title: 'عابر سبيل 😭',
      badge: '😭 الشعر موجود، لكن في مكان آخر',
      description: 'حاولت واجتهدت! يبدو أنك تستمتع بسماع الشعر أكثر من حفظه، وهذا جميل أيضاً.',
      color: 'text-orange-600 dark:text-orange-400',
      bgGradient: 'from-orange-500/20 via-orange-500/10 to-transparent border-orange-500/30',
    };
  }

  return {
    title: 'تائه في الصحراء 💀',
    badge: '💀 أخي الكريم… هل دخلت الاختبار بالغلط؟',
    description: 'لا بأس يا صديقي! ربما مكانك في النثر أو الرياضيات.. أو أنك تحتاج جولة ثانية معنا.',
    color: 'text-stone-600 dark:text-stone-400',
    bgGradient: 'from-stone-500/20 via-stone-500/10 to-transparent border-stone-500/30',
  };
}

export function generateShareText(score: number, maxScore: number = 20, nickname?: string): string {
  const tier = getScoreTier(score, maxScore);
  const name = nickname ? `أنا (${nickname})` : 'أنا';

  return `🏆 حققتُ ${score} من ${maxScore} في تحدي «هل أنت أهلٌ للشعر؟»!
${tier.badge}
${tier.title}

هل تتحداني وتتصدر مجلس أهل الشعر؟ 👀
خُض التحدي الآن! ✨`;
}
