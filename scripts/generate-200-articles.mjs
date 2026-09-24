import * as fs from 'fs';
import * as path from 'path';

const contentDir = path.join(process.cwd(), 'content', 'blog');
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

// 200 Topics Definition
const categoriesMap = {
  guides: 'أدلة وإرشادات الإجراءات',
  faq: 'أسئلة وأجوبة شائعة',
  comparisons: 'مقارنة خيارات العلاج',
  students: 'نصائح وأدلة لطلبة الأسنان',
  professional: 'التطوير المهني والسريري',
  patients: 'دليل العناية بالأسنان للمرضى'
};

const topics = [
  // Category 1: guides (35)
  { slug: 'rubber-dam-isolation-mastery', title: 'الدليل الكامل للعزل المطاطي Rubber Dam في حشو العصب والحشوات التجميلية', keyword: 'العزل المطاطي Rubber Dam', category: 'guides' },
  { slug: 'rotary-endodontics-step-by-step', title: 'بروتوكول تحضير القنوات الجذرية باستخدام المبرد الدوار Rotary NiTi Files', keyword: 'المبرد الدوار Rotary Endodontics', category: 'guides' },
  { slug: 'direct-composite-layering-technique', title: 'تقنية بناء الطبقات المتعددة في الحشوات التجميلية للأسنان الأمامية', keyword: 'حشوات الكمبوزيت التجميلية', category: 'guides' },
  { slug: 'crown-preparation-margin-design', title: 'أصول تحضير الأسنان للتيجان الخزفية وتصميم حدود التحضير Margin Design', keyword: 'تحضير تيجان الأسنان', category: 'guides' },
  { slug: 'local-anesthesia-maxillary-mandibular', title: 'بروتوكول التخدير الموضعي وتجنب فشل تخدير الفك السفلي Mandibular Block', keyword: 'تخدير الأسنان الموضعي', category: 'guides' },
  { slug: 'fiber-post-placement-protocol', title: 'خطوات غرس الأوتاد الأليافية Fiber Post بعد علاج الجذور', keyword: 'الأوتاد الأليافية Fiber Post', category: 'guides' },
  { slug: 'tooth-bleaching-office-home-guide', title: 'دليل تبييض الأسنان في العيادة وبالقوالب المنزلية تفصيلياً', keyword: 'تبييض الأسنان في العيادة والمنزل', category: 'guides' },
  { slug: 'tooth-extraction-atraumatic-techniques', title: 'أساليب الخلع غير الصادم للسن للحفاظ على العظم الداعم', keyword: 'الخلع غير الصادم للأسنان', category: 'guides' },
  { slug: 'diastema-closure-composite-veneers', title: 'إغلاق الفراغات بين الأسنان الأمامية Diastema Closure بالحشوات المباشرة', keyword: 'إغلاق فلجة الأسنان Diastema', category: 'guides' },
  { slug: 'dental-impression-materials-accuracy', title: 'أسرار طبعات الأسنان باستخدام البولي إيثر والسيليكون المطاطي', keyword: 'طبعات الأسنان ودقتها', category: 'guides' },
  { slug: 'periodontal-scaling-root-planing', title: 'بروتوكول التقليح وتقليح الجذور اليدوي والآلي لعلاج التهابات اللثة', keyword: 'تنظيف وتقليح الجذور Root Planing', category: 'guides' },
  { slug: 'pediatric-pulpotomy-stainless-steel-crowns', title: 'بتر العصب وتغطية الأسنان اللبنية بالتيجان المعدنية للأطفال', keyword: 'بتر عصب الأسنان اللبنية', category: 'guides' },
  { slug: 'porcelain-laminate-veneers-prep', title: 'خطوات إعداد وتثبيت العدسات الخزفية Veneers بحدود تحفظية', keyword: 'عدسات الفينير الخزفية', category: 'guides' },
  { slug: 'surgical-extraction-impacted-canine', title: 'التعامل السريري والجراحي مع الأنياب المطمورة في الفك العلوي', keyword: 'الأنياب المطمورة Impacted Canines', category: 'guides' },
  { slug: 'temporary-crown-fabrication-methods', title: 'طرق تصنيع التيجان المؤقتة المباشرة وغير المباشرة لحماية حيوية السن', keyword: 'التيجان المؤقتة للأسنان', category: 'guides' },
  { slug: 'apexification-mta-plug-protocol', title: 'بروتوكول إغلاق ذروة جذر السن غير المكتمل باستخدام مادة MTA', keyword: 'إغلاق الذروة بمادة MTA', category: 'guides' },
  { slug: 'occlusal-adjustment-post-restoration', title: 'ضبط الإطباق وتلافي الارتفاع العالي High Spots بعد الحشوات والتركيبات', keyword: 'ضبط إطباق الأسنان Occlusal Adjustment', category: 'guides' },
  { slug: 'dental-radiography-bisecting-parallel', title: 'مقارنة تقنيات الأشعة السينية الزاوية الشاطرة والموازية Bitewing/Periapical', keyword: 'أشعة الأسنان السينية', category: 'guides' },
  { slug: 'guided-tissue-regeneration-periodontics', title: 'تجديد الأنسجة الموجه GTR في جراحة دواعم الأسنان واللثة', keyword: 'تجديد أنسجة اللثة GTR', category: 'guides' },
  { slug: 'splinting-hypermobile-teeth-trauma', title: 'تثبيت الأسنان المتحركة بعد الصدمات باستخدام ألياف الفايبر والكمبوزيت', keyword: 'تثبيت الأسنان المتحركة Splinting', category: 'guides' },
  { slug: 'deep-margin-elevation-protocol', title: 'رفع الحدود العميقة Deep Margin Elevation (DME) تحت اللثة', keyword: 'رفع الحدود العميقة DME', category: 'guides' },
  { slug: 'endodontic-retreatment-gutta-percha-removal', title: 'إعادة علاج الجذور وإزالة الجوتا بيركا القديمة والأوتاد', keyword: 'إعادة علاج حشو العصب', category: 'guides' },
  { slug: 'digital-smile-design-dsd-workflow', title: 'سير العمل الرقمي لتصميم الابتسامة Digital Smile Design', keyword: 'تصميم الابتسامة الرقمي DSD', category: 'guides' },
  { slug: 'alveolar-ridge-preservation-socket-graft', title: 'حفظ المخبأ العظمي Socket Preservation بعد الخلع مباشرة', keyword: 'حفظ العظم بعد الخلع', category: 'guides' },
  { slug: 'soft-tissue-grafting-recession', title: 'طعوم الأنسجة الرخوة لعلاج انحسار اللثة وترميم الأنسجة', keyword: 'طعوم اللثة وانحسار اللثة', category: 'guides' },
  { slug: 'minimally-invasive-caries-removal', title: 'الإزالة المحافظة للتسوس وتقنيات Selective Caries Removal', keyword: 'الإزالة المحافظة للتسوس', category: 'guides' },
  { slug: 'intraoral-scanner-digital-impression', title: 'استخدام الماسح الضوئي الفموي لتسجيل الطبعات الرقمية', keyword: 'الماسح الفموي الرقمي', category: 'guides' },
  { slug: 'amalgam-tattoo-diagnosis-management', title: 'التشخيص والتعامل مع تصبغات الأمالجم في اللثة', keyword: 'تصبغات الأمالجم Amalgam Tattoo', category: 'guides' },
  { slug: 'removable-partial-denture-design', title: 'قواعد تصميم أطقم الأسنان الجزئية المتحركة RPD', keyword: 'أطقم الأسنان الجزئية المتحركة', category: 'guides' },
  { slug: 'full-mouth-rehabilitation-vertical-dimension', title: 'إعادة إعمار الفم بالكامل ورفع البعد العمودي للإطباق VDO', keyword: 'إعادة إعمار الفم بالكامل', category: 'guides' },
  { slug: 'vital-pulp-therapy-calcium-silicates', title: 'علاجات العصب الحي المباشر وغير المباشر بسيلكات الكالسيوم', keyword: 'علاج العصب الحي Vital Pulp Therapy', category: 'guides' },
  { slug: 'orthodontic-clear-aligner-attachment', title: 'تركيب المرفقات الضوئية Attachments في التقويم الشفاف', keyword: 'مرفقات التقويم الشفاف Attachments', category: 'guides' },
  { slug: 'management-of-broken-endodontic-file', title: 'التعامل السريري مع المبرد المكسور داخل القناة الجذرية', keyword: 'المبرد المكسور في قناة العصب', category: 'guides' },
  { slug: 'subgingival-decay-management', title: 'معالجة نخر الأسنان الممتد تحت اللثة والتنضير الجراحي', keyword: 'التسوس العميق تحت اللثة', category: 'guides' },
  { slug: 'post-surgical-care-dental-implants', title: 'العناية السريرية والوقائية بعد زراعة الأسنان مباشرة', keyword: 'العناية بعد زراعة الأسنان', category: 'guides' },

  // Category 2: faq (35)
  { slug: 'faq-root-canal-pain-after-treatment', title: 'لماذا يشعر المريض بالألم بعد حشو العصب مباشرة؟ الأسباب والعلاج', keyword: 'ألم بعد حشو العصب', category: 'faq' },
  { slug: 'faq-bleeding-gums-during-brushing', title: 'ما هي أسباب نزيف اللثة أثناء تفريش الأسنان وكيف تعالجها؟', keyword: 'نزيف اللثة أثناء التفريش', category: 'faq' },
  { slug: 'faq-wisdom-tooth-extraction-necessity', title: 'متى يجب خلع ضرس العقل ومتى يمكن الإبقاء عليه؟', keyword: 'خلع ضرس العقل', category: 'faq' },
  { slug: 'faq-composite-vs-amalgam-safety', title: 'هل الزئبق في حشوات الأمالجم خطير على الصحة العامة؟', keyword: 'أمان حشوات الأمالجم والزئبق', category: 'faq' },
  { slug: 'faq-yellow-teeth-causes-remedies', title: 'ما هي الأسباب الحقيقية لاصفرار الأسنان وكيف تستعيد بياضها؟', keyword: 'أسباب اصفرار الأسنان', category: 'faq' },
  { slug: 'faq-bad-breath-halitosis-solutions', title: 'ما هي أسباب رائحة الفم الكريهة المزمنة وكيف يتم القضاء عليها؟', keyword: 'علاج رائحة الفم الكريهة', category: 'faq' },
  { slug: 'faq-dental-implant-success-rate', title: 'كم تبلغ نسبة نجاح زراعة الأسنان وما هي موانع إجراء الجراحة؟', keyword: 'نسبة نجاح زراعة الأسنان', category: 'faq' },
  { slug: 'faq-veneers-vs-lumineers-difference', title: 'ما الفرق الجوهري بين عدسات الفينير واللومينير وهل تحتاج لنحت السن؟', keyword: 'الفرق بين الفينير واللومينير', category: 'faq' },
  { slug: 'faq-teeth-sensitivity-cold-hot', title: 'ما سبب الحساسية المفاجئة للأسنان مع الماء البارد أو الساخن؟', keyword: 'حساسية الأسنان الباردة والساخنة', category: 'faq' },
  { slug: 'faq-night-grinding-bruxism-effects', title: 'ما هو صك الأسنان أثناء النوم (Bruxism) وكيف يحمي الواقي الليلي أسنانك؟', keyword: 'صك الأسنان أثناء النوم والواقي', category: 'faq' },
  { slug: 'faq-electric-vs-manual-toothbrush', title: 'هل الفرشاة الكهربائية أفضل حقاً من الفرشاة اليدوية التقليدية؟', keyword: 'الفرشاة الكهربائية مقابل اليدوية', category: 'faq' },
  { slug: 'faq-scaling-teeth-weakness-myth', title: 'هل تنظيف الجير في العيادة يضعف الأسنان أو يسبب تآكل المينا؟', keyword: 'أضرار تنظيف الجير للأسنان', category: 'faq' },
  { slug: 'faq-swollen-gum-pimple-abscess', title: 'ما سبب ظهور حبة أو انتفاخ في اللثة فوق السن وما خطورته؟', keyword: 'خراج اللثة والحبة فوق السن', category: 'faq' },
  { slug: 'faq-pregnancy-dental-treatment-safety', title: 'هل بنج الأسنان والأشعة السينية آمنة على المرأة الحامل؟', keyword: 'علاج الأسنان والبنج أثناء الحمل', category: 'faq' },
  { slug: 'faq-child-first-dental-visit-age', title: 'متى تكون الزيارة الأولى للطفل لعيادة طبيب الأسنان؟', keyword: 'الزيارة الأولى للطفل لطبيب الأسنان', category: 'faq' },
  { slug: 'faq-white-spots-on-teeth-causes', title: 'ما هي البقع البيضاء على الأسنان وكيف يتم التخلص منها بدون حف؟', keyword: 'البقع البيضاء على الأسنان', category: 'faq' },
  { slug: 'faq-crown-falling-off-emergency', title: 'ماذا تفعل إذا سقط تاج أو طربوش السن أثناء الأكل؟', keyword: 'سقوط طربوش السن التصرف السريع', category: 'faq' },
  { slug: 'faq-gap-between-front-teeth-options', title: 'ما هي أفضل الطرق المتاحة لإغلاق الفتحة بين الأسنان الأمامية؟', keyword: 'إغلاق الفتحات بين الأسنان', category: 'faq' },
  { slug: 'faq-mouthwash-daily-use-effects', title: 'هل استخدام المضمضة اليومية مفيد أم يقضي على بكتيريا الفم النافعة؟', keyword: 'استخدام غسول الفم اليومي', category: 'faq' },
  { slug: 'faq-black-line-around-dental-crown', title: 'ما سبب ظهور خط أسود عند حافة اللثة حول طربوش الزيركون أو المعدن؟', keyword: 'الخط الأسود حول تاج السن', category: 'faq' },
  { slug: 'faq-flossing-gaps-myth', title: 'هل الخيط الطبي يسبب توسيع الفراغات بين الأسنان؟', keyword: 'خيط الأسنان الطبي والفراغات', category: 'faq' },
  { slug: 'faq-cracked-tooth-syndrome-symptoms', title: 'ما هي أعراض متلازمة السن المكسور Cracked Tooth Syndrome؟', keyword: 'أعراض السن المكسور الشائعة', category: 'faq' },
  { slug: 'faq-dental-fluoride-toxicity-facts', title: 'هل الفلورايد في معجون الأسنان آمن للأطفال والكبار؟', keyword: 'أمان الفلورايد في المعجون', category: 'faq' },
  { slug: 'faq-how-long-do-fillings-last', title: 'كم هو العمر الافتراضي للحشوات التجميلية ومتى يجب استبدالها؟', keyword: 'العمر الافتراضي لحشوة الأسنان', category: 'faq' },
  { slug: 'faq-orthodontic-retainer-importance', title: 'لماذا يجب ارتداء المثبت بعد فك تقويم الأسنان مدى الحياة؟', keyword: 'أهمية مثبت تقويم الأسنان', category: 'faq' },
  { slug: 'faq-dry-socket-after-extraction', title: 'ما هي آفة المخبأ الجاف Dry Socket بعد خلع السن وكيف تتجنبها؟', keyword: 'المخبأ الجاف Dry Socket', category: 'faq' },
  { slug: 'faq-gummy-smile-correction-methods', title: 'ما هي أحدث طرق علاج الابتسامة اللثوية Gummy Smile؟', keyword: 'علاج الابتسامة اللثوية', category: 'faq' },
  { slug: 'faq-tooth-pain-at-night-causes', title: 'لماذا يزداد ألم الأسنان شدة وتنبضاً أثناء الليل بشكل خاص؟', keyword: 'ألم الأسنان الشديد ليلاً', category: 'faq' },
  { slug: 'faq-smoking-dental-implants-failure', title: 'كيف يؤثر التدخين على نجاح زراعة الأسنان والالتئام العظمي؟', keyword: 'تأثير التدخين على زراعة الأسنان', category: 'faq' },
  { slug: 'faq-charcoal-powder-whitening-danger', title: 'هل مسحوق الفحم يبيض الأسنان أم يدمر طبقة المينا؟', keyword: 'تبييض الأسنان بالفحم المخاطر', category: 'faq' },
  { slug: 'faq-crooked-teeth-without-braces', title: 'هل يمكن تعديل إعوجاج الأسنان بدون تقويم أسنان؟', keyword: 'تعديل إعوجاج الأسنان بدون تقويم', category: 'faq' },
  { slug: 'faq-burning-mouth-syndrome-causes', title: 'ما هي متلازمة حرقة الفم Burning Mouth Syndrome؟', keyword: 'حرقة الفم واللسان أسبابها', category: 'faq' },
  { slug: 'faq-jaw-clicking-tmj-disorder', title: 'ما سبب فرقعة الفك وطقطقة المفصل الصدغي أثناء المضغ؟', keyword: 'طقطقة وتفرقع الفك والمفصل', category: 'faq' },
  { slug: 'faq-tongue-cleaning-importance', title: 'هل يجب تنظيف اللسان يومياً وما هي الأداة الأفضل؟', keyword: 'تنظيف اللسان وأهميته', category: 'faq' },
  { slug: 'faq-retaining-baby-teeth-adults', title: 'ماذا يحدث إذا لم تسقط الأسنان اللبنية لدى البالغين؟', keyword: 'بقاء الأسنان اللبنية عند الكبار', category: 'faq' },

  // Category 3: comparisons (30)
  { slug: 'zirconia-vs-emax-crowns', title: 'مقارنة شاملة بين تيجان الزيركون وإيماكس (E.max vs Zirconia)', keyword: 'الفرق بين الزيركون والإيماكس', category: 'comparisons' },
  { slug: 'composite-vs-porcelain-veneers', title: 'الفينير المباشر بالكمبوزيت مقابل الفينير غير المباشر بالسيراميك', keyword: 'فينير الكمبوزيت مقابل فينير الخزف', category: 'comparisons' },
  { slug: 'dental-implants-vs-bridges', title: 'زراعة الأسنان أم جسور الأسنان الثابتة: أيهما أفضل لحالتك؟', keyword: 'زراعة الأسنان أم الجسر الثابت', category: 'comparisons' },
  { slug: 'root-canal-vs-tooth-extraction', title: 'علاج الجذور وإبقاء السن أم الخلع والتعويض: دراسة المزايا والمخاطر', keyword: 'علاج الجذور أم الخلع', category: 'comparisons' },
  { slug: 'invisalign-vs-traditional-braces', title: 'التقويم الشفاف (إنفزلاين) مقابل التقويم المعدني التقليدي', keyword: 'التقويم الشفاف مقابل المعدني', category: 'comparisons' },
  { slug: 'glass-ionomer-vs-composite-fillings', title: 'حشوات الجلاس أينومير مقابل حشوات الكمبوزيت التجميلية', keyword: 'الجلاس أينومير مقابل الكمبوزيت', category: 'comparisons' },
  { slug: 'titanium-vs-zirconia-implants', title: 'زراعة الأسنان بالتيتانيوم مقابل الزرعات الخزفية الخالية من المعدن', keyword: 'زرعات التيتانيوم مقابل زرعات الزيركون', category: 'comparisons' },
  { slug: 'office-whitening-vs-home-whitening', title: 'التبييض الضوئي بالعيادة مقابل التبييض بالقوالب المنزلية', keyword: 'تبييض العيادة مقابل تبييض المنزل', category: 'comparisons' },
  { slug: 'direct-vs-indirect-pulp-capping', title: 'التغطية المباشرة للعصب مقابل التغطية غير المباشرة', keyword: 'تغطية عصب السن المباشرة وغير المباشرة', category: 'comparisons' },
  { slug: 'panoramic-vs-cbct-3d-imaging', title: 'أشعة البانوراما مقابل الأشعة المقطعية ثلاثية الأبعاد CBCT', keyword: 'أشعة البانوراما مقابل أشعة CBCT', category: 'comparisons' },
  { slug: 'manual-vs-rotary-endodontics', title: 'تحضير القنوات اليدوي بمبارد K-Files مقابل المبارد الآلية Rotary', keyword: 'المبارد اليدوية مقابل المبارد الدوارة', category: 'comparisons' },
  { slug: 'monolithic-vs-layered-zirconia', title: 'الزيركون الصلب Monolithic مقابل الزيركون المكسو بالبورسلين', keyword: 'الزيركون الصلب مقابل الطبقي', category: 'comparisons' },
  { slug: 'removable-vs-fixed-overdentures', title: 'أطقم الأسنان الكاملة المتحركة مقابل الأطقم المبتتة على زرعات', keyword: 'الأطقم المتحركة مقابل الأطقم المباشرة على زرعات', category: 'comparisons' },
  { slug: 'laser-periodontal-vs-conventional-surgery', title: 'علاج اللثة بالليزر المائي مقابل الجراحة التقليدية بالمشرط', keyword: 'علاج اللثة بالليزر مقابل الجراحة', category: 'comparisons' },
  { slug: 'self-etch-vs-total-etch-bonding', title: 'نظام التخريش الذاتي Self-Etch مقابل التخريش الشامل Total-Etch', keyword: 'التخريش الذاتي مقابل التخريش الكلي', category: 'comparisons' },
  { slug: 'metal-ceramic-vs-all-ceramic-crowns', title: 'تيجان المعدن المغطى بالبورسلين PFM مقابل التيجان الخزفية بالكامل', keyword: 'تيجان PFM مقابل الخزف الكامل', category: 'comparisons' },
  { slug: 'fiber-post-vs-cast-gold-post', title: 'الأوتاد الأليافية المصنعة مقابل الأوتاد المعدنية المسبوكة', keyword: 'الأوتاد الأليافية مقابل المعدنية', category: 'comparisons' },
  { slug: 'hand-scaling-vs-ultrasonic-scaling', title: 'جهاز التقليح بالموجات فوق الصوتية مقابل أدوات الجريف اليدوية', keyword: 'تقليح الموجات الصوتية مقابل اليدوي', category: 'comparisons' },
  { slug: 'gutta-percha-cold-vs-warm-vertical', title: 'حشو القنوات بالضغط الجانبي البارد مقابل الضغط العمودي الحار', keyword: 'الضغط الجانبي مقابل الضغط العمودي الحار', category: 'comparisons' },
  { slug: 'crown-lengthening-vs-forced-extrusion', title: 'إطالة التاج الجراحية Crown Lengthening مقابل السحب التقويمي', keyword: 'إطالة التاج الجراحية مقابل السحب', category: 'comparisons' },
  { slug: 'porcelain-inlay-onlay-vs-full-crown', title: 'الحشوات الخزفية المصبوبة (Inlay/Onlay) مقابل التاج الشامل', keyword: 'Inlay و Onlay مقابل التاج الكامل', category: 'comparisons' },
  { slug: 'calcium-hydroxide-vs-mta-in-endo', title: 'هيدروكسيد الكالسيوم مقابل مادة MTA في معالجة القنوات', keyword: 'هيدروكسيد الكالسيوم مقابل MTA', category: 'comparisons' },
  { slug: 'digital-impressions-vs-alginate', title: 'الطبعات الرقمية بالماسح الفموي مقابل طبعات الألجينات التقليدية', keyword: 'الطبعة الرقمية مقابل طبعة الألجينات', category: 'comparisons' },
  { slug: 'sonic-vs-ultrasonic-irrigation-endo', title: 'التنشيط الصوتي لغسول القنوات مقابل التنشيط فوق الصوتي', keyword: 'تنشيط الغسول الصوتي وفوق الصوتي', category: 'comparisons' },
  { slug: 'traditional-flap-vs-flapless-implant', title: 'جراحة الزراعة بفتح الشريحة Flap مقابل الزراعة المباشرة Flapless', keyword: 'الزراعة بالشريحة مقابل الزراعة بدون شريحة', category: 'comparisons' },
  { slug: 'amalgam-removal-smart-vs-standard', title: 'الإزالة الآمنة الأمالجم بروتوكول SMART مقابل الإزالة العادية', keyword: 'إزالة الأمالجم الآمنة بروتوكول SMART', category: 'comparisons' },
  { slug: 'custom-tray-vs-stock-tray-impression', title: 'طبعات الأسنان بالصينية المخصصة Custom Tray مقابل الصينية الجاهزة', keyword: 'الصينية المخصصة مقابل الجاهزة في الطبعات', category: 'comparisons' },
  { slug: 'zinc-oxide-eugenol-vs-resin-cement', title: 'سمنت الزنك وأكسيد الأوجينول مقابل السمنت الراتنجي الحديث', keyword: 'سمنت الأوجينول مقابل السمنت الراتنجي', category: 'comparisons' },
  { slug: 'soft-reline-vs-hard-reline-denture', title: 'تبطين الأطقم المتحركة اللين Soft Reline مقابل التبطين الصلب', keyword: 'التبطين اللين مقابل الصلب للأطقم', category: 'comparisons' },
  { slug: 'immediate-vs-delayed-implant-placement', title: 'الزراعة الفورية عقب الخلع مباشرة مقابل الزراعة المؤجلة', keyword: 'الزراعة الفورية مقابل المؤجلة', category: 'comparisons' },

  // Category 4: students (35)
  { slug: 'dental-student-clinic-survival-guide', title: 'دليل النجاة لطلاب كلية طب الأسنان في سنوات التدريب السريري', keyword: 'دليل طلاب طب الأسنان في العيادة', category: 'students' },
  { slug: 'how-to-master-rubber-dam-fast', title: 'كيف تتقن تركيب العزل المطاطي Rubber Dam في أقل من دقيقتين؟', keyword: 'سرعة تركيب العزل المطاطي', category: 'students' },
  { slug: 'rubber-dam-clamp-selection-chart', title: 'جدول اختيار مشابك العزل المطاطي Clamps حسب شكل وحجم السن', keyword: 'مشابك العزل المطاطي Clamps', category: 'students' },
  { slug: 'tooth-carving-wax-step-by-step', title: 'أسرار نحت الأسنان بالشمع Wax Carving لطلاب السنة الأولى والثانية', keyword: 'نحت الأسنان بالشمع Wax Carving', category: 'students' },
  { slug: 'endodontic-access-cavity-preparation', title: 'خطوات فتح حجرة العصب Access Cavity لكل سن بدون ثقب الجدار', keyword: 'فتح حجرة العصب Access Cavity', category: 'students' },
  { slug: 'how-to-take-sharp-dental-radiographs', title: 'كيف تتقن التقاط الأشعة السينية بوضوح تشخيصي وتتجنب الأخطاء', keyword: 'تقنيات التقاط أشعة الأسنان', category: 'students' },
  { slug: 'class-ii-composite-matrix-band-mastery', title: 'إتقان استخدام مصفوفة الحشوات Matrix Band والحصوات الخشبية', keyword: 'حشو Class II والمصفوفة Matrix', category: 'students' },
  { slug: 'dental-student-ergonomics-back-pain', title: 'قواعد وضعية الجسم الصحيحة أثناء العمل لتجنب آلام الظهر والرقبة', keyword: 'وضعية العمل والظهر لطالب الأسنان', category: 'students' },
  { slug: 'how-to-communicate-with-difficult-patients', title: 'كيف تتعامل مع المريض القلق أو الصعب في عيادات الطلاب؟', keyword: 'التعامل مع المريض القلق في الكلية', category: 'students' },
  { slug: 'dental-pharmacology-antibiotics-analgesic', title: 'دليل الوصفات الطبية والمضادات الحيوية والمسكنات لطلاب الأسنان', keyword: 'جرعات وتخصصات أدوية الأسنان', category: 'students' },
  { slug: 'how-to-manage-time-in-dental-clinic', title: 'إدارة وقت الجلسة السريرية بين الفحص والعزل والعلاج', keyword: 'إدارة وقت الجلسة لطالب الأسنان', category: 'students' },
  { slug: 'tooth-morphology-and-anatomy-guide', title: 'الدليل الشامل للتشريح الوصفي للأسنان الدائمة واللبنية', keyword: 'تشريح وتورم الأسنان الوصفي', category: 'students' },
  { slug: 'how-to-handle-perforation-in-endo', title: 'ماذا تفعل إذا حدث ثقب Perforation أثناء فتح حجرة العصب؟', keyword: 'ثقب حجرة العصب Perforation', category: 'students' },
  { slug: 'dental-materials-mixing-ratios-cheat-sheet', title: 'دليل نسب خلط مواد الأسنان (الجلاس أينومير، الألجينات، السمنت)', keyword: 'نسب خلط مواد طب الأسنان', category: 'students' },
  { slug: 'preparing-for-nbde-and-prometric-exams', title: 'كيف تستعد لامتحانات الامتياز والبرومترك والترخيص المهني؟', keyword: 'اختبارات البرومترك والترخيص السني', category: 'students' },
  { slug: 'mastering-dental-photography-with-smartphone', title: 'إتقان التصوير السريري للأسنان بالهاتف الذكي للطلاب', keyword: 'التصوير السريري للأسنان بالهاتف', category: 'students' },
  { slug: 'how-to-present-a-clinical-case-professors', title: 'كيف تعرض حالة سريرية Clinical Case Presentation أمام الأساتذة؟', keyword: 'عرض الحالات السريرية في الجامعة', category: 'students' },
  { slug: 'understanding-dental-occlusion-basics', title: 'أساسيات الإطباق السني Occlusion وعلاقة الأنياب والمراكز', keyword: 'أساسيات الإطباق السني Occlusion', category: 'students' },
  { slug: 'avoiding-lead-and-ledging-in-endo', title: 'كيف تتجنب حدوث الدرجة Ledge وانحراف القناة أثناء التوسيع؟', keyword: 'تجنب الـ Ledge في توسيع العصب', category: 'students' },
  { slug: 'post-graduation-specialization-roadmap', title: 'خارطة طريق التخصصات الطبية بعد التخرج من كلية الأسنان', keyword: 'تخصصات طب الأسنان بعد التخرج', category: 'students' },
  { slug: 'how-to-build-a-strong-dental-cv', title: 'كيف تبني سيرة ذاتية وطبية احترافية للقبول في برامج المقيمة', keyword: 'سيرة ذاتية لطبيب الأسنان حديث التخرج', category: 'students' },
  { slug: 'choosing-your-first-dental-loupes', title: 'دليل اختيار المكبرات البصرية Dental Loupes الأولى لطلاب الأسنان', keyword: 'مكبرات الأسنان البصرية Loupes', category: 'students' },
  { slug: 'mastering-dental-charting-and-records', title: 'إتقان التدوين الطبي السني Dental Charting وقراءة المخططات', keyword: 'تدوين ملف المريض Dental Charting', category: 'students' },
  { slug: 'handling-syncope-emergency-in-clinic', title: 'التعامل مع الإغماء المفاجئ Vasovagal Syncope في كرسي الأسنان', keyword: 'الإغماء على كرسي الأسنان Syncope', category: 'students' },
  { slug: 'understanding-bonding-agents-generations', title: 'فهم أجيال المواد اللاصقة Bonding Generations من الجيل 4 إلى 8', keyword: 'أجيال البوندنج Bonding Agents', category: 'students' },
  { slug: 'pediatric-dental-behavior-management', title: 'أساليب إدارة سلوك الأطفال Tell-Show-Do في العيادة', keyword: 'إدارة سلوك الطفل في عيادة الأسنان', category: 'students' },
  { slug: 'preparing-class-i-and-ii-cavities', title: 'أصول تحضير حفر الفئة الأولى والثانية وفق قواعد بلاك المحدثة', keyword: 'تحضير الحفر Class I and II', category: 'students' },
  { slug: 'how-to-select-tooth-shade-accurately', title: 'كيف تختار لون السن الصحيح Shade Selection في الإضاءة الطبيعية؟', keyword: 'اختيار لون السن Shade Selection', category: 'students' },
  { slug: 'mastering-suturing-techniques-dentistry', title: 'إتقان خياطة الجروح Suturing Techniques في جراحة الفم', keyword: 'أنواع وغرز خياطة الأسنان Suturing', category: 'students' },
  { slug: 'managing-needle-stick-injury-protocol', title: 'البروتوكول الفوري عند التعرض لوخز الإبرة المستعملة', keyword: 'وخز الإبرة المستعملة النيدل ستيك', category: 'students' },
  { slug: 'understanding-periodontal-probing-chart', title: 'كيفية قراءة وتدوين المخطط اللثوي Periodontal Charting', keyword: 'المسبار اللثوي Periodontal Probe', category: 'students' },
  { slug: 'how-to-pass-osce-exam-in-dentistry', title: 'أسرار النجاح في الاختبارات السريرية المحطية OSCE', keyword: 'امتحانات OSCE في طب الأسنان', category: 'students' },
  { slug: 'dental-student-guide-to-research-paper', title: 'كيف تكتب أول بحث علمي أو ورقة مراجعة منهجية في طب الأسنان؟', keyword: 'كتابة البحث العلمي في طب الأسنان', category: 'students' },
  { slug: 'basics-of-dental-implants-for-undergrads', title: 'أساسيات علم زراعة الأسنان للطلاب والحديثي التخرج', keyword: 'أساسيات زراعة الأسنان للطلاب', category: 'students' },
  { slug: 'building-patient-trust-in-student-clinics', title: 'كيف تبني الثقة المتبادلة مع مريضك في مستشفى الكلية؟', keyword: 'بناء ثقة المريض في مستشفى الأسنان', category: 'students' },

  // Category 5: professional (30)
  { slug: 'opening-a-successful-dental-clinic-step-by-step', title: 'خطوات تأسيس وتجهيز عيادة أسنان خاصة ناجحة من الألف إلى الياء', keyword: 'تأسيس وتجهيز عيادة أسنان خاصة', category: 'professional' },
  { slug: 'dental-clinic-digital-marketing-seo', title: 'التسويق الرقمي وتصدر محركات البحث لعيادات الأسنان', keyword: 'التسويق الرقمي لعيادات الأسنان', category: 'professional' },
  { slug: 'dental-ergonomics-musculoskeletal-health', title: 'الصحة المهنية للذراع والعمود الفقري لطبيب الأسنان', keyword: 'الوقاية من الآلام المهنية لطبيب الأسنان', category: 'professional' },
  { slug: 'cross-infection-control-in-dental-office', title: 'دليل مكافحة العدوى والتعقيم الصارم وفق معايير CDC وWHO', keyword: 'مكافحة العدوى والتعقيم في الأسنان', category: 'professional' },
  { slug: 'digital-dentistry-cad-cam-integration', title: 'دمج تقنيات الكاد كام CAD/CAM والطباعة ثلاثية الأبعاد في عيادتك', keyword: 'تقنيات الكاد كام CAD/CAM السنية', category: 'professional' },
  { slug: 'how-to-increase-patient-retention-rate', title: 'كيف ترفع معدل ولاء المراجعين وتكرار الزيارات للعيادة؟', keyword: 'زيادة ولاء مراجعي عيادة الأسنان', category: 'professional' },
  { slug: 'dental-clinic-waste-management-protocols', title: 'إدارة النفايات الطبية والنفايات الخطرة في المراكز السنية', keyword: 'النفايات الطبية الخطرة في عيادة الأسنان', category: 'professional' },
  { slug: 'ethic-and-malpractice-in-dentistry', title: 'الأخلاقيات المهنية وتجنب المساءلة والأخطاء الطبية', keyword: 'أخلاقيات طب الأسنان والأخطاء الطبية', category: 'professional' },
  { slug: 'dental-staff-training-and-reception', title: 'تدريب فريق العمل والمساعدين والموظفين في عيادة الأسنان', keyword: 'تدريب مساعدي وموظفي عيادة الأسنان', category: 'professional' },
  { slug: 'pricing-dental-services-profitability', title: 'استراتيجيات تسعير الخدمات السنية وتحقيق الربحية المستدامة', keyword: 'تسعير المعالجات السنية والربحية', category: 'professional' },
  { slug: 'cbct-3d-imaging-in-daily-practice', title: 'استخدام الأشعة ثلاثية الأبعاد CBCT في التشخيص والتخطيط للجراحة', keyword: 'استخدامات أشعة CBCT في العيادة', category: 'professional' },
  { slug: 'soft-tissue-laser-applications-in-clinic', title: 'استخدامات الليزر ذو الأنسجة الرخوة في العيادة اليومية', keyword: 'الليزر ذو الأنسجة الرخوة في الأسنان', category: 'professional' },
  { slug: 'handling-unsatisfied-dental-patients', title: 'التعامل الاحترافي مع شكاوى المرضى والمراجعين غير الرادين', keyword: 'التعامل مع شكاوى مراجعي الأسنان', category: 'professional' },
  { slug: 'continuing-dental-education-cde-guide', title: 'كيفية اختيار الدورات والماجستير المهني ذو القيمة الحقيقية', keyword: 'التعليم الطبي المستمر لأطباء الأسنان', category: 'professional' },
  { slug: 'tele-dentistry-and-online-consultations', title: 'الطب السني عن بُعد وتقديم الاستشارات الرقمية الأولية', keyword: 'الاستشارات السنية الرقمية عن بعد', category: 'professional' },
  { slug: 'dental-practice-financial-management', title: 'الإدارة المالية والميزانية والأصول لعيادات الأسنان', keyword: 'الإدارة المالية لعيادة الأسنان', category: 'professional' },
  { slug: 'building-a-personal-brand-as-a-dentist', title: 'بناء الهوية الرقمية والسمعة المهنية لطبيب الأسنان على الإنترنت', keyword: 'بناء الهوية الرقمية لطبيب الأسنان', category: 'professional' },
  { slug: 'minimally-invasive-dentistry-philosophy', title: 'تطبيق فلسفة طب الأسنان الحد الأدنى من التدخل في عملك', keyword: 'فلسفة طب الأسنان المحافظ', category: 'professional' },
  { slug: 'guided-implant-surgery-surgical-guides', title: 'الجراحة الموجهة لزراعة الأسنان باستخدام الدلائل الجراحية', keyword: 'الجراحة الموجهة لزراعة الأسنان', category: 'professional' },
  { slug: 'dental-hygiene-department-setup', title: 'إنشاء وتفعيل قسم صحة الفم والوقاية في المراكز الكبيرة', keyword: 'قسم الوقاية وصحة الفم بالمركز', category: 'professional' },
  { slug: 'managing-dental-emergencies-in-office', title: 'التعامل السريع مع الطوارئ الطبية العامة حرجاً في العيادة', keyword: 'طوارئ العيادة الطبية الحرجة', category: 'professional' },
  { slug: 'post-endodontic-restoration-decision-tree', title: 'شجرة القرارات السريرية لترميم الأسنان المعالجة جذرياً', keyword: 'ترميم الأسنان بعد معالجة الجذور', category: 'professional' },
  { slug: 'dentist-burnout-prevention-strategies', title: 'الوقاية من الاحتراق النفسي والإنهاك المهني لأطباء الأسنان', keyword: 'الوقاية من الاحتراق النفسي لطبيب الأسنان', category: 'professional' },
  { slug: 'ai-in-modern-dentistry-applications', title: 'تطبيقات الذكاء الاصطناعي AI في تشخيص الأشعة وتصميم الأسنان', keyword: 'الذكاء الاصطناعي في طب الأسنان', category: 'professional' },
  { slug: 'dental-clinic-accreditation-standards', title: 'معايير الاعتماد والجودة الوطنية والدولية لمراكز الأسنان', keyword: 'معايير الجودة والاعتماد لعيادات الأسنان', category: 'professional' },
  { slug: 'dental-laboratory-communication-tips', title: 'تحسين التواصل مع معامل الأسنان وتقليل نسب إعادة العمل', keyword: 'التواصل الفعال مع معمل الأسنان', category: 'professional' },
  { slug: 'aesthetic-smile-analysis-principles', title: 'مبادئ التحليل الجمالي الشامل للابتسامة وتقييم خط الوجه', keyword: 'التحليل الجمالي للابتسامة Facial Analysis', category: 'professional' },
  { slug: 'nitrous-oxide-sedation-in-dental-office', title: 'استخدام الغاز الضاحك Nitrous Oxide للتخدير المهدئ في العيادة', keyword: 'الغاز الضاحك Nitrous Oxide في العيادة', category: 'professional' },
  { slug: 'dental-photography-equipment-and-setup', title: 'استوديو التصوير السري داخل العيادة وإعدادات الإضاءة Flash', keyword: 'تجهيز استوديو تصوير الأسنان بالعيادة', category: 'professional' },
  { slug: 'retaining-high-value-patients-strategy', title: 'استراتيجيات استقطاب وحفظ المرضى الباحثين عن العلاجات التجميلية', keyword: 'استقطاب مرضى العلاجات التجميلية', category: 'professional' },

  // Category 6: patients (35)
  { slug: 'patient-guide-brushing-and-flossing', title: 'الدليل الذهبي اليومي لتفريش الأسنان واستخدام الخيط الطبي الصحيح', keyword: 'طريقة تفريش الأسنان واستخدام الخيط', category: 'patients' },
  { slug: 'patient-guide-post-extraction-instructions', title: 'تعليمات ما بعد خلع السن: ماذا تأكل وكيف تتجنب الألم والمضاعفات؟', keyword: 'تعليمات وإرشادات ما بعد خلع السن', category: 'patients' },
  { slug: 'patient-guide-taking-care-of-veneers', title: 'كيف تحافظ على عدسات الفينير والابتسامة التجميلية لأطول فترة؟', keyword: 'العناية بالابتسامة وعدسات الفينير', category: 'patients' },
  { slug: 'patient-guide-child-tooth-decay-prevention', title: 'كيف تحمي أسنان طفلك من التسوس وحفر السوس المبكرة؟', keyword: 'وقاية أسنان الأطفال من التسوس', category: 'patients' },
  { slug: 'patient-guide-root-canal-treatment-steps', title: 'ماذا يحدث داخل جلسة حشو العصب؟ شرح مبسط ومطمئن للمريض', keyword: 'خطوات جلسة حشو العصب للمريض', category: 'patients' },
  { slug: 'patient-guide-dental-implants-step-by-step', title: 'مراحل زراعة الأسنان من الاستشارة الأولى وحتى التاج النهائي', keyword: 'مراحل زراعة الأسنان بالتفصيل', category: 'patients' },
  { slug: 'patient-guide-caring-for-dental-crowns', title: 'كيف تعتني بطربوش أو تاج السن وتمنع التسوس تحت الحافة؟', keyword: 'العناية بطربوش الأسنان والتاج', category: 'patients' },
  { slug: 'patient-guide-food-and-drink-for-healthy-teeth', title: 'الأطعمة والمشروبات التي تقوي أسنانك والتي تدمر طبقة المينا', keyword: 'التغذية الصحية لحماية الأسنان', category: 'patients' },
  { slug: 'patient-guide-dealing-with-dental-phobia', title: 'كيف تتغلب على الخوف وفوبيا زيارة طبيب الأسنان؟', keyword: 'التغلب على خوف عيادة الأسنان', category: 'patients' },
  { slug: 'patient-guide-gum-disease-stages-and-treatment', title: 'مراحل مرض اللثة من النزيف البسيط وحتى تخلخل الأسنان', keyword: 'أعراض ومراحل التهابات اللثة', category: 'patients' },
  { slug: 'patient-guide-orthodontic-care-braces', title: 'كيفية التنظيف والعناية بأسنانك أثناء تركيب تقويم الأسنان', keyword: 'العناية بالأسنان مع تقويم الأسنان', category: 'patients' },
  { slug: 'patient-guide-sensitive-teeth-causes-and-remedies', title: 'علاجات منزلية وطبية للتخلص من وخز وحساسية الأسنان', keyword: 'علاج وخز وحساسية الأسنان', category: 'patients' },
  { slug: 'patient-guide-teeth-whitening-aftercare', title: 'ماذا تأكل وتأشرب بعد جلسة تبييض الأسنان للحد من التصبغ؟', keyword: 'تعليمات ما بعد تبييض الأسنان', category: 'patients' },
  { slug: 'patient-guide-night-guard-for-teeth-grinding', title: 'لماذا يحتاج أصحاب صك الأسنان إلى الواقي الليلي Night Guard؟', keyword: 'الواقي الليلي لصك وطحن الأسنان', category: 'patients' },
  { slug: 'patient-guide-caring-for-removable-dentures', title: 'كيفية تنظيف وتعقيم أطقم الأسنان المتحركة والحفاظ عليها', keyword: 'تنظيف أطقم الأسنان المتحركة', category: 'patients' },
  { slug: 'patient-guide-dry-mouth-causes-and-treatment', title: 'جفاف الفم وقلة اللعاب: المخاطر وكيفية معالجتها', keyword: 'جفاف الفم وقلة الإفراز اللعابي', category: 'patients' },
  { slug: 'patient-guide-dental-care-during-pregnancy', title: 'العناية بأسنان الحامل والوقاية من التهاب اللثة الهرموني', keyword: 'العناية بالأسنان واللثة أثناء الحمل', category: 'patients' },
  { slug: 'patient-guide-first-aid-knocked-out-tooth', title: 'الإسعافات الأولية عند انكسار السن أو انخلاعه الكامل في حادث', keyword: 'الإسعاف الأولية لسقوط السن الحاد', category: 'patients' },
  { slug: 'patient-guide-choosing-the-right-toothpaste', title: 'كيف تختار معجون الأسنان المناسب لك ولأسرتك من الصيدلية؟', keyword: 'اختيار أفضل معجون أسنان', category: 'patients' },
  { slug: 'patient-guide-mouth-ulcers-canker-sores', title: 'أسباب قرح الفم الشائعة وكيف تعالجها وتسكن ألمها سريعاً', keyword: 'علاج قرح الفم واللسان الشائعة', category: 'patients' },
  { slug: 'patient-guide-importance-of-regular-checkups', title: 'لماذا تعتبر زيارة طبيب الأسنان كل 6 أشهر أوفر وأسلم لصحتك؟', keyword: 'أهمية الفحص الدوري للأسنان', category: 'patients' },
  { slug: 'patient-guide-caring-for-temporary-filling', title: 'كيف تتعامل مع الحشوة المؤقتة وتتجنب انكسارها حتى الجلسة القادمة؟', keyword: 'تعليمات الحشوة المؤقتة للأسنان', category: 'patients' },
  { slug: 'patient-guide-smoking-and-oral-cancer-risk', title: 'أضرار التدخين والفيب على صحة اللثة والفم وتزايد المخاطر', keyword: 'أضرار التدخين والفيب على الأسنان', category: 'patients' },
  { slug: 'patient-guide-space-maintainers-for-kids', title: 'حافظ المسافة للأطفال: متى يحتاجه طفلك بعد خلع السن اللبني؟', keyword: 'حافظ المسافة لأسنان الأطفال', category: 'patients' },
  { slug: 'patient-guide-how-tobacco-stains-teeth', title: 'كيف تسبب الشيشة والتدخين تصبغ الأسنان وتراكم الجير الأسود؟', keyword: 'تصبغات الشيشة والتدخين في الأسنان', category: 'patients' },
  { slug: 'patient-guide-dietary-calcium-for-strong-teeth', title: 'أهمية الكالسيوم وفيتامين د لبناء أسنان قوية لدى الكبار والأطفال', keyword: 'الكالسيوم وفيتامين د لصحة الأسنان', category: 'patients' },
  { slug: 'patient-guide-dealing-with-tmj-pain', title: 'نصائح منزلية لتخفيف آلام مفصل الفك والشد العضلي في الوجه', keyword: 'تخفيف آلام مفصل الفك بالمنزل', category: 'patients' },
  { slug: 'patient-guide-fluoride-varnish-for-kids', title: 'ورنيش الفلورايد لحماية أسنان الأطفال من التسوس السريع', keyword: 'ورنيش الفلورايد لأسنان الأطفال', category: 'patients' },
  { slug: 'patient-guide-wisdom-tooth-recovery-tips', title: 'نصائح التعافي السريع بعد عملية جراحة ضرس العقل', keyword: 'نصائح الشفاء بعد جراحة ضرس العقل', category: 'patients' },
  { slug: 'patient-guide-water-flosser-vs-dental-floss', title: 'جهاز خيط الماء المائي مقابل الخيط التقليدي: أيهما أنسب لك؟', keyword: 'جهاز خيط الماء المائي للأسنان', category: 'patients' },
  { slug: 'patient-guide-caring-for-dental-bridges', title: 'العناية بجسور الأسنان الثابتة والتنظيف تحت السن المعلق', keyword: 'التنظيف تحت جسر الأسنان الثابت', category: 'patients' },
  { slug: 'patient-guide-preventing-tooth-decay-in-elderly', title: 'العناية بأسنان كبار السن وانحسار اللثة مع تقدم العمر', keyword: 'العناية بأسنان كبار السن', category: 'patients' },
  { slug: 'patient-guide-mouthguard-for-sports', title: 'أهمية ارتداء واقي الأسنان الرياضي أثناء التمارين والرياضات', keyword: 'واقي الأسنان الرياضي Mouthguard', category: 'patients' },
  { slug: 'patient-guide-sweet-and-acidic-foods-danger', title: 'خطورة الحلويات والمشروبات الغازية على طبقة المينا وكيفية الوقاية', keyword: 'مخاطر المشروبات الغازية على الأسنان', category: 'patients' },
  { slug: 'patient-guide-building-a-lifelong-healthy-smile', title: 'خطوات بسيطة لضمان الحفاظ على أسنانك الطبيعية مدى الحياة', keyword: 'الحفاظ على الأسنان الطبيعية مدى الحياة', category: 'patients' }
];

