/**
 * Arabic text normalization and comparison utilities
 * Designed for poetry hemistich matching
 */

export function normalizeArabic(text: string): string {
  if (!text) return '';

  return (
    text
      // 1. Remove all Arabic diacritics (tashkeel / harakat / shadda / sukun / tanween)
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
      // 7. Remove punctuation & symbols
      .replace(/[،؛؟.,!?:;"'«»()[\]{}—\-_/\\#*~`]/g, ' ')
      // 8. Normalize spaces
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  );
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

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  const maxLen = Math.max(norm1.length, norm2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(norm1, norm2);
  const charSimilarity = 1 - distance / maxLen;

  // Word token overlap check
  const words1 = new Set(norm1.split(' ').filter(Boolean));
  const words2 = new Set(norm2.split(' ').filter(Boolean));
  let common = 0;
  for (const w of words1) {
    if (words2.has(w)) common++;
  }
  const tokenSimilarity = (2 * common) / (words1.size + words2.size);

  return Math.max(charSimilarity, tokenSimilarity);
}

/**
 * Validates whether user answer is acceptable
 */
export function isAnswerAcceptable(userAnswer: string, expectedAnswer: string): {
  isCorrect: boolean;
  score: number;
  similarity: number;
} {
  const normUser = normalizeArabic(userAnswer);
  const normExpected = normalizeArabic(expectedAnswer);

  if (!normUser) {
    return { isCorrect: false, score: 0, similarity: 0 };
  }

  if (normUser === normExpected) {
    return { isCorrect: true, score: 1, similarity: 1.0 };
  }

  const similarity = calculateSimilarity(userAnswer, expectedAnswer);

  // If 82% or more match, count as correct!
  if (similarity >= 0.82) {
    return { isCorrect: true, score: 1, similarity };
  }

  return { isCorrect: false, score: 0, similarity };
}
