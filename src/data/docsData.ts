export interface DocSection {
  id: string;
  title: string;
  level: 2 | 3;
  content: string;
  tips?: string[];
  warning?: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export interface DocArticle {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  category: 'getting-started' | 'core-services' | 'cases-media' | 'publishing-seo' | 'account-billing';
  categoryTitleAr: string;
  badge?: string;
  readingTime: string;
  lastUpdated: string;
  summaryAr: string;
  sections: DocSection[];
  svgDiagramType?: 'quickstart' | 'cv-flow' | 'portfolio-flow' | 'case-limits' | 'image-pipeline' | 'deploy-flow' | 'personal-link' | 'seo-ai' | 'auth-flow' | 'upgrade-plan';
  relatedSlugs: string[];
}

export const DOC_CATEGORIES = [
  { id: 'getting-started', titleAr: 'البدء وتثبيت التطبيق', icon: 'Rocket' },
  { id: 'core-services', titleAr: 'الخدمات الأساسية (البورتفوليو والسيرة الذاتية)', icon: 'Layers' },
  { id: 'cases-media', titleAr: 'حالات العلاج والصور والشهادات', icon: 'Image' },
  { id: 'publishing-seo', titleAr: 'النشر والأرشفة ومحركات الذكاء الاصطناعي', icon: 'Globe' },
  { id: 'account-billing', titleAr: 'لوحة التحكم والترقية والدعم الفني', icon: 'ShieldCheck' },
] as const;

export const DOCS_ARTICLES: DocArticle[] = [
  {
    id: 'quickstart',
    slug: 'quickstart',
    category: 'getting-started',
    categoryTitleAr: 'البدء وتثبيت التطبيق',
    badge: 'أساسي',
    titleAr: 'دليل البدء السريع في PortfolioHubs',
    titleEn: 'Quickstart Guide for Dental Professionals',
    readingTime: '3 دقائق',
    lastUpdated: 'سبتمبر 2026',
    summaryAr: 'كل ما تحتاج لمعرفته لبدء حضورك المهني كطبيب أو طالب أسنان واختيار الخدمة المناسبة لك.',
    svgDiagramType: 'quickstart',
    relatedSlugs: ['portfolio-guide', 'cv-guide', 'pwa-guide', 'personal-link'],
    sections: [
      {
        id: 'overview',
        title: 'نظرة عامة على المنصة',
        level: 2,
        content: 'صُممت منصة PortfolioHubs خصيصاً لتلبية احتياجات أطباء وطلبة كليات طب الأسنان. تمنحك المنصة موقعاً مهنياً مستقلاً وسريعاً، بالإضافة إلى أدوات متطورة لتوليد السيرة الذاتية المهنية بصيغتي PDF و PPTX القابلة للتعديل بالكامل.'
      },
      {
        id: 'two-services',
        title: 'الخدمات الأساسية في المنصة',
        level: 2,
        content: '1. **بورتفوليو أطباء الأسنان (Dental Web Portfolio):** موقع ويب رسمي يحمل اسمك، يوثق حالات علاج الأسنان عبر منزلق صور تفاعلي متعدد الصور، الشهادات، المقالات، والمهارات، مع تهيئة للتصدر في نتائج البحث وتطبيقات الذكاء الاصطناعي.\n2. **صانع السيرة الذاتية المهنية (CV Maker):** أداة ذكية لتوليد سيرة ذاتية بصيغة PDF قياسية وصيغة عرض تقديمي PPTX قابلة للتعديل بالكامل في PowerPoint.'
      },
      {
        id: 'three-steps',
        title: 'خطوات البدء',
        level: 2,
        content: '1. **سجل دخولك:** بحساب جوجل أو بريدك الإلكتروني.\n2. **املأ المعالج الذكي:** أدخل بياناتك وتفاصيل الحالات والشهادات.\n3. **احفظ وانشر:** احفظ التعديلات بسهولة لإرسالها للاعتماد الفوري.'
      }
    ]
  },
  {
    id: 'pwa-guide',
    slug: 'pwa-guide',
    category: 'getting-started',
    categoryTitleAr: 'البدء وتثبيت التطبيق',
    badge: 'جديد',
    titleAr: 'تثبيت المنصة كتطبيق على الهاتف والحاسوب (PWA)',
    titleEn: 'Install PortfolioHubs as a Progressive Web App',
    readingTime: '3 دقائق',
    lastUpdated: 'سبتمبر 2026',
    summaryAr: 'كيفية تثبيت PortfolioHubs على شاشتك الرئيسية للوصول السريع وإدارة الحالات دون الحاجة لمتجر التطبيقات.',
    relatedSlugs: ['quickstart', 'portfolio-guide'],
    sections: [
      {
        id: 'what-is-pwa',
        title: 'مميزات تطبيق الويب التقدمي (PWA)',
        level: 2,
        content: 'تطبيق الويب التقدمي يمنحك تجربة تطبيق أصيل خفيف وسريع، يعمل بكفاءة على كافة أنظمة التشغيل (Android, iOS, Windows, macOS) دون استهلاك لمساحة التخزين أو الحاجة للتحديثات اليدوية.'
      },
      {
        id: 'how-to-install',
        title: 'طريقة التثبيت',
        level: 2,
        content: '- **على أجهزة أندرويد والكمبيوتر:** اضغط على زر "تثبيت التطبيق" الظاهر في أعلى الشاشة.\n- **على أجهزة آيفون (iOS Safari):** اضغط على زر المشاركة (Share) في المتصفح ثم اختر "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).'
      }
    ]
  },
  {
    id: 'cv-guide',
    slug: 'cv-guide',
    category: 'core-services',
    categoryTitleAr: 'الخدمات الأساسية',
    badge: 'تصدير مزدوج',
    titleAr: 'دليل إنشاء السيرة الذاتية وتصديرها بصيغة PDF و PPTX',
    titleEn: 'Step-by-step Dental CV Generator Guide',
    readingTime: '5 دقائق',
    lastUpdated: 'سبتمبر 2026',
    summaryAr: 'كيفية كتابة سيرة ذاتية طبية متوافقة وتصديرها كملف PDF عالي الوضوح أو كعرض تقديمي PPTX قابل للتعديل بالكامل.',
    svgDiagramType: 'cv-flow',
    relatedSlugs: ['quickstart', 'portfolio-guide'],
    sections: [
      {
        id: 'cv-stepper',
        title: 'مراحل بناء السيرة الذاتية',
        level: 2,
        content: 'يتكون معالج السيرة الذاتية من خطوات متناسقة:\n\n1. **البيانات الشخصية:** الاسم بالكامل، المسمى المهني، وسنة التخرج.\n2. **بيانات التواصل:** الهاتف، الواتساب، والبريد الإلكتروني.\n3. **الصورة الشخصية:** صورة واضحة بنسب هندسية متناسقة.\n4. **المهارات:** المهارات التخصصية، التقنية، والمهارات الشخصية (يتم عرض كل مهارة في سطر مستقل بخط كبير وواضح).\n5. **المسار المهني:** المحطات التعليمية وسنوات التدريب.\n6. **حالات الأسنان:** إضافة صور الحالات ونبذة الإجراء العلاجي.\n7. **المعاينة والتنزيل:** خيار التصدير المزدوج كـ PDF أو كـ PPTX.'
      },
      {
        id: 'pptx-export',
        title: 'ميزة التصدير كعرض PPTX قابل للتعديل',
        level: 2,
        content: 'يمكنك بضغطة زر تنزيل ملف PowerPoint بنسبة عرض 16:9 كامل التنسيق. جميع النصوص والعناوين والصور داخل الملف هي عناصر أصلية قابلة للتعديل والكتابة وتغيير الألوان والخطوط بحرية داخل برامج Microsoft PowerPoint أو Google Slides أو Apple Keynote.'
      }
    ]
  },
  {
    id: 'portfolio-guide',
    slug: 'portfolio-guide',
    category: 'core-services',
    categoryTitleAr: 'الخدمات الأساسية',
    badge: 'شامل',
    titleAr: 'دليل بناء بورتفوليو أطباء الأسنان وتخصيص الأقسام',
    titleEn: 'Step-by-step Dental Web Portfolio Guide',
    readingTime: '6 دقائق',
    lastUpdated: 'سبتمبر 2026',
    summaryAr: 'بناء موقعك المهني، تنظيم الشهادات وحالات الأسنان والمقالات، وتفعيل منزلق الصور التلقائي.',
    svgDiagramType: 'portfolio-flow',
    relatedSlugs: ['cases-and-limits', 'approval-workflow'],
    sections: [
      {
        id: 'sections-order',
        title: 'ترتيب أقسام البورتفوليو المعتمد',
        level: 2,
        content: 'يتبع البورتفوليو تسلسلاً مهنياً دقيقاً:\n\n1. **الواجهة الرئيسية والنبذة الشخصية (Hero):** الاسم والمؤهل وصورة الطبيب.\n2. **المهارات المهنية (Skills):** مهارات العلاج والتقنيات الحديثة.\n3. **المسار الأكاديمي والتعليم (Education & Timeline):** التخرج ومحطات التدريب.\n4. **الشهادات المعتمدة (Certifications):** تظهر قبل الحالات إذا أضاف الطبيب شهادات، وتختفي تلقائياً إذا كانت فارغة.\n5. **معرض حالات الأسنان (Dental Cases):** منزلق صور تلقائي (Auto-slider كل 3 ثوانٍ) يدعم صوراً متعددة مع نصوص مخصصة لكل صورة.\n6. **المقالات والتدوينات (Blogs):** مقالات توعوية ومهنية تظهر بعد الحالات مباشرة.\n7. **بيانات التواصل وموقع العيادة (Contact & Clinic).**'
      }
    ]
  },
  {
    id: 'cases-and-limits',
    slug: 'cases-and-limits',
    category: 'cases-media',
    categoryTitleAr: 'حالات العلاج والصور والشهادات',
    badge: 'الحدود وإدارة الحالات',
    titleAr: 'رفع حالات الأسنان وإدارة حد الحالات',
    titleEn: 'Dental Cases Upload & Limits',
    readingTime: '4 دقائق',
    lastUpdated: 'سبتمبر 2026',
    summaryAr: 'كيفية رفع صور الحالات المتعددة، كتابة التوصيف المخصص، وتحديث حد الحالات ومراجعته في لوحة التحكم.',
    svgDiagramType: 'case-limits',
    relatedSlugs: ['portfolio-guide', 'approval-workflow'],
    sections: [
      {
        id: 'multi-photo-cases',
        title: 'دعم الصور المتعددة وتخصيص العناوين',
        level: 2,
        content: 'يمكنك الآن إضافة عدة صور لنفس الحالة بدلاً من التقيد بصورتين فقط. لكل صورة، يمكنك كتابة الوصف الخاص بها (مثل: الوضع الأولي، مرحلة العزل، النتيجة النهائية) لتعرض بسلاسة عبر السلايدر التفاعلي.'
      },
      {
        id: 'case-limits-sync',
        title: 'تحديث حد الحالات الفوري',
        level: 2,
        content: 'يتم مزامنة حد الحالات المخصص لك تلقائياً بين لوحة الإدارة ولوحة الطبيب، ليتيح لك إضافة الحالات المعتمدة فوراً دون أي قيود ثابتة.'
      }
    ]
  },
  {
    id: 'approval-workflow',
    slug: 'approval-workflow',
    category: 'publishing-seo',
    categoryTitleAr: 'النشر والأرشفة ومحركات الذكاء الاصطناعي',
    titleAr: 'دورة المراجعة والاعتماد ونظام الحفظ الذكي',
    titleEn: 'Review, Save & Publication Workflow',
    readingTime: '4 دقائق',
    lastUpdated: 'سبتمبر 2026',
    summaryAr: 'شرح زر الحفظ والمراجعة العائم وكيفية مراجعة الإدارة للتعديلات ونشرها.',
    svgDiagramType: 'deploy-flow',
    relatedSlugs: ['portfolio-guide', 'personal-link'],
    sections: [
      {
        id: 'save-workflow',
        title: 'شريط الحفظ والإرسال للمراجعة',
        level: 2,
        content: 'توفر لوحة التحكم شريط حفظ واضح يتيح لك حفظ كافة تعديلاتك وإرسالها بضغطة زر واحدة لتكون جاهزة للمراجعة والاعتماد السريع من قبل إدارة المنصة.'
      },
      {
        id: 'admin-full-control',
        title: 'التحكم الإداري الشامل',
        level: 2,
        content: 'تمتلك الإدارة إمكانية مراجعة وتحديث كامل بيانات الأطباء وصور الحالات والشهادات والمهارات بدقة لضمان أعلى معايير الجودة قبل النشر.'
      }
    ]
  },
  {
    id: 'personal-link',
    slug: 'personal-link',
    category: 'getting-started',
    categoryTitleAr: 'البدء وتثبيت التطبيق',
    badge: 'دائم',
    titleAr: 'الحصول على الرابط الشخصي ومشاركته مع المرضى والزملاء',
    titleEn: 'Getting Your Personal URL & Sharing It',
    readingTime: '4 دقائق',
    lastUpdated: 'سبتمبر 2026',
    summaryAr: 'كيفية الحصول على عنوان الرابط الفريد ومشاركته في بطاقة عملك وحساباتك المهنية.',
    svgDiagramType: 'personal-link',
    relatedSlugs: ['quickstart', 'approval-workflow'],
    sections: [
      {
        id: 'url-structure',
        title: 'هيكل الرابط المهني الدائم',
        level: 2,
        content: 'يحصل كل طبيب على رابط رسمي سريع التحميل ومحمي بشهادة أمان SSL عالمية:\n\n`https://portfoliohubs.pages.dev/dr[اسمك]`'
      }
    ]
  }
];

export function getDocArticleBySlug(slug: string): DocArticle | undefined {
  return DOCS_ARTICLES.find(a => a.slug === slug || a.id === slug);
}
