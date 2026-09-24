import React from 'react';

interface DiagramProps {
  type?: string;
  className?: string;
}

export default function DocsDiagram({ type, className = '' }: DiagramProps) {
  switch (type) {
    case 'quickstart':
      return (
        <div className={`p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs my-6 ${className}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">مخطط مسار البدء السريع • 3 دقائق</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand/10 text-brand font-medium">سريع ومباشر</span>
          </div>
          <svg viewBox="0 0 700 160" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Step 1 */}
            <rect x="20" y="20" width="180" height="120" rx="14" className="fill-brand/5 stroke-brand/30" strokeWidth="2" />
            <circle cx="110" cy="55" r="22" className="fill-brand text-white" />
            <path d="M102 55h16M110 47v16" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <text x="110" y="96" textAnchor="middle" className="fill-foreground font-bold text-sm">1. تسجيل الدخول</text>
            <text x="110" y="116" textAnchor="middle" className="fill-muted-foreground text-xs">حساب مجاني فوري</text>

            {/* Arrow 1 */}
            <path d="M210 80h50" stroke="var(--brand)" strokeWidth="2.5" strokeDasharray="4 4" />
            <polygon points="262,80 252,74 252,86" fill="var(--brand)" />

            {/* Step 2 */}
            <rect x="270" y="20" width="180" height="120" rx="14" className="fill-brand/10 stroke-brand/50" strokeWidth="2" />
            <circle cx="360" cy="55" r="22" className="fill-brand" />
            <path d="M350 55l7 7 14-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="360" y="96" textAnchor="middle" className="fill-foreground font-bold text-sm">2. ملء معالج الخطوات</text>
            <text x="360" y="116" textAnchor="middle" className="fill-muted-foreground text-xs">حفظ تلقائي وضغط صور</text>

            {/* Arrow 2 */}
            <path d="M460 80h50" stroke="var(--brand)" strokeWidth="2.5" strokeDasharray="4 4" />
            <polygon points="512,80 502,74 502,86" fill="var(--brand)" />

            {/* Step 3 */}
            <rect x="520" y="20" width="160" height="120" rx="14" className="fill-emerald-500/10 stroke-emerald-500/40" strokeWidth="2" />
            <circle cx="600" cy="55" r="22" className="fill-emerald-600" />
            <path d="M592 55l6 6 12-12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="600" y="96" textAnchor="middle" className="fill-foreground font-bold text-sm">3. انطلاق الرابط</text>
            <text x="600" y="116" textAnchor="middle" className="fill-emerald-600 font-semibold text-xs">جاهز لجوجل والمرضى</text>
          </svg>
        </div>
      );

    case 'case-limits':
      return (
        <div className={`p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs my-6 ${className}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">مقارنة باقات حالات الأسنان</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">تكلفة استضافة صفرية</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border-2 border-brand/20 bg-brand/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm">الباقة المجانية الافتراضية</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand text-white font-bold">3 حالات</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                متاحة فوراً لكل طبيب وطالب مجاناً مدى الحياة. تشمل صور قبل وبعد، تصنيف التخصص، وصف الحالة، ونشر فوري على Firebase Hosting.
              </p>
            </div>
            <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm">الترقية الاحترافية</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">غير محدود</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                تفعيل مباشر عبر واتساب (<span className="font-mono text-brand font-bold">201271476215+</span>). عدد حالات غير محدود، تصنيف متقدم، إمكانية ربط دومين خاص وأرشفة مكثفة.
              </p>
            </div>
          </div>
        </div>
      );

    case 'image-pipeline':
      return (
        <div className={`p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs my-6 ${className}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">معمارية معالجة وتخزين الصور المهنية</span>
            <span className="text-[11px] text-muted-foreground">تجنب مشكلة الـ 1MB لـ Firestore</span>
          </div>
          <svg viewBox="0 0 720 150" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Box 1: Camera */}
            <rect x="10" y="25" width="180" height="100" rx="12" className="fill-muted/40 stroke-border" strokeWidth="2" />
            <text x="100" y="60" textAnchor="middle" className="fill-foreground font-bold text-xs">صورة كاميرا العيادة / الهاتف</text>
            <text x="100" y="85" textAnchor="middle" className="fill-rose-500 font-semibold text-xs">الحجم الأصلي: 8 - 15 MB</text>

            {/* Arrow 1 */}
            <path d="M200 75h50" stroke="var(--brand)" strokeWidth="2" />
            <polygon points="252,75 244,70 244,80" fill="var(--brand)" />

            {/* Box 2: Canvas Compression */}
            <rect x="260" y="25" width="200" height="100" rx="12" className="fill-brand/10 stroke-brand" strokeWidth="2" />
            <text x="360" y="55" textAnchor="middle" className="fill-brand font-bold text-xs">ضغط متصفح فوري (Canvas)</text>
            <text x="360" y="75" textAnchor="middle" className="fill-foreground font-semibold text-xs">الحجم بعد الضغط: ~180 KB</text>
            <text x="360" y="95" textAnchor="middle" className="fill-emerald-600 font-medium text-[10px]">حفظ التباين وملمس السن 100%</text>

            {/* Arrow 2 */}
            <path d="M470 75h50" stroke="var(--brand)" strokeWidth="2" />
            <polygon points="522,75 514,70 514,80" fill="var(--brand)" />

            {/* Box 3: Repository Storage */}
            <rect x="530" y="25" width="180" height="100" rx="12" className="fill-emerald-500/10 stroke-emerald-500/40" strokeWidth="2" />
            <text x="620" y="55" textAnchor="middle" className="fill-foreground font-bold text-xs">ملف حقيقي في المستودع</text>
            <text x="620" y="75" textAnchor="middle" className="fill-muted-foreground text-xs">Firebase Hosting CDN</text>
            <text x="620" y="95" textAnchor="middle" className="fill-emerald-600 font-bold text-[10px]">تحميل فوري بلا قيود</text>
          </svg>
        </div>
      );

    case 'deploy-flow':
      return (
        <div className={`p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs my-6 ${className}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">سير العمل الآلي لنشر صفحات البورتفوليو</span>
            <span className="text-[11px] text-emerald-600 font-semibold">أرشفة خلال 3 إلى 7 أيام</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="w-full sm:w-1/3 p-3 rounded-xl bg-muted/40 border border-border text-center">
              <div className="font-bold text-foreground mb-1">1. بيانات الطبيب في Firestore</div>
              <div className="text-[11px] text-muted-foreground">حفظ منظم في مجموعات فرعية للعيادة والحالات</div>
            </div>
            <div className="text-brand font-bold text-lg hidden sm:block">←</div>
            <div className="w-full sm:w-1/3 p-3 rounded-xl bg-brand/10 border border-brand/30 text-center">
              <div className="font-bold text-brand mb-1">2. مسار GitHub Actions</div>
              <div className="text-[11px] text-foreground">توليد صفحات سريعة مزودة بوسوم SEO ومخطط Schema</div>
            </div>
            <div className="text-brand font-bold text-lg hidden sm:block">←</div>
            <div className="w-full sm:w-1/3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="font-bold text-emerald-600 mb-1">3. نشر Firebase Hosting</div>
              <div className="text-[11px] text-muted-foreground">رابط دائم `dr[name]` بسرعة 100/100</div>
            </div>
          </div>
        </div>
      );

    case 'personal-link':
      return (
        <div className={`p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs my-6 ${className}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">تشريح الرابط الطبي الرسمي</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand/10 text-brand font-bold">HTTPS مشفر</span>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/60 border border-border font-mono text-xs sm:text-sm text-center text-foreground flex flex-wrap items-center justify-center gap-1.5" dir="ltr">
            <span className="text-muted-foreground">https://</span>
            <span className="text-foreground font-bold">portfoliohubs.web.app</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-brand font-extrabold bg-brand/10 px-2 py-0.5 rounded-md border border-brand/30">dr[your-name]</span>
            <span className="text-muted-foreground">/</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground text-center" dir="rtl">
            يُنشأ الرابط تلقائياً من اسمك الإنجليزي ويمنحك حضوراً رسمياً موثوقاً دون أي تكاليف نطاق أو سيرفرات.
          </div>
        </div>
      );

    case 'seo-ai':
      return (
        <div className={`p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs my-6 ${className}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">تغذية محركات البحث ونماذج الذكاء الاصطناعي</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand/10 text-brand font-medium">Schema.org Dentist</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="font-bold text-foreground mb-1">بيانات منظمة طبية</div>
              <div className="text-[11px] text-muted-foreground">JSON-LD معتمد يحتوي التخصص والعنوان ورقم العيادة</div>
            </div>
            <div className="p-3 rounded-xl bg-brand/5 border border-brand/20">
              <div className="font-bold text-brand mb-1">محرك بحث جوجل</div>
              <div className="text-[11px] text-muted-foreground">ظهور اسمك في بحث أطباء الأسنان والنتائج الجغرافية</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="font-bold text-emerald-600 mb-1">ChatGPT & Gemini</div>
              <div className="text-[11px] text-muted-foreground">اقتراح اسمك عند استشارة المرضى عن أطباء أسنان موثوقين</div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
