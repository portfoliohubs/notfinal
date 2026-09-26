# خطة الإصلاح الشاملة - PortfolioHubs

## تاريخ المراجعة: 2026-09-26
## الهدف: إصلاح جميع الأخطاء المتعلقة بالمزامنة، موقع الطبيب، ومعلومات chatbot

---

## أولاً: لوحة تحكم الأدمن (AdminDashboard) - التزامن الفعلي

### المشكلة حالياً:
- لوحات التحكم تعتمد على سحب البيانات عبر API (`/api/admin/doctors`) بدلاً من الاستماع الفعلي (Realtime / onSnapshot) من قاعدة D1 / Firestore.
- لا يوجد مصدر موحد (Single Source of Truth) بين لوحة الأدمن والبيانات المنشورة (`published_portfolios`).
- عند قيام الأدمن بالموافقة على طبيب (approve)، يتم الكتابة لـ `users` و `published_portfolios` و `portfolios` و `slugs`، لكن لوحة الأدمن لا تُحدّث تلقائياً بعد النشر.

### خطة الإصلاح:
1. **إضافة استماع فعلي (Realtime Listener)** في `AdminDashboard.tsx` على `/api/admin/doctors` أو عبر `onSnapshot` إذا كان هناك اتصال مباشر بـ Firestore/D1.
2. **إنشاء مصدر موحد للمزامنة** (`src/lib/adminSync.ts`) يربط بين:
   - `users` (البيانات الشخصية)
   - `portfolios` (المسودة)
   - `published_portfolios` (النشر النهائي)
   - `slugs` (الرابط الرسمي)
3. **بعد كل عملية موافقة** (`/api/admin/doctors/:uid/approve`) يجب أن تُعيد لوحة الأدمن جلب البيانات فوراً أو تُشغّل حدث تحديث (refresh event) لجميع المكونات المعتمدة.
4. **اختبار المزامنة:** التأكد من أن أي تعديل على بيانات الطبيب في `users` يظهر فوراً في جدول الأدمن دون الحاجة لإعادة تحميل الصفحة.

---

## ثانياً: لوحة تحكم المستخدم (Dashboard) - التزامن الفعلي

### المشكلة حالياً:
- `Dashboard.tsx` يستخدم `useEffect` لسحب بيانات `/api/profile` و `/api/portfolio` و `/api/cases` عند التحميل فقط.
- عند تعديل المستخدم لبياناته، يتم الحفظ إلى `users` و `portfolios` عبر `PUT/PATCH`، لكن لا يوجد استماع مستمر للتأكد من أن التعديل أصبح متاحاً في `published_portfolios` بعد الموافقة.
- عند النشر (`/api/publish`) يتم إنشاء `published_portfolios`، لكن لوحة المستخدم لا تُحدّث تلقائياً لعرض الحالة الجديدة (`published`).

### خطة الإصلاح:
1. **إضافة `useRealTimeSync` أو `polling`** في `Dashboard.tsx` يراقب `/api/profile` كل 30 ثانية أو عبر WebSocket/Server-Sent Events إذا متاح.
2. **التمييز الواضح بين:**
   - **المسودة المحلية (Draft):** تُحفظ في `portfolios` و `users` عبر `sessionStorage` أو `localStorage` مؤقتاً.
   - **حفظ الحساب (Account Save):** ثم يُرسل عبر API إلى `users`.
   - **تعديل الحالة (Case Change):** يُحفظ منفصلاً عبر `/api/cases`.
3. **بعد النشر:** يجب أن يُعيد `Dashboard` جلب `/api/portfolio` وأيضاً يقرأ `published_portfolios` لعرض الرابط الرسمي للمستخدم.
4. **معالجة التعديلات بعد النشر:** إذا قام المستخدم بالتعديل بعد النشر (`hasUnreviewedChanges = true`)، يجب أن يتعامل النظام بـ:
   - حفظ التعديل في `portfolios` فقط.
   - عدم الكتابة على `published_portfolios` إلا بعد موافقة الأدمن.
   - عرض رسالة واضحة للمستخدم بأن التعديل في انتظار المراجعة.

