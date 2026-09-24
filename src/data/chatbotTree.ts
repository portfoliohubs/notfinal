export interface SuggestedAction {
  labelAr: string;
  actionType: 'navigate' | 'query' | 'whatsapp' | 'doc';
  payload: string; // URL, question text, or doc slug
}

export interface ChatbotNode {
  id: string;
  routePattern?: string; // e.g. '/portfolio', '/cv', '/dashboard', '/docs'
  stepPattern?: string;  // e.g. 'cases', 'personal', 'photo', 'skills'
  keywords: string[];
  titleAr: string;
  responseAr: string;
  docSlug?: string;
  suggestedActions: SuggestedAction[];
}

export interface DecisionTree {
  contextualNodes: ChatbotNode[];
  generalNodes: ChatbotNode[];
  fallback: {
    messageAr: string;
    suggestedDocs: Array<{ titleAr: string; slug: string }>;
    whatsappNumber: string;
  };
}

export const CHATBOT_DECISION_TREE: DecisionTree = {
  // 1. Contextual Nodes
  contextualNodes: [
    {
      id: 'ctx-portfolio-intro',
      routePattern: '/portfolio',
      stepPattern: 'intro',
      keywords: ['intro', 'مقدمة', 'بداية', 'بورتفوليو', 'start'],
      titleAr: 'مساعد البداية واستعراض النماذج',
      responseAr: 'أهلاً دكتور! أنت في خطوة البداية لبناء بورتفوليو أطباء الأسنان. يمكنك استكشاف نماذج الأطباء لرؤية موقعك برابطه الرسمي. يتم حفظ كافة مدخلاتك تلقائياً.',
      docSlug: 'portfolio-guide',
      suggestedActions: [
        { labelAr: 'دليل البورتفوليو خطوة بخطوة', actionType: 'doc', payload: 'portfolio-guide' },
        { labelAr: 'كيف يعمل الرابط الدائم؟', actionType: 'doc', payload: 'personal-link' },
      ]
    },
    {
      id: 'ctx-portfolio-personal',
      routePattern: '/portfolio',
      stepPattern: 'personal',
      keywords: ['personal', 'اسم', 'شخصي', 'رابط'],
      titleAr: 'مساعد البيانات الشخصية',
      responseAr: 'دكتور، احرص في هذه الخطوة على كتابة اسمك بالإنجليزية بدقة كما تحب أن يظهر (مثلاً: Michael Nabil)، حيث يستخدمه النظام لتوليد رابطك الرسمي Portfoliohubs.web.app/dr[name].',
      docSlug: 'personal-link',
      suggestedActions: [
        { labelAr: 'كيف يعمل الرابط الشخصي؟', actionType: 'doc', payload: 'personal-link' },
        { labelAr: 'توليد الرابط من اسمي', actionType: 'query', payload: 'كيف يتم توليد الرابط من اسمي؟' },
      ]
    },
    {
      id: 'ctx-portfolio-contact',
      routePattern: '/portfolio',
      stepPattern: 'contact',
      keywords: ['contact', 'عيادة', 'تواصل', 'واتساب', 'خريطة', 'موقع'],
      titleAr: 'مساعد بيانات التواصل وموقع العيادة',
      responseAr: 'إضافة رقم الواتساب ورابط موقع عيادتك على خرائط جوجل يسهل تواصل المرضى والزملاء. يتضمن بورتفوليوك أزرار اتصال ومراسلة سريعة ترتبط مباشرة بأرقامك.',
      docSlug: 'personal-link',
      suggestedActions: [
        { labelAr: 'مشاركة الرابط الشخصي', actionType: 'doc', payload: 'personal-link' },
      ]
    },
    {
      id: 'ctx-portfolio-photo',
      routePattern: '/portfolio',
      stepPattern: 'photo',
      keywords: ['photo', 'صورة', 'بروفايل', 'خلفية'],
      titleAr: 'مساعد الصورة الشخصية',
      responseAr: 'ننصح باختيار صورة رسمية بخلفية محايدة أو بالزي الطبي (Scrub). يقوم نظامنا تلقائياً بتهيئة الصورة وضبط أبعادها لتظهر بوضوح فائق على كافة الشاشات.',
      docSlug: 'portfolio-guide',
      suggestedActions: [
        { labelAr: 'دليل البورتفوليو', actionType: 'doc', payload: 'portfolio-guide' },
      ]
    },
    {
      id: 'ctx-portfolio-skills',
      routePattern: '/portfolio',
      stepPattern: 'skills',
      keywords: ['skills', 'مهارات', 'تخصص', 'endo', 'implants', 'composites'],
      titleAr: 'مساعد المهارات المهنية',
      responseAr: 'أضف مجالات تميزك مثل: Endodontics, Aesthetic Composites, Dental Photography, Fixed Prosthodontics لتسهيل استعراض تخصصك في نتائج البحث.',
      docSlug: 'portfolio-guide',
      suggestedActions: [
        { labelAr: 'دليل المهارات وتخصيصها', actionType: 'doc', payload: 'portfolio-guide' },
      ]
    },
    {
      id: 'ctx-portfolio-cases',
      routePattern: '/portfolio',
      stepPattern: 'cases',
      keywords: ['cases', 'حالات', 'رفع', 'صور', 'سلايدر', 'علاج'],
      titleAr: 'مساعد حالات الأسنان والمنزلق التفاعلي',
      responseAr: 'أهلاً دكتور! في هذه الخطوة يمكنك رفع صور متعددة لكل حالة وتحديد عنوان مخصص لكل صورة (مثل: الوضع الأولي، العزل، النتيجة النهائية) مع سلايدر تلقائي كل 3 ثوانٍ.',
      docSlug: 'cases-and-limits',
      suggestedActions: [
        { labelAr: 'دليل رفع الحالات والحدود', actionType: 'doc', payload: 'cases-and-limits' },
        { labelAr: 'ترقية الحالات عبر واتساب', actionType: 'whatsapp', payload: 'طلب ترقية الحالات لحساب غير محدود' },
      ]
    },
    {
      id: 'ctx-cv-preview',
      routePattern: '/cv',
      stepPattern: 'preview',
      keywords: ['preview', 'تنزيل', 'تحميل', 'pdf', 'pptx', 'powerpoint'],
      titleAr: 'مساعد معاينة وتصدير السيرة الذاتية (PDF & PPTX)',
      responseAr: 'وصلت للخطوة الأخيرة! يمكنك الآن تنزيل سيرتك الذاتية بصيغة PDF عالية الوضوح، أو تصديرها كعرض تقديمي PPTX كامل التنسيق بنسبة 16:9 قابل للتعديل بالكامل في PowerPoint.',
      docSlug: 'cv-guide',
      suggestedActions: [
        { labelAr: 'دليل تصدير السيرة الذاتية و PPTX', actionType: 'doc', payload: 'cv-guide' },
        { labelAr: 'بناء بورتفوليو ويب', actionType: 'navigate', payload: '/portfolio' }
      ]
    },
    {
      id: 'ctx-cv',
      routePattern: '/cv',
      keywords: ['cv', 'سيرة ذاتية', 'pdf', 'pptx', 'تنزيل'],
      titleAr: 'مساعد منشئ السيرة الذاتية',
      responseAr: 'أهلاً بك في منشئ السيرة الذاتية! الأداة تتيح لك كتابة بياناتك وتصديرها بصيغتي PDF و PPTX القابلة للتعديل مجاناً.',
      docSlug: 'cv-guide',
      suggestedActions: [
        { labelAr: 'خطوات إنشاء الـ CV', actionType: 'doc', payload: 'cv-guide' },
      ]
    },
    {
      id: 'ctx-dashboard',
      routePattern: '/dashboard',
      keywords: ['dashboard', 'لوحة', 'حسابي', 'تعديل', 'حفظ', 'اعتماد'],
      titleAr: 'مساعد لوحة التحكم',
      responseAr: 'مرحباً دكتور في لوحة التحكم المبسطة! يمكنك هنا تعديل بياناتك وحالاتك وصورك، وإرسال التعديلات للاعتماد عبر شريط الحفظ المباشر.',
      docSlug: 'approval-workflow',
      suggestedActions: [
        { labelAr: 'دورة المراجعة والاعتماد', actionType: 'doc', payload: 'approval-workflow' },
        { labelAr: 'مشاركة الرابط الشخصي', actionType: 'doc', payload: 'personal-link' },
      ]
    }
  ],

  // 2. General Knowledge Nodes
  generalNodes: [
    {
      id: 'node-pptx-export',
      keywords: ['pptx', 'powerpoint', 'عرض', 'عرض تقديمي', 'بوربوينت', 'تعديل', 'قابل للتعديل', 'presentation', 'slides', 'شرائح'],
      titleAr: 'تصدير السيرة الذاتية كعرض PPTX قابل للتعديل',
      responseAr: 'توفر منصة PortfolioHubs ميزة حصرية لتصدير سيرتك الذاتية كعرض تقديمي PPTX بنسبة 16:9 مطابق لتصميم الـ PDF. جميع النصوص والمهارات وعناوين الحالات هي عناصر نصية حقيقية يمكنك تعديل محتواها وألوانها وخطوطها بحرية تامة في برنامج PowerPoint أو Keynote أو Google Slides.',
      docSlug: 'cv-guide',
      suggestedActions: [
        { labelAr: 'دليل تصدير الـ PPTX', actionType: 'doc', payload: 'cv-guide' },
        { labelAr: 'الذهاب لصانع السيرة الذاتية', actionType: 'navigate', payload: '/cv' }
      ]
    },
    {
      id: 'node-pwa-install',
      keywords: ['تثبيت', 'تطبيق', 'pwa', 'install', 'app', 'موبايل', 'شاشة رئيسية', 'اندرويد', 'ايفون', 'home screen'],
      titleAr: 'تثبيت المنصة كتطبيق PWA على هاتفك أو حاسوبك',
      responseAr: 'يمكنك تثبيت منصة PortfolioHubs كتطبيق خفيف وسريع على شاشتك الرئيسية مباشرة دون الحاجة لمتجر التطبيقات، مما يمنحك وصولاً سريعاً وإمكانية تصفح دون اتصال بالإنترنت. اضغط على زر "تثبيت التطبيق" في أعلى الشاشة للبدء.',
      docSlug: 'pwa-guide',
      suggestedActions: [
        { labelAr: 'دليل تثبيت التطبيق PWA', actionType: 'doc', payload: 'pwa-guide' }
      ]
    },
    {
      id: 'node-case-limits',
      keywords: ['حد', 'حدود', '3 حالات', 'كم حالة', 'حالات مجانية', 'limit', 'free cases', 'max cases', 'حالات إضافية', 'تزويد الحالات'],
      titleAr: 'حدود حالات الأسنان وزيادة السعة',
      responseAr: 'تتيح المنصة إضافة حتى 3 حالات علاجية كاملة مجاناً مع صور متعددة لكل حالة. إذا قام المشرف بزيادة حد الحالات لحسابك، فإنه ينعكس فوراً وتلقائياً في لوحة تحكمك دون أي تعليق.',
      docSlug: 'cases-and-limits',
      suggestedActions: [
        { labelAr: 'دليل الحالات والحدود', actionType: 'doc', payload: 'cases-and-limits' },
        { labelAr: 'ترقية الحالات غير المحدودة', actionType: 'whatsapp', payload: 'أرغب في ترقية باقة الحالات إلى غير محدودة' }
      ]
    },
    {
      id: 'node-case-slider-photos',
      keywords: ['صور متعددة', 'سلايدر', 'منزلق', 'صور الحالة', 'before after', 'قبل وبعد', 'slider', 'carousel', 'عدة صور'],
      titleAr: 'الصور المتعددة ومنزلق العرض التلقائي',
      responseAr: 'يمكنك الآن رفع عدة صور لنفس الحالة وتسمية كل صورة بعنوان مخصص يحدده الطبيب بنفسه (مثال: فحص أولي، عزل مطاطي، تشريح الحشوة، النتيجة النهائية). يتم عرض الصور في بورتفوليوك عبر منزلق صور تلقائي يتحرك كل 3 ثوانٍ مع إمكانية التمرير اليدوي السلس.',
      docSlug: 'portfolio-guide',
      suggestedActions: [
        { labelAr: 'دليل البورتفوليو وتنسيق الأقسام', actionType: 'doc', payload: 'portfolio-guide' }
      ]
    },
    {
      id: 'node-certifications-blogs',
      keywords: ['شهادات', 'شهادة', 'كورسات', 'دورات', 'مقال', 'مقالات', 'تدوينات', 'blogs', 'certifications', 'courses'],
      titleAr: 'قسم الشهادات المعتمدة والمقالات',
      responseAr: 'يحتوي البورتفوليو على قسم مخصص للشهادات (Certifications) يقع قبل الحالات ويظهر فقط إذا أضاف الطبيب شهاداته، بينما يختفي تماماً إذا كان فارغاً لضمان تناسق الصفحة. كما يحتوي على قسم المقالات الطبية (Blogs) بعد الحالات مباشرة.',
      docSlug: 'portfolio-guide',
      suggestedActions: [
        { labelAr: 'دليل تخصيص أقسام البورتفوليو', actionType: 'doc', payload: 'portfolio-guide' }
      ]
    },
    {
      id: 'node-save-approval',
      keywords: ['حفظ', 'اعتماد', 'مراجعة', 'نشر', 'save', 'review', 'pending', 'تعديل البيانات', 'إرسال للمراجعة'],
      titleAr: 'حفظ التعديلات وإرسالها للمراجعة والاعتماد',
      responseAr: 'تتميز لوحة التحكم بشريط إجراءات عائم في أسفل الصفحة يتيح لك "حفظ التعديلات وإرسالها للمراجعة والاعتماد". تتيح لوحة الإدارة للمشرفين مراجعة كافة بياناتك وحالاتك وشهاداتك وتعديلها واعتمادها لنشرها فوراً.',
      docSlug: 'approval-workflow',
      suggestedActions: [
        { labelAr: 'دورة الاعتماد والنشر', actionType: 'doc', payload: 'approval-workflow' }
      ]
    },
    {
      id: 'node-personal-link',
      keywords: ['رابط', 'لينك', 'slug', 'url', 'link', 'عنوان', 'رابطي', 'موقعي', 'دومين', 'domain'],
      titleAr: 'الرابط المهني ومشاركته',
      responseAr: 'يحصل كل طبيب على رابط رسمي سريع وآمن بصيغة: https://portfoliohubs.pages.dev/dr[name] وهو مستضاف على Firebase ومحمي بشهادة أمان عالمية.',
      docSlug: 'personal-link',
      suggestedActions: [
        { labelAr: 'دليل استخدام الرابط', actionType: 'doc', payload: 'personal-link' }
      ]
    },
    {
      id: 'node-login-auth',
      keywords: ['تسجيل', 'دخول', 'باسورد', 'كلمة مرور', 'إيميل', 'login', 'password', 'reset', 'استعادة', 'حساب'],
      titleAr: 'المصادقة وتسجيل الدخول',
      responseAr: 'يمكنك استخدام بريدك الإلكتروني أو حساب جوجل. إذا واجهت مشكلة في الدخول، تأكد من إلغاء حظر النوافذ المنبثقة أو اضغط "نسيت كلمة المرور" لاستلام رابط فوري لإعادة التعيين.',
      docSlug: 'auth-troubleshooting',
      suggestedActions: [
        { labelAr: 'حل مشاكل الدخول', actionType: 'doc', payload: 'auth-troubleshooting' }
      ]
    }
  ],

  // 3. Fallback when no keyword matches — Gentle referral to docs center
  fallback: {
    messageAr: 'لم أستطع العثور على إجابة دقيقة لسؤالك في قاعدة الإجابات السريعة. يسعدنا توجيهك لمركز التوثيق الشامل للبحث في كافة الأدلة والشروحات، أو التواصل مباشرة مع فريق الدعم:',
    suggestedDocs: [
      { titleAr: 'دليل البدء السريع', slug: 'quickstart' },
      { titleAr: 'دليل البورتفوليو وتخصيص الأقسام', slug: 'portfolio-guide' },
      { titleAr: 'دليل السيرة الذاتية وتصدير PPTX', slug: 'cv-guide' },
      { titleAr: 'رفع حالات الأسنان وحدود الحالات', slug: 'cases-and-limits' },
      { titleAr: 'تثبيت التطبيق على جهازك (PWA)', slug: 'pwa-guide' },
    ],
    whatsappNumber: '201271476215'
  }
};
