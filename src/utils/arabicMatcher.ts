/**
 * PortfolioHubs Intelligent Rule-Based Arabic NLP Matcher
 * Zero-AI / Zero-Latency / Zero-Cost
 * Features:
 *  - Full Arabic diacritic, normalization & tatweel cleanup
 *  - Rule-based morphological prefix/suffix stripping (Stemming)
 *  - Egyptian & Dental slang/synonym canonical dictionary
 *  - Levenshtein typo-tolerance distance
 *  - Contextual route and step boosting
 *  - "Did you mean?" candidate ranking
 */

import { ChatbotNode } from '../data/chatbotTree';

// 1. Text Normalization for Arabic & English
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel / harakat
    .replace(/\u0640/g, '')               // remove tatweel / kashida
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// 2. Morphological Affix Stripper (Stemmer)
export function stemArabicWord(word: string): string {
  if (!word || word.length <= 2) return word;

  let stemmed = word;

  // Prefix stripping (longest first)
  const prefixes = [
    'وال', 'فال', 'بال', 'كال', 'لل', 'ال',
    'و', 'ف', 'ب', 'ل', 'ك', 'س'
  ];

  for (const p of prefixes) {
    if (stemmed.startsWith(p) && stemmed.length - p.length >= 3) {
      stemmed = stemmed.slice(p.length);
      break;
    }
  }

  // Suffix stripping (longest first)
  const suffixes = [
    'ات', 'ين', 'ون', 'ها', 'هم', 'هن', 'كم', 'نا',
    'ي', 'ك', 'ه'
  ];

  for (const s of suffixes) {
    if (stemmed.endsWith(s) && stemmed.length - s.length >= 3) {
      stemmed = stemmed.slice(0, -s.length);
      break;
    }
  }

  return stemmed;
}

// 3. Synonym & Dialect Map (Colloquial Arabic & Dental Terminology)
const SYNONYM_DICTIONARY: Record<string, string[]> = {
  'كيفيه': ['ازاي', 'عايز', 'عاوز', 'محتاج', 'كيف', 'طريقه', 'شرح', 'خطوات', 'اعمل', 'اسوي'],
  'مجاني': ['بكام', 'سعر', 'اسعار', 'فلوس', 'بلاش', 'ببلاش', 'تكلفه', 'اشتراك', 'مصاريف', 'مدفوع', 'فلوسه'],
  'pptx': ['باوربوينت', 'بوربوينت', 'بوربونت', 'سلايدز', 'عرض', 'تقديم', 'شرايح', 'شرائح', 'powerpoint', 'presentation'],
  'pdf': ['بي دي اف', 'بي دي', 'تحميل السيره', 'تنزيل السيره', 'ملف', 'طباعه'],
  'سيره_ذاتيه': ['سيره', 'سيرة', 'سي في', 'سيفي', 'cv', 'ريفيو', 'سيرتي'],
  'بورتفوليو': ['بورتفوليو', 'بورفوليو', 'بورتفليو', 'بورتبوليو', 'موقع', 'موقعي', 'ويب سايت', 'ويب', 'portfolio'],
  'جوجل': ['جوجل', 'قوقل', 'google', 'سيرش', 'بحث', 'محرك', 'فهرسه', 'ظهور في جوجل'],
  'ذكاء_اصطناعي': ['شات جي بي تي', 'chatgpt', 'gpt', 'ai', 'ذكاء', 'اصطناعي', 'بيربلكسيتي', 'جيميني', 'gemini'],
  'مشكله': ['مش راضي', 'مش شغال', 'عطلان', 'واقف', 'معلق', 'فشل', 'ايرور', 'error', 'مشكله', 'عائق', 'بايظ'],
  'صور': ['صور', 'صوره', 'صوري', 'رفع', 'ابلود', 'upload', 'تنزيل صور', 'حجم الصوره'],
  'حالات': ['حالات', 'حاله', 'كيسيز', 'حالاتي', 'حالات الاسنان', 'cases', 'مرضى', 'شغل'],
  'ترقيه_حالات': ['ترقيه', 'زياده', 'تزويد', 'اكتر', 'اكثر', 'غير محدود', 'unlimited', 'رفع الحد', 'حد الحالات'],
  'سلايدر': ['سلايدر', 'كاروسيل', 'مقارنه', 'قبل وبعد', 'منزلق', 'slider', 'carousel', 'before after'],
  'تطبيق_pwa': ['تثبيت', 'تنزيل التطبيق', 'ابليكيشن', 'برنامج', 'pwa', 'موبايل', 'اندرويد', 'ايفون', 'شاشه رئيسيه', 'تطبيق'],
  'رابط_شخصي': ['رابط', 'لينك', 'لينكي', 'دومين', 'url', 'slug', 'عنوان الموقع', 'شير', 'مشاركه'],
  'اعتماد_ونشر': ['حفظ', 'اعتماد', 'مراجعه', 'نشر', 'ابروفال', 'save', 'approval', 'pending', 'تعديل'],
  'تسجيل_دخول': ['باسورد', 'كلمه سر', 'مرور', 'نسيت', 'ايميل', 'دخول', 'تسجيل', 'حساب', 'لوجن', 'login'],
  'دعم_واتساب': ['واتساب', 'تواصل', 'دعم', 'خدمه عملاء', 'اتصال', 'تليفون', 'فون', 'help', 'whatsapp'],
  'شهادات': ['شهادات', 'شهاده', 'كورسات', 'دورات', 'تدريب', 'ماستر', 'دبلومه', 'certifications'],
  'مقالات': ['مقالات', 'مقال', 'بلوج', 'تدوينه', 'نشر مقال', 'كتابه مقال', 'blogs'],
  'فرق_بينهم': ['الفرق', 'ايه الفرق', 'اختار ايه', 'بورتفوليو ولا سي في', 'المقارنه بين']
};