---

## ثالثاً: إنشاء بورتفوليو الطبيب (Portfolio Website) - التصميم والبيانات

### المشكلة حالياً:
- الملف المرجعي للتصميم موجود في: `C:\Users\EL-Oroby\OneDrive\Desktop\micky\index.html`.
- في هذا المشروع، `scripts/doctor-template.mjs` يولد HTML ثابتاً، لكنه يقرأ بيانات قديمة (`photo` بدلاً من `photos[]` و `beforePhoto`/`afterPhoto`).
- البيانات الحديثة في `src/types.ts` تدعم:
  - `photos[]`: مصفوفة صور متعددة للحالة.
  - `beforePhoto`: صورة قبل.
  - `afterPhoto`: صورة بعد.
- المولد لا يحول هذه الأشكال إلى عناصر HTML صحيحة.

### خطة الإصلاح:
1. **مقارنة التصميم:** قراءة ملف `C:\Users\EL-Oroby\OneDrive\Desktop\micky\index.html` ومقارنته بـ `public/dr/portfoliohubs/index.html` أو `scripts/doctor-template.mjs` للتأكد من تطابق الأقسام (`home`, `skills`, `education`, `cases`, `contact`).
2. **تصحيح ربط الصور والحالات:**
   - تعديل `scripts/doctor-template.mjs` لقراءة `cases` بشكل صحيح.
   - إذا كانت `photos[]` موجودة، إنشاء سلايدر (`slider`) لكل صورة مع تسميتها (`photoLabel`).
   - إذا كانت `beforePhoto` و `afterPhoto` موجودة، عرضهما معاً في قسم "قبل وبعد".
3. **الاستدعاء الصحيح للبيانات:**
   - التأكد من أن `buildDoctorStaticHtml` يقرأ من قاعدة D1 (`published_portfolios`) أو من البيانات المرسلة عبر API (`/api/admin/generate-doctor-html`).
   - التأكد من أن `baseUrl` يُستخدم بشكل صحيح في جميع الروابط (`/dr/[slug]/`).
4. **التعامل مع التعديلات بعد النشر:**
   - عند تعديل المستخدم بعد النشر (`/api/portfolio` أو `/api/cases`):
     - يُحفظ في `portfolios` (المسودة).
     - لا يتم الكتابة على `published_portfolios` مباشرة.
     - يجب أن يمر عبر `/api/admin/doctors/:uid/approve` من الأدمن لتحديث `published_portfolios`.
   - عند موافقة الأدمن (`approveDoctorMatch` في `worker/index.ts`):
     - يتم دمج `portfolioRow` (المسودة) مع `profileRow` (البيانات الشخصية).
     - يتم إنشاء ملف HTML جديد في `public/dr/{slug}/index.html`.
     - يتم تحديث `slugs` و `published_portfolios` و `sitemap.xml`.
   - إذا قام المستخدم بالتعديل بعد النشر ولم يوافق الأدمن بعد، يجب أن يظل الملف المنشور (`published_portfolios`) كما هو، ويظهر للمستخدم رسالة: "تعديلاتك في انتظار المراجعة".
5. **اختبار التعديل بعد النشر:**
   - نشر طبيب.
   - تعديل حالة (`/api/cases` PUT).
   - التحقق من أن `published_portfolios` لم يتغير.
   - الموافقة من الأدمن (`/api/admin/doctors/:uid/approve`).
   - التحقق من أن الملف الجديد في `public/dr/slug/index.html` يعكس التعديل الجديد.

---

## رابعاً: تصحيح بيانات chatbot الخاطئة

### الأخطاء المؤكدة (من `src/data/chatbotTree.ts` و `PORTFOLIOHUBS-SECURITY-REPAIR-PLAN.md`):