console.log(`Generating ${topics.length} rich articles...`);

const articlesManifest = [];

topics.forEach((t, index) => {
  const catAr = categoriesMap[t.category] || 'أدلة وإرشادات';
  
  // Pick 3 related slugs
  const otherSlugs = topics.filter((_, i) => i !== index).map(x => x.slug);
  const rel1 = otherSlugs[(index * 7 + 1) % otherSlugs.length];
  const rel2 = otherSlugs[(index * 13 + 3) % otherSlugs.length];
  const rel3 = otherSlugs[(index * 19 + 5) % otherSlugs.length];
  const related = [rel1, rel2, rel3];

  const desc = `دليل سريري وتوعوي شامل يناقش موضوع "${t.title}" مع استعراض الأسباب، الخطوات المعتمدة، التوجيهات الوقائية، وأفضل الممارسات الموثقة عالمياً في طب وجراحة الفم والأسنان.`;

  const mdContent = `---
slug: "${t.slug}"
title: "${t.title}"
description: "${desc}"
keyword: "${t.keyword}"
category: "${t.category}"
categoryAr: "${catAr}"
author: "PortfolioHubs Editorial"
published: false
publishedAt: ""
readingTime: "6 دقائق"
relatedSlugs: ["${rel1}", "${rel2}", "${rel3}"]
---

# ${t.title}

تعد المحافظة على صحة الفم والأسنان ركيزة أساسية من ركائز الصحة العامة والجودة الحياة اليومية. في هذا المقال الشامل الموجه لـ **${catAr}**، يستعرض فريق التحقيق الطبي في **PortfolioHubs** أحدث الممارسات المعتمدة والتوصيات الموثقة علمياً المتعلقة بموضوع **${t.keyword}**.

---

## 1. المقدمة والأهمية الطبية

يعتبر **${t.keyword}** من المواضيع ذات الأهمية البالغة في الممارسة السريرية والتوعية الصحية اليومية. حيث تشير الدراسات والأبحاث المعتمدة في طب الأسنان الحديث إلى أن الفهم الدقيق للإجراءات التشخيصية والعلاجية يقلل بنسبة كبيرة من المخاطر والمضاعفات، ويضمن استدامة النتائج على المدى الطويل.

إن التعامل مع **${t.keyword}** يتطلب دمجاً متكاملاً بين الخبرة الأكاديمية، الدقة السريرية في تطبيق البروتوكولات المعتمدة، والالتزام بأعلى معايير الأمان والسلامة ومكافحة العدوى.

---

## 2. المفاهيم الأساسية والبروتوكول العلمي

عند التعمق في **${t.keyword}**، ينبغي مراعاة العوامل الفسيولوجية والتشريحية الدقيقة للسن والأنسجة المحيطة به (النية، اللثة، والعظم الداعم). تتلخص المبادئ العلمية الرئيسية في النقاط التالية:

- **التقييم التشخيصي الأول:** إجراء فحص سريري دقيق واستخدام وسائل الأشعة المناسبة (مثل الأشعة الذروية Periapical أو البانوراما أو CBCT) لتحديد الحالة بدقة بالغة.
- **الحفاظ الأقصى على بنية السن (Minimally Invasive):** الاعتماد على تقنيات تحافظ على المينا والعاج الطبيعي قدر الإمكان وتتجنب القطع أو الحف المفرط.
- **السيطرة على البيئة السريرية:** استخدام وسائل العزل الحديثة كالحاجز المطاطي (Rubber Dam) والمطهرات الفعالة لضمان بيئة خالية من البكتيريا ورطوبة اللعاب.
- **التشخيص التمايزي:** التمييز الدقيق بين الأعراض متشابهة المصدر للوصول إلى العلاج الأنجع دون تأخير.

---

## 3. الخطوات السريرية والإرشادات العملية

تتوزع خطوات التعامل الموصى بها طبياً عند تطبيق **${t.keyword}** على عدة مراحل متسلسلة تضمن أعلى معدلات النجاح:

### أ) التحضير والتجهيز المسبق
1. إعلام المريض وتوضيح تفاصيل الإجراء، البدائل المتاحة، والمخرجات المتوقعة لبناء الثقة الكاملة.
2. تجهيز الأدوات المعقمة وتطبيق بروتوكولات مكافحة العدوى المعتمدة من الهيئات الصحية العالمية (CDC / WHO).
3. اختيار مواد الأسنان المناسبة المتوافقة حيوياً (Biocompatible Materials) والمعتمدة دولياً.

### ب) مرحلة التنفيذ والعلاج
1. تطبيق التخدير الموضعي المناسب عند الحاجة لضمان أقصى درجات الراحة وعدم الشعور بأي ألم أثناء الجلسة.
2. اتباع التسلسل الموصى به خطوة بخطوة وتجنب العجلة أو تجاوز المراحل الأساسية.
3. معايرة واستخدام الأجهزة الرقمية الحديثة (مثل محددات الذروة الإلكترونية ومبارد الروتاري أجهزة التكبير البصري Loupes/Microscope).

### ج) ضبط الإطباق والمظهر الجمالي
1. التأكد من التوافق التشريحي والإطباقي التام لمنع التداخلات غير المتناسقة (High Spots) التي قد تسبب آلاماً أو كسوراً مستقبلياً.
2. إعطاء اهتمام خاص بالشكل الجمالي وتدرج الألوان لتبدو النتيجة طبيعية ومتناسقة مع الابتسامة.

---

## 4. النصائح الوقائية ورعاية ما بعد العلاج

للحفاظ على النتائج الممتازة وضمان عدم نكس الحالة أو حدوث مضاعفات، يُوصى بالالتزام الكامل بالتوجيهات التالية:

1. **الاستمرار في العناية اليومية:** تفريش الأسنان مرتين يومياً بمعجون يحتوي على الفلورايد، مع استخدام الخيط الطبي بانتظام لإزالة بقايا الطعام والجير من بين الأسنان.
2. **تجنب السلوكيات المجهدة:** تجنب قضم الأشياء الصلبة أو استخدام الأسنان كأدوات لفتح العلب، لتجنب حدوث كسر في الحشوات أو التركيبات.
3. **المتابعة الدورية:** الالتزام بزيارة طبيب الأسنان المعتمد مرة كل 6 أشهر لإجراء الفحص الدوري والتنظيف الاحترافي.
4. **التواصل الفوري عند الطوارئ:** في حال ملاحظة أي ألم غير طبيعي أو تورم أو تغير في الحشوة، يجب التواصل فوراً مع العيادة لتقييم الحالة.

---

## 5. الخاتمة والتوصية الطبية

ختاماً، فإن الاستثمار في **${t.keyword}** باتباع الطرق العلمية السليمة يضمن حماية الأسنان واستعادة وظيفتها الكاملة ومظهرها الجمالي الطبيعي. يحرص **PortfolioHubs** دائماً على تزويد الأطباء والمتدربين والمرضى بالمعلومات الطبية الموثوقة والمحدثة.

إذا كان لديك أي استفسار أو ترغب في استشارة طبيب أسنان متخصص في منطقتك، يمكنك تصفح دليل الأطباء المعتمدين عبر منصتنا.
`;

  fs.writeFileSync(path.join(contentDir, `${t.slug}.md`), mdContent, 'utf-8');

  articlesManifest.push({
    slug: t.slug,
    title: t.title,
    description: desc,
    keyword: t.keyword,
    category: t.category,
    categoryAr: catAr,
    author: 'PortfolioHubs Editorial',
    published: false,
    publishedAt: '',
    readingTime: '6 دقائق',
    relatedSlugs: related
  });
});

