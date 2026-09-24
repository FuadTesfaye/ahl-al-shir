/**
 * Arabic text normalization and comparison utilities
 * Designed for forgiving, literary poetry hemistich matching
 */

export function normalizeArabic(text: string): string {
  if (!text) return '';

  return (
    text
      // 1. Remove all Arabic diacritics (tashkeel / harakat / shadda / sukun / tanween / dagger alef)
      .replace(/[\u064B-\u065F\u0670]/g, '')
      // 2. Remove Tatweel (Kashida)
      .replace(/\u0640/g, '')
      // 3. Normalize Alef forms (أ, إ, آ, ٱ -> ا)
      .replace(/[أإآٱ]/g, 'ا')
      // 4. Normalize Hamza on Waw / Yeh
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      // 5. Normalize Ta Marbuta (ة -> ه)
      .replace(/ة/g, 'ه')
      // 6. Normalize Alef Maqsura (ى -> ي)
      .replace(/ى/g, 'ي')
      // 7. Remove punctuation & symbols (Arabic & Latin)
      .replace(/[،؛؟.,!?:;"'«»()[\]{}—\-_/\\#*~`^%$@+=<>]/g, ' ')
      // 8. Normalize spaces
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  );
}

/**
 * Strips common Arabic prefixes (waw, fa, initial alif-lam) for fuzzy root/token matching
 */
function stripPrefixes(word: string): string {
  let w = word;
  if (w.startsWith('ال') && w.length > 3) {
    w = w.slice(2);
  }
  if ((w.startsWith('و') || w.startsWith('ف') || w.startsWith('ب') || w.startsWith('ل')) && w.length > 3) {
    w = w.slice(1);
    if (w.startsWith('ال') && w.length > 3) {
      w = w.slice(2);
    }
  }
  return w;
}

/**
 * Calculates Levenshtein Distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= bn; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Returns similarity ratio between 0 and 1
 */
export function calculateSimilarity(s1: string, s2: string): number {
  const norm1 = normalizeArabic(s1);
  const norm2 = normalizeArabic(s2);

  if (!norm1 || !norm2) return 0.0;
  if (norm1 === norm2) return 1.0;

  const maxLen = Math.max(norm1.length, norm2.length);
  if (maxLen === 0) return 1.0;

  // Character level similarity
  const distance = levenshteinDistance(norm1, norm2);
  const charSimilarity = Math.max(0, 1 - distance / maxLen);

  // Word token overlap check
  const words1 = norm1.split(' ').filter(Boolean);
  const words2 = norm2.split(' ').filter(Boolean);

  if (words1.length === 0 || words2.length === 0) return charSimilarity;

  const stripped1 = words1.map(stripPrefixes);
  const stripped2 = words2.map(stripPrefixes);

  let exactMatches = 0;
  for (const w1 of words1) {
    if (words2.includes(w1)) {
      exactMatches++;
    }
  }

  let rootMatches = 0;
  for (const s of stripped1) {
    if (stripped2.includes(s)) {
      rootMatches++;
    }
  }

  const tokenRatio = Math.max(
    (2 * exactMatches) / (words1.length + words2.length),
    (2 * rootMatches) / (words1.length + words2.length)
  );

  // Recall ratio: how many of the expected words did the user write?
  let foundInExpected = 0;
  for (const s of stripped1) {
    if (stripped2.includes(s)) foundInExpected++;
  }
  const recallRatio = words2.length > 0 ? foundInExpected / words2.length : 0;

  return Math.max(charSimilarity, tokenRatio, recallRatio * 0.9);
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  isClose: boolean;
  score: number;
  similarity: number;
  message: string;
}

/**
 * Validates whether user answer is acceptable
 * Forgiving Arabic poetry evaluation:
 * - Exact / normalized match -> Correct
 * - Similarity >= 68% -> Correct (Close enough to deserve the point!)
 * - Token recall >= 65% -> Correct
 */
export function isAnswerAcceptable(userAnswer: string, expectedAnswer: string): AnswerEvaluation {
  const normUser = normalizeArabic(userAnswer);
  const normExpected = normalizeArabic(expectedAnswer);

  if (!normUser) {
    return {
      isCorrect: false,
      isClose: false,
      score: 0,
      similarity: 0,
      message: 'لم تكتب شيئاً يا شاعر 😭',
    };
  }

  if (normUser === normExpected) {
    return {
      isCorrect: true,
      isClose: false,
      score: 1,
      similarity: 1.0,
      message: 'أصبتَ! ما شاء الله 👏',
    };
  }

  const similarity = calculateSimilarity(userAnswer, expectedAnswer);

  // If similarity is 68% or higher, they definitely got the line!
  if (similarity >= 0.68) {
    return {
      isCorrect: true,
      isClose: similarity < 0.95,
      score: 1,
      similarity,
      message: similarity >= 0.9 ? 'أصبتَ! ما شاء الله 👏' : 'أصبتَ! إجابة ممتازة وقريبة جداً 👏',
    };
  }

  // If between 45% and 67%, they almost had it!
  const isClose = similarity >= 0.45;

  return {
    isCorrect: false,
    isClose,
    score: 0,
    similarity,
    message: isClose ? 'كدتَ أن تصيبها! أفلت منك البيت قليلاً 😭' : 'أفلت منك البيت 😭',
  };
}
