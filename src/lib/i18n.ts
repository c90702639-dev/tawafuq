import type { Locale, CoupleArchetype } from '@/types'

// ─── Couple archetypes ────────────────────────────────────────────────────────
export const COUPLE_ARCHETYPES: CoupleArchetype[] = [
  {
    label:       'توأمان',
    labelEn:     'Twin Souls',
    minScore:    90,
    description: 'أنتما متطابقان في القيم والتطلعات. نادر جداً.',
  },
  {
    label:       'أحلام مشتركة',
    labelEn:     'Shared Dreams',
    minScore:    75,
    description: 'توافق عميق يبشّر بمستقبل استثنائي.',
  },
  {
    label:       'رفقاء درب',
    labelEn:     'Fellow Travellers',
    minScore:    60,
    description: 'تشاركان ما يكفي لتكملا الطريق معاً بثقة.',
  },
  {
    label:       'توازن جميل',
    labelEn:     'Beautiful Balance',
    minScore:    45,
    description: 'اختلافاتكما تكمّل بعضها — هذا سر الجاذبية.',
  },
  {
    label:       'تكامل مثير',
    labelEn:     'Exciting Complement',
    minScore:    0,
    description: 'متباعدان في بعض الجوانب — لكن التنوع يثري العلاقات.',
  },
]

export function getArchetype(score: number): CoupleArchetype {
  return (
    COUPLE_ARCHETYPES.find((a) => score >= a.minScore) ??
    COUPLE_ARCHETYPES[COUPLE_ARCHETYPES.length - 1]
  )
}

// ─── Category labels ──────────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  marriage:    { ar: 'الزواج والمستقبل',    en: 'Marriage & Future' },
  personality: { ar: 'الشخصية والقيم',      en: 'Personality & Values' },
  lifestyle:   { ar: 'نمط الحياة والعادات', en: 'Lifestyle & Habits' },
  love:        { ar: 'لغة الحب',            en: 'Love Language' },
  kids:        { ar: 'الأطفال والعائلة',    en: 'Kids & Family' },
  ambitions:   { ar: 'الطموحات والأهداف',   en: 'Ambitions & Goals' },
}