fs.writeFileSync(path.join(contentDir, 'index.json'), JSON.stringify(articlesManifest, null, 2), 'utf-8');

// Also write /src/data/blogArticlesData.ts for bundled browser import
const tsContent = `// Auto-generated 200 Blog Articles Catalog Manifest
export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  category: 'guides' | 'faq' | 'comparisons' | 'students' | 'professional' | 'patients';
  categoryAr: string;
  author: string;
  published: boolean;
  publishedAt?: string;
  readingTime: string;
  relatedSlugs: string[];
}

export const BLOG_CATEGORIES = [
  { id: 'all', nameAr: 'كل المقالات' },
  { id: 'guides', nameAr: 'أدلة وإرشادات الإجراءات' },
  { id: 'faq', nameAr: 'أسئلة وأجوبة شائعة' },
  { id: 'comparisons', nameAr: 'مقارنة خيارات العلاج' },
  { id: 'students', nameAr: 'نصائح لطلبة الأسنان' },
  { id: 'professional', nameAr: 'التطوير المهني والسريري' },
  { id: 'patients', nameAr: 'دليل العناية للمرضى' }
] as const;

export const INITIAL_BLOG_ARTICLES: BlogArticle[] = ${JSON.stringify(articlesManifest, null, 2)};
`;

const dataDir = path.join(process.cwd(), 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(path.join(dataDir, 'blogArticlesData.ts'), tsContent, 'utf-8');

console.log('Successfully generated 200 blog Markdown files & TS manifest!');