// 4. Levenshtein Distance for Typo-Tolerance
export function levenshteinDistance(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const row = Array.from({ length: s2.length + 1 }, (_, i) => i);

  for (let i = 0; i < s1.length; i++) {
    let prev = i + 1;
    for (let j = 0; j < s2.length; j++) {
      const val = s1[i] === s2[j] ? row[j] : Math.min(row[j], prev, row[j + 1]) + 1;
      row[j] = prev;
      prev = val;
    }
    row[s2.length] = prev;
  }

  return row[s2.length];
}

export function isFuzzyMatch(word1: string, word2: string): boolean {
  if (word1 === word2) return true;
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen <= 3) return word1 === word2;
  
  const dist = levenshteinDistance(word1, word2);
  if (maxLen <= 5) return dist <= 1;
  return dist <= 2;
}

// 5. Expand Query with Stemmed Tokens & Synonyms
export function analyzeQueryTokens(query: string): {
  rawTokens: string[];
  stemmedTokens: string[];
  canonicalIntents: Set<string>;
} {
  const norm = normalizeArabicText(query);
  const words = norm.split(/\s+/).filter(Boolean);

  const rawTokens: string[] = [];
  const stemmedTokens: string[] = [];
  const canonicalIntents = new Set<string>();

  for (const w of words) {
    rawTokens.push(w);
    const stem = stemArabicWord(w);
    stemmedTokens.push(stem);

    // Check synonym dictionary
    for (const [intent, synonyms] of Object.entries(SYNONYM_DICTIONARY)) {
      if (synonyms.some(syn => normalizeArabicText(syn) === w || normalizeArabicText(syn) === stem || isFuzzyMatch(w, normalizeArabicText(syn)))) {
        canonicalIntents.add(intent);
      }
    }
  }

  return { rawTokens, stemmedTokens, canonicalIntents };
}

export interface MatchResult {
  node: ChatbotNode;
  score: number;
  matchedKeywords: string[];
}

// 6. Intelligent Scoring Engine
export function matchQueryToNodes(
  query: string,
  nodes: ChatbotNode[],
  currentRoute?: string,
  currentStep?: string
): { bestMatch: MatchResult | null; suggestions: ChatbotNode[] } {
  const { rawTokens, stemmedTokens, canonicalIntents } = analyzeQueryTokens(query);
  const normQuery = normalizeArabicText(query);

  const scoredResults: MatchResult[] = [];

  for (const node of nodes) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Normalize node keywords
    for (const rawKw of node.keywords) {
      const normKw = normalizeArabicText(rawKw);
      const stemKw = stemArabicWord(normKw);

      // Check full phrase inclusion
      if (normQuery.includes(normKw)) {
        score += 15;
        matchedKeywords.push(rawKw);
        continue;
      }

      // Check token-by-token
      let kwMatched = false;
      for (let i = 0; i < rawTokens.length; i++) {
        const raw = rawTokens[i];
        const stem = stemmedTokens[i];

        if (raw === normKw) {
          score += 10;
          kwMatched = true;
          break;
        } else if (stem === stemKw) {
          score += 8;
          kwMatched = true;
          break;
        } else if (isFuzzyMatch(raw, normKw) || isFuzzyMatch(stem, stemKw)) {
          score += 7;
          kwMatched = true;
          break;
        }
      }

      if (kwMatched) {
        matchedKeywords.push(rawKw);
      }
    }

    // Check canonical intent match (if node has matching intent in its keywords)
    for (const intent of canonicalIntents) {
      const intentSynonyms = SYNONYM_DICTIONARY[intent] || [];
      const hasIntentMatch = node.keywords.some(kw => {
        const nKw = normalizeArabicText(kw);
        return intentSynonyms.some(syn => normalizeArabicText(syn) === nKw);
      });
      if (hasIntentMatch) {
        score += 8;
      }
    }

    // Contextual route boosting
    if (currentRoute && node.routePattern && currentRoute.startsWith(node.routePattern)) {
      score += 4;
    }

    // Contextual step boosting
    if (currentStep && node.stepPattern && currentStep.toLowerCase().includes(node.stepPattern.toLowerCase())) {
      score += 6;
    }

    if (score > 0) {
      scoredResults.push({ node, score, matchedKeywords });
    }
  }

  // Sort by score descending
  scoredResults.sort((a, b) => b.score - a.score);

  const bestMatch = scoredResults.length > 0 && scoredResults[0].score >= 7 ? scoredResults[0] : null;

  // Generate top 3 suggestions for "Did you mean?" or fallback
  const suggestions = scoredResults
    .filter(r => !bestMatch || r.node.id !== bestMatch.node.id)
    .slice(0, 3)
    .map(r => r.node);

  return { bestMatch, suggestions };
}