| رقم | الخطأ في chatbot | التصحيح المطلوب |
|-----|------------------|-----------------|
| 1 | يدّعي "سلايدر تلقائي كل 3 ثوانٍ" رغم أنه تفاعلي (slider) وليس تلقائياً دائماً. | تصحيح النص: "سلايدر تفاعلي يمكنك التنقل بين صور الحالة يدوياً أو تلقائياً حسب إعداداتك." |
| 2 | يصف "مقالات المدونة كقسم داخل الموقع" رغم أنها صفحات منفصلة (`/dr/slug/articles/`). | تصحيح النص: "مقالاتك السريرية تظهر في صفحات مستقلة (`/articles/`) وليس داخل صفحة الطبيب الرئيسية." |
| 3 | يعد "ظهور Google خلال مدة محددة وبفهرسة أنظمة AI عبر IndexNow" مع أن IndexNow يخطر Bing/Yandex فقط ولا يضمن Google أو AI. | تصحيح النص: "نرسل إشعار IndexNow لمحركات Bing و Yandex. ظهورك في Google يتطلب 3-7 أيام ولا يمكن ضمانه." |
| 4 | يصف "الترقية غير المحدودة مجاناً 100%" دون إثبات سياسة/سعر. | تصحيح النص: "الترقية إلى حالات غير محدودة متاحة عبر التواصل المباشر مع إدارة المنصة عبر واتساب." |
| 5 | يدّعي "كل كلمة محفوظة تلقائياً" بينما الحفظ في Dashboard يدوي عبر زر الحفظ. | تصحيح النص: "يتم حفظ مسودتك في `sessionStorage` مؤقتاً، بينما حفظ الملف على حسابك يتطلب الضغط على زر الحفظ وإرسالها للمراجعة." |

### خطة الإصلاح الفعلي:
- تعديل `src/data/chatbotTree.ts`: تصحيح `responseAr` في العقد:
  - `node-slider-photos-cases`: حذف "تحرك كل 3 ثوانٍ" أو جعله مشروطاً.
  - `node-certifications-blogs`: توضيح أن المقالات في صفحات منفصلة.
  - `node-google-ai-search`: تصحيح فترة Google وإزالة ضمان AI مباشرة.
  - `node-case-limits-upgrade`: توضيح أن الترقية عبر WhatsApp وليست آلياً.
  - `node-save-approval-workflow`: توضيح الفرق بين `sessionStorage` والحفظ الفعلي.
- إضافة `suggestedActions` صحيحة لا تحتوي على روابط غير صحيحة.
- التأكد من أن `whatsappNumber` (`201271476215`) هو الرقم الرسمي.

---

## خطة التنفيذ الفورية

1. **قراءة ملف التصميم المرجعي:** `C:\Users\EL-Oroby\OneDrive\Desktop\micky\index.html` ومقارنته بـ `scripts/doctor-template.mjs`.
2. **تعديل `src/data/chatbotTree.ts`:** تطبيق التصحيحات الأربعة فوق.
3. **تعديل `scripts/doctor-template.mjs`:** دعم `photos[]` و `beforePhoto`/`afterPhoto`.
4. **تعديل `src/pages/AdminDashboard.tsx`:** إضافة استماع/تحديث تلقائي.
5. **تعديل `src/pages/Dashboard.tsx`:** إضافة مسح (polling) للتعديلات بعد النشر.
6. **اختبار كامل:**
   - نشر طبيب جديد → التحقق من HTML.
   - تعديل بعد النشر → التحقق من عدم تغيير `published_portfolios`.
   - موافقة الأدمن → التحقق من تحديث HTML.
   - استعلام chatbot → التحقق من عدم وجود معلومات خاطئة.

---
*تم إعداد هذه الخطة بناءً على مراجعة `PORTFOLIOHUBS-SECURITY-REPAIR-PLAN.md` و `worker/index.ts` و `src/data/chatbotTree.ts` و `server.ts`.*