// ─── UI strings ───────────────────────────────────────────────────────────────
const strings: Record<Locale, Record<string, string>> = {
  ar: {
    // General
    'app.name':            'توافق',
    'app.tagline':         'اكتشفا مدى توافقكما',

    // Home
    'home.hero.title':     'كم أنتما متوافقان؟',
    'home.hero.subtitle':  'ثلاثون سؤالاً. ستة محاور. نتيجة واحدة مشتركة.',
    'home.cta.create':     'ابدأ جلسة جديدة',
    'home.cta.join':       'انضم إلى جلسة',
    'home.name.label':     'ما اسمك أو لقبك؟',
    'home.name.placeholder':'اسمك هنا...',
    'home.name.submit':    'ابدأ',

    // Quiz
    'quiz.question':       'السؤال',
    'quiz.of':             'من',
    'quiz.prediction.title':'ماذا تعتقد؟',
    'quiz.prediction.subtitle':'ما الإجابة التي اخترها شريكك برأيك؟',
    'quiz.submit':         'تأكيد الإجابة',
    'quiz.skip':           'تخطّ هذا السؤال',
    'quiz.skip.remaining': 'يمكنك تخطّي {{n}} أسئلة كحد أقصى',
    'quiz.done.title':     'أحسنت! انتهيت.',
    'quiz.done.subtitle':  'ننتظر شريكك الآن...',

    // Waiting
    'waiting.title':       'في انتظار شريكك',
    'waiting.subtitle':    'شارك الرابط وانتظر — ستُفتح النتائج تلقائياً',
    'waiting.link.copied': 'تم نسخ الرابط',
    'waiting.link.copy':   'نسخ الرابط',

    // Results
    'results.title':       'نتائجكما',
    'results.compatibility':'نسبة التوافق',
    'results.empathy.a':   'مدى معرفة {{name}} لشريكه',
    'results.empathy.b':   'مدى معرفة {{name}} لشريكه',
    'results.breakdown':   'التفصيل حسب المحور',
    'results.reveal.cta':  'استكشفا إجاباتكما معاً',
    'results.archetype.label': 'لقبكما معاً',

    // Reveal
    'reveal.title':        'إجاباتكما وجهاً لوجه',
    'reveal.matched':      'متطابقان',
    'reveal.different':    'مختلفان',
    'reveal.prediction.correct':  '{{name}} توقّع هذا',
    'reveal.prediction.wrong':    '{{name}} توقّع غيره',
    'reveal.category.header':     'محور: {{category}}',

    // Share
    'share.title':         'شاركا نتائجكما',
    'share.download.card': 'تحميل البطاقة',
    'share.download.pdf':  'تحميل التقرير',
    'share.whatsapp':      'مشاركة عبر واتساب',
    'share.generating':    'جارٍ الإعداد...',

    // Errors
    'error.session.notfound': 'لم يُعثر على الجلسة. تحقق من الرابط.',
    'error.generic':          'حدث خطأ ما. حاول مجدداً.',
  },
  en: {
    'app.name':            'Tawafuq',
    'app.tagline':         'Discover how compatible you are',
    'home.hero.title':     'How compatible are you?',
    'home.hero.subtitle':  'Thirty questions. Six dimensions. One shared result.',
    'home.cta.create':     'Start a new session',
    'home.cta.join':       'Join a session',
    'home.name.label':     'What\'s your name or nickname?',
    'home.name.placeholder':'Your name...',
    'home.name.submit':    'Start',
    'quiz.question':       'Question',
    'quiz.of':             'of',
    'quiz.prediction.title':'What do you think?',
    'quiz.prediction.subtitle':'Which answer do you think your partner chose?',
    'quiz.submit':         'Confirm answer',
    'quiz.skip':           'Skip this question',
    'quiz.skip.remaining': 'You can skip up to {{n}} questions',
    'quiz.done.title':     'All done!',
    'quiz.done.subtitle':  'Waiting for your partner now...',
    'waiting.title':       'Waiting for your partner',
    'waiting.subtitle':    'Share the link — results open automatically when they finish',
    'waiting.link.copied': 'Link copied',
    'waiting.link.copy':   'Copy link',
    'results.title':       'Your results',
    'results.compatibility':'Compatibility',
    'results.empathy.a':   'How well {{name}} knows their partner',
    'results.empathy.b':   'How well {{name}} knows their partner',
    'results.breakdown':   'Breakdown by category',
    'results.reveal.cta':  'Explore your answers together',
    'results.archetype.label': 'Your couple nickname',
    'reveal.title':        'Your answers face to face',
    'reveal.matched':      'Match',
    'reveal.different':    'Different',
    'reveal.prediction.correct':  '{{name}} predicted this',
    'reveal.prediction.wrong':    '{{name}} guessed differently',
    'reveal.category.header':     'Category: {{category}}',
    'share.title':         'Share your results',
    'share.download.card': 'Download card',
    'share.download.pdf':  'Download report',
    'share.whatsapp':      'Share on WhatsApp',
    'share.generating':    'Preparing...',
    'error.session.notfound': 'Session not found. Check the link.',
    'error.generic':          'Something went wrong. Please try again.',
  },
}

// ─── t() — translate ──────────────────────────────────────────────────────────
let _locale: Locale = 'ar'

export function setLocale(locale: Locale): void {
  _locale = locale
  document.documentElement.lang = locale
  document.documentElement.dir  = locale === 'ar' ? 'rtl' : 'ltr'
}

export function getLocale(): Locale {
  return _locale
}

export function t(key: string, vars?: Record<string, string>): string {
  let str = strings[_locale][key] ?? strings['ar'][key] ?? key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{{${k}}}`, v)
    })
  }
  return str
}

// ─── Number formatting ────────────────────────────────────────────────────────
export function formatPercent(value: number, locale: Locale = _locale): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style:            'percent',
    maximumFractionDigits: 0,
  }).format(value / 100)
}

export function formatNumber(value: number, locale: Locale = _locale): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(value)
}

// ─── RTL utilities ────────────────────────────────────────────────────────────
export function isRTL(): boolean {
  return _locale === 'ar'
}
