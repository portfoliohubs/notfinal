import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  RotateCcw, 
  ChevronDown,
  Sparkles,
  MessageCircle,
  Save,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Header from '../components/Header';
import CONFIG from '../config';
import { processImageToBase64, processMultipleImages } from '../lib/imageProcessor';
import { gtagEvent } from '../lib/gtag';
import UpgradeModal from '../components/UpgradeModal';
import { compressImage } from '../lib/imageCompressor';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { cloudflareApi } from '../lib/cloudflareApiClient';
import { publicDoctorUrl } from '../lib/publicSiteUrl';

// Exactly 7 steps (Step 8 preview/packages removed permanently)
type Step = 'intro' | 'personal' | 'contact' | 'photo' | 'skills' | 'timeline' | 'cases';

const STEPS: Step[] = ['intro', 'personal', 'contact', 'photo', 'skills', 'timeline', 'cases'];

const STEP_LABELS: Record<Step, { en: string; ar: string }> = {
  intro:    { en: 'Introduction', ar: 'المقدمة' },
  personal: { en: 'Personal Info', ar: 'البيانات الشخصية' },
  contact:  { en: 'Contact & Clinic', ar: 'التواصل والعيادة' },
  photo:    { en: 'Profile Photo', ar: 'الصورة الشخصية' },
  skills:   { en: 'Dental Skills', ar: 'المهارات المهنية' },
  timeline: { en: 'Academic Timeline', ar: 'السجل الأكاديمي' },
  cases:    { en: 'Clinical Cases', ar: 'حالات الأسنان' },
};

interface Milestone { year: string; event: string; eventAr: string }
interface ClinicalCase {
  category: string; 
  categoryAr: string;
  customCategory: string;
  title: string; 
  titleAr: string;
  photo: string | null; 
  preview: string | null;
  beforePhoto?: string | null;
  afterPhoto?: string | null;
  beforePreview?: string | null;
  afterPreview?: string | null;
  originalSizeKb?: number;
  compressedSizeKb?: number;
}

const blankCase = (): ClinicalCase => ({
  category: 'operative', 
  categoryAr: 'حشوات تجميلية وتصالحية', 
  customCategory: '',
  title: '', 
  titleAr: '', 
  photo: null, 
  preview: null,
  beforePhoto: null,
  afterPhoto: null,
  beforePreview: null,
  afterPreview: null
});

interface FormData {
  fullName: string; fullNameAr: string;
  title: string; titleAr: string;
  graduationYear: string;
  university: string; universityAr: string;
  phone: string; whatsapp: string; email: string;
  instagram: string; facebook: string; linkedin: string;
  clinicName: string; clinicNameAr: string;
  locationAddress: string; locationAddressAr: string; locationLat: string; locationLng: string;
  profilePhoto: string | null; profilePreview: string | null;
  clinicalSkills: string[]; digitalSkills: string[]; softSkills: string[];
  clinicalSkillsAr: string[]; digitalSkillsAr: string[]; softSkillsAr: string[];
  timeline: Milestone[]; 
  cases: ClinicalCase[];
}

const blankForm = (): FormData => ({
  fullName: '', fullNameAr: '',
  title: '', titleAr: '',
  graduationYear: '',
  university: '', universityAr: '',
  phone: '', whatsapp: '', email: '',
  instagram: '', facebook: '', linkedin: '',
  clinicName: '', clinicNameAr: '',
  locationAddress: '', locationAddressAr: '', locationLat: '', locationLng: '',
  profilePhoto: null, profilePreview: null,
  clinicalSkills: [], digitalSkills: [], softSkills: [],
  clinicalSkillsAr: [], digitalSkillsAr: [], softSkillsAr: [],
  timeline: [], 
  cases: [],
});

function SkillInput({ label, items, onAdd, onRemove, placeholder }: {
  label: string; items: string[]; onAdd: (v: string) => void;
  onRemove: (i: number) => void; placeholder: string;
}) {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim()) { onAdd(val.trim()); setVal(''); } };
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <div className="flex gap-2">
        <input
          type="text" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand placeholder:text-muted-foreground shadow-xs"
        />
        <button onClick={add} type="button"
          className="px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors flex items-center gap-1.5 shrink-0 shadow-xs focus-visible:ring-2 focus-visible:ring-brand">
          <Plus className="h-4 w-4" /> {CONFIG.labels.addSkill}
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold border border-brand/20">
              {item}
              <button onClick={() => onRemove(i)} className="text-brand/60 hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded-full">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', dir, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; dir?: 'rtl' | 'ltr'; required?: boolean;
}) {
  const effectiveDir = dir || (type === 'email' || type === 'password' || type === 'tel' || type === 'url' ? 'ltr' : undefined);
  const textClass = effectiveDir === 'ltr' ? 'text-left' : (effectiveDir === 'rtl' ? 'text-right' : '');

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">
        {label}{required && <span className="text-rose-500 mr-1">*</span>}
      </label>
      <input
        type={type} value={value} dir={effectiveDir}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand placeholder:text-muted-foreground shadow-xs ${textClass}`}
      />
    </div>
  );
}

export default function PortfolioWizard() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(blankForm());
  const [lastSaved, setLastSaved] = useState<string>('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftToLoad, setDraftToLoad] = useState<FormData | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [maxAllowedCases, setMaxAllowedCases] = useState<number>(CONFIG.tierLimits?.freeCases || 3);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [redeemingPromo, setRedeemingPromo] = useState(false);

  const profileRef = useRef<HTMLInputElement>(null);
  const casesRef   = useRef<HTMLInputElement>(null);

  // Load the case limit from the Worker-backed settings/profile surfaces.
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const [settings, profile] = await Promise.all([
          cloudflareApi.getSettings('global'),
          cloudflareApi.getProfile(user.uid).catch(() => null),
        ]);
        const settingsData = (settings.data || {}) as Record<string, unknown>;
        const profileData = (profile?.data || {}) as Record<string, unknown>;
        const configuredLimit = settingsData.freeCasesLimit ?? settingsData.defaultCaseLimit;
        setMaxAllowedCases(
          typeof profileData.caseLimit === 'number'
            ? profileData.caseLimit
            : typeof configuredLimit === 'number' ? configuredLimit : CONFIG.tierLimits.freeCases,
        );
      } catch (e) {
        console.warn('Worker caseLimit fetch error:', e);
      }
    });

    return () => unsubAuth();
  }, []);

  const redeemPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code || redeemingPromo) return;
    const user = auth.currentUser;
    if (!user) {
      setPromoMessage('أنشئ حساباً أولاً ثم استخدم البرومو.');
      return;
    }
    setRedeemingPromo(true);
    setPromoMessage('');
    try {
      const promo = await cloudflareApi.getPromoCode(code);
      const promoData = promo.data || {};
      if (promoData.active !== true) throw new Error('البرومو غير صالح أو منتهي.');
      await cloudflareApi.redeemPromo(code);
      const currentProfile = await cloudflareApi.getProfile(user.uid);
      const nextLimit = Math.max(
        Number(currentProfile.data.caseLimit || maxAllowedCases),
        Number(promoData.caseLimit || 5),
      );
      await cloudflareApi.saveProfile({
        ...currentProfile.data,
        caseLimit: nextLimit,
        promoCode: code,
        updatedAt: new Date().toISOString(),
      }, user.uid);
      setMaxAllowedCases(nextLimit);
      setPromoMessage('تم تفعيل البرومو بنجاح.');
      setPromoCode('');
    } catch (error) {
      console.error('[PortfolioWizard] Promo redemption failed:', error);
      setPromoMessage(error instanceof Error ? error.message : 'تعذر تفعيل البرومو.');
    } finally {
      setRedeemingPromo(false);
    }
  };

  // Autosave function
  const saveDraft = (data: FormData, currentStepIndex: number) => {
    try {
      sessionStorage.setItem('portfolio_draft', JSON.stringify(data));
      sessionStorage.setItem('portfolio_step', currentStepIndex.toString());
      const now = new Date();
      setLastSaved(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    } catch (e) {
      console.warn('Autosave sessionStorage notice:', e);
    }
  };

  // Check saved draft on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('portfolio_draft');
    const savedStep = sessionStorage.getItem('portfolio_step');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasData = parsed && Object.values(parsed).some(val => 
          Array.isArray(val) ? val.length > 0 : Boolean(val)
        );
        const stepNum = savedStep ? parseInt(savedStep, 10) : 0;
        
        if (hasData || (stepNum > 0 && stepNum < STEPS.length)) {
          setDraftToLoad(parsed);
          setShowDraftModal(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const changeStep = (newStep: number) => {
    const validStep = Math.max(0, Math.min(STEPS.length - 1, newStep));
    setStep(validStep);
    saveDraft(form, validStep);
  };

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(prev => {
      const updated = { ...prev, [k]: v };
      saveDraft(updated, step);
      return updated;
    });
  };

  const addSkill = (type: 'clinical' | 'digital' | 'soft', lang: 'en' | 'ar', v: string) => {
    const key = `${type}Skills${lang === 'ar' ? 'Ar' : ''}` as keyof FormData;
    set(key, [...(form[key] as string[]), v]);
  };

  const removeSkill = (type: 'clinical' | 'digital' | 'soft', lang: 'en' | 'ar', i: number) => {
    const key = `${type}Skills${lang === 'ar' ? 'Ar' : ''}` as keyof FormData;
    set(key, (form[key] as string[]).filter((_, idx) => idx !== i));
  };

  const addMilestone = () => {
    set('timeline', [...form.timeline, { year: '', event: '', eventAr: '' }]);
  };

  const updateMilestone = (i: number, k: keyof Milestone, v: string) => {
    const t = [...form.timeline];
    t[i] = { ...t[i], [k]: v };
    set('timeline', t);
  };

  const removeMilestone = (i: number) => {
    set('timeline', form.timeline.filter((_, idx) => idx !== i));
  };

  const updateCase = (i: number, k: keyof ClinicalCase, v: any) => {
    const c = [...form.cases]; 
    c[i] = { ...c[i], [k]: v };
    if (k === 'category') {
      const found = CONFIG.caseCategories.find(cat => cat.id === v);
      if (found) c[i].categoryAr = found.ar;
    }
    set('cases', c);
  };

  const removeCase = (i: number) => {
    set('cases', form.cases.filter((_, idx) => idx !== i));
  };

  const addEmptyCase = () => {
    if (form.cases.length >= maxAllowedCases) {
      setShowLimitModal(true);
      return;
    }
    set('cases', [...form.cases, blankCase()]);
  };

  const moveCaseOrder = (i: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? i - 1 : i + 1;
    if (targetIdx < 0 || targetIdx >= form.cases.length) return;
    const reordered = [...form.cases];
    const temp = reordered[i];
    reordered[i] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    set('cases', reordered);
  };

  const handleCasePhotoUpload = async (i: number, role: 'before' | 'after' | 'main', file: File) => {
    try {
      const compressed = await compressImage(file, { maxDimension: 1200, initialQuality: 0.75 });
      const c = [...form.cases];
      const targetCase = { ...c[i] };

      if (role === 'before') {
        targetCase.beforePhoto = compressed.base64;
        targetCase.beforePreview = compressed.previewUrl;
      } else if (role === 'after') {
        targetCase.afterPhoto = compressed.base64;
        targetCase.afterPreview = compressed.previewUrl;
      } else {
        targetCase.photo = compressed.base64;
        targetCase.preview = compressed.previewUrl;
      }

      targetCase.originalSizeKb = compressed.originalSizeKb;
      targetCase.compressedSizeKb = compressed.compressedSizeKb;
      c[i] = targetCase;
      set('cases', c);
    } catch (err) {
      console.error('Error compressing case photo:', err);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, { maxDimension: 800, initialQuality: 0.8 });
      set('profilePhoto', compressed.base64); 
      set('profilePreview', compressed.previewUrl);
    } catch (err) {
      console.error('Error compressing profile photo:', err);
    }
  };

  const handleCasesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // Dynamic Limit Check based on Firestore settings or user allocation
    const currentCount = form.cases.length;
    const availableSlots = maxAllowedCases - currentCount;

    if (availableSlots <= 0) {
      setShowLimitModal(true);
      if (e.target) e.target.value = '';
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      setShowLimitModal(true);
    }

    const imgs = await processMultipleImages(filesToProcess);
    const newCases: ClinicalCase[] = imgs.map(img => ({ 
      ...blankCase(), 
      photo: img.base64, 
      preview: img.preview,
      originalSizeKb: img.originalSizeKb,
      compressedSizeKb: img.compressedSizeKb
    }));
    
    set('cases', [...form.cases, ...newCases]);
    e.target.value = '';
  };

  const handleFinishWizard = () => {
    gtagEvent('portfolio_wizard_completed', { casesCount: form.cases.length });
    saveDraft(form, step);
    // Navigate to signup/login to link portfolio
    setLocation('/login?mode=signup&service=website');
  };

  const currentStep = STEPS[step];
  const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-brand/20" data-wizard-step={currentStep}>
      <Header showBack />

      {/* Draft Recovery Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full shadow-xl">
            <div className="flex items-center gap-2.5 mb-3 text-brand">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-bold text-foreground">استعادة المسودة السابقة؟</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              وجدنا بيانات بورتفوليو غير مكتملة محفوظة على جهازك. هل ترغب في المتابعة من حيث توقفت؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (draftToLoad) setForm(draftToLoad);
                  const savedStep = sessionStorage.getItem('portfolio_step');
                  if (savedStep) {
                    const stepNum = parseInt(savedStep, 10);
                    if (!isNaN(stepNum) && stepNum >= 0 && stepNum < STEPS.length) {
                      setStep(stepNum);
                    }
                  }
                  setShowDraftModal(false);
                }}
                className="flex-1 bg-brand text-white py-2.5 rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-xs"
              >
                استعادة المسودة
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('portfolio_draft');
                  sessionStorage.removeItem('portfolio_step');
                  setShowDraftModal(false);
                }}
                className="flex-1 border border-border text-foreground py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors"
              >
                بدء من جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Limit Modal (3 Cases Max Free) */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-card border border-brand/30 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3 text-amber-500">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-black text-foreground">وصلت للحد الأقصى المجاني (3 حالات)</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              تتيح لك الباقة المجانية توثيق وعرض حتى 3 حالات مهنية كاملة. لعرض عدد غير محدود من الحالات مع ميزات العيادة المتقدمة، تواصل مع الدعم الفني فوراً.
            </p>
            
            <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/20 mb-5">
              <div className="text-xs font-bold text-brand mb-1">الرسالة التلقائية للترقية:</div>
              <div className="text-[11px] text-muted-foreground">
                "مرحباً دكتور، أنا د. {form.fullName || 'طبيب الأسنان'}، أود تفعيل باقة الحالات غير المحدودة في PortfolioHubs."
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/201271476215?text=${encodeURIComponent(
                  `مرحباً دكتور، أنا د. ${form.fullName || form.fullNameAr || 'طبيب الأسنان'}، أود تفعيل باقة الحالات غير المحدودة لخدمة البورتفوليو على PortfolioHubs.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition-colors shadow-xs text-xs sm:text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>طلب الترقية عبر واتساب</span>
              </a>
              <button
                onClick={() => setShowLimitModal(false)}
                className="px-4 py-2.5 border border-border text-foreground rounded-xl font-semibold hover:bg-muted text-xs sm:text-sm transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotmart-Style Stepper Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur sticky top-16 z-20" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-brand bg-brand/10 px-2.5 py-1 rounded-lg">
                الخطوة {step + 1} من {STEPS.length}
              </span>
              <span className="text-sm font-bold text-foreground">
                {STEP_LABELS[currentStep].ar}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {lastSaved ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="h-3.5 w-3.5" />
                  <span>تم الحفظ تلقائياً ({lastSaved})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>حفظ تلقائي فوري</span>
                </span>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-border/70 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stepper Step Pills (Hotmart Stepper) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
            {STEPS.map((s, i) => {
              const isPast = i < step;
              const isCurrent = i === step;
              return (
                <button
                  key={s}
                  onClick={() => isPast && changeStep(i)}
                  disabled={!isPast}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-brand text-white shadow-xs'
                      : isPast
                      ? 'bg-brand/10 text-brand hover:bg-brand/20 cursor-pointer'
                      : 'bg-muted/40 text-muted-foreground cursor-not-allowed opacity-70'
                  }`}
                >
                  {isPast ? (
                    <Check className="h-3 w-3 shrink-0" />
                  ) : (
                    <span className="text-[11px]">{i + 1}</span>
                  )}
                  <span>{STEP_LABELS[s].ar}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Wizard Form Body */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">

          {/* ── STEP 1: INTRO ─────────────────────────────────────────────────── */}
          {currentStep === 'intro' && (
            <section className="space-y-6" dir="rtl">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>الخدمة الأولى: البورتفوليو المهني الرقمي</span>
                </div>
                <h2 className="text-2xl font-black text-foreground">{CONFIG.portfolioIntro.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  أنشئ موقعك الطبي الموثق خلال دقائق واستمتع بصفحة سريعة ومفهرسة لأطباء وطلبة الأسنان.
                </p>
              </div>

              <div className="rounded-xl border border-brand/20 bg-brand/5 p-5 space-y-3 text-sm text-foreground leading-relaxed">
                {CONFIG.portfolioIntro.content.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {/* Free Limit Callout */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>حتى 3 حالات مهنية مجاناً مع تحسين تلقائي للصور ورابط دائم على PortfolioHubs.</span>
              </div>

              {/* Live Examples */}
              {CONFIG.portfolioIntro.liveExamples.filter(ex => ex.name.trim() !== '').length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-foreground text-center">
                    نماذج حية لأطباء يستخدمون المنصة:
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {CONFIG.portfolioIntro.liveExamples
                      .filter(ex => ex.name.trim() !== '')
                      .map((ex, i) => (
                        <a
                          key={i}
                          href={publicDoctorUrl(ex.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl border border-border hover:border-brand bg-background text-xs font-bold text-brand hover:shadow-xs transition-all"
                        >
                          {ex.name} ↗
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── STEP 2: PERSONAL INFO ─────────────────────────────────────────── */}
          {currentStep === 'personal' && (
            <section className="space-y-5" dir="rtl">
              <div>
                <h2 className="text-xl font-bold text-foreground">{STEP_LABELS.personal.ar}</h2>
                <p className="text-xs text-muted-foreground mt-1">أدخل بياناتك الأكاديمية والمهنية باللغتين العربية والإنجليزية.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label={CONFIG.labels.fullNameEn} value={form.fullName} onChange={v => set('fullName', v)} placeholder={CONFIG.placeholders.fullNameEn} required />
                <InputField label={CONFIG.labels.fullNameAr} value={form.fullNameAr} onChange={v => set('fullNameAr', v)} placeholder={CONFIG.placeholders.fullNameAr} dir="rtl" />
                <InputField label={CONFIG.labels.titleEn} value={form.title} onChange={v => set('title', v)} placeholder={CONFIG.placeholders.titleEn} required />
                <InputField label={CONFIG.labels.titleAr} value={form.titleAr} onChange={v => set('titleAr', v)} placeholder={CONFIG.placeholders.titleAr} dir="rtl" />
                <InputField label={CONFIG.labels.graduationYear} value={form.graduationYear} onChange={v => set('graduationYear', v)} placeholder={CONFIG.placeholders.graduationYear} />
                <InputField label={CONFIG.labels.universityEn} value={form.university} onChange={v => set('university', v)} placeholder={CONFIG.placeholders.universityEn} />
                <div className="sm:col-span-2">
                  <InputField label={CONFIG.labels.universityAr} value={form.universityAr} onChange={v => set('universityAr', v)} placeholder={CONFIG.placeholders.universityAr} dir="rtl" />
                </div>
              </div>
            </section>
          )}

          {/* ── STEP 3: CONTACT & CLINIC ──────────────────────────────────────── */}
          {currentStep === 'contact' && (
            <section className="space-y-5" dir="rtl">
              <div>
                <h2 className="text-xl font-bold text-foreground">{STEP_LABELS.contact.ar}</h2>
                <p className="text-xs text-muted-foreground mt-1">وسائل التواصل مع المرضى والمراكز الطبية وبيانات عيادتك.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label={CONFIG.labels.phone} value={form.phone} onChange={v => set('phone', v)} placeholder={CONFIG.placeholders.phone} required />
                <InputField label={CONFIG.labels.whatsapp} value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder={CONFIG.placeholders.whatsapp} required />
                <InputField label={CONFIG.labels.email} value={form.email} onChange={v => set('email', v)} placeholder={CONFIG.placeholders.email} type="email" required />
                <InputField label="Instagram" value={form.instagram} onChange={v => set('instagram', v)} placeholder="https://instagram.com/..." />
                <InputField label="Facebook" value={form.facebook} onChange={v => set('facebook', v)} placeholder="https://facebook.com/..." />
                <InputField label="LinkedIn" value={form.linkedin} onChange={v => set('linkedin', v)} placeholder="https://linkedin.com/in/..." />
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm font-bold text-foreground">بيانات العيادة أو المركز الطبي (اختياري)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="اسم العيادة (بالإنجليزية)" value={form.clinicName} onChange={v => set('clinicName', v)} placeholder="e.g. Cairo Smile Clinic" />
                  <InputField label="اسم العيادة (بالعربية)" value={form.clinicNameAr} onChange={v => set('clinicNameAr', v)} placeholder="مثال: عيادة كايرو سمايل" dir="rtl" />
                  <InputField label="عنوان العيادة (بالإنجليزية)" value={form.locationAddress} onChange={v => set('locationAddress', v)} placeholder="e.g. Nasr City, Cairo" />
                  <InputField label="عنوان العيادة (بالعربية)" value={form.locationAddressAr} onChange={v => set('locationAddressAr', v)} placeholder="مثال: مدينة نصر، القاهرة" dir="rtl" />
                </div>
              </div>
            </section>
          )}

          {/* ── STEP 4: PROFILE PHOTO ─────────────────────────────────────────── */}
          {currentStep === 'photo' && (
            <section className="space-y-5" dir="rtl">
              <div>
                <h2 className="text-xl font-bold text-foreground">{STEP_LABELS.photo.ar}</h2>
                <p className="text-xs text-muted-foreground mt-1">تظهر صورتك الشخصية في أعلى البورتفوليو والبطاقة المهنية.</p>
              </div>

              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-card-subtle/50 text-center">
                {form.profilePreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={form.profilePreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-card shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => profileRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition-colors shadow-xs"
                    >
                      تغيير الصورة الشخصية
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => profileRef.current?.click()}
                        className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-dark transition-colors shadow-xs"
                      >
                        رفع صورة شخصية (JPG / PNG)
                      </button>
                      <p className="text-xs text-muted-foreground mt-2">تُضغط الصورة آلياً بأعلى نقاء لسرعة التصفح.</p>
                    </div>
                  </div>
                )}
                <input ref={profileRef} type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
              </div>
            </section>
          )}

          {/* ── STEP 5: DENTAL SKILLS ─────────────────────────────────────────── */}
          {currentStep === 'skills' && (
            <section className="space-y-6" dir="rtl">
              <div>
                <h2 className="text-xl font-bold text-foreground">{STEP_LABELS.skills.ar}</h2>
                <p className="text-xs text-muted-foreground mt-1">أبرز مهاراتك المهنية والرقمية لتظهر في ملفك.</p>
              </div>

              <div className="space-y-5">
                <SkillInput
                  label="المهارات المهنية (Clinical Skills - EN)"
                  items={form.clinicalSkills}
                  onAdd={v => addSkill('clinical', 'en', v)}
                  onRemove={i => removeSkill('clinical', 'en', i)}
                  placeholder="e.g. Composite Restoration, Root Canal Treatment"
                />

                <SkillInput
                  label="المهارات المهنية بالعربية (اختياري)"
                  items={form.clinicalSkillsAr}
                  onAdd={v => addSkill('clinical', 'ar', v)}
                  onRemove={i => removeSkill('clinical', 'ar', i)}
                  placeholder="مثال: حشوات الكمبوزيت التجميلية، علاج الجذور"
                />

                <SkillInput
                  label="المهارات الرقمية والتكنولوجيا (Digital Skills)"
                  items={form.digitalSkills}
                  onAdd={v => addSkill('digital', 'en', v)}
                  onRemove={i => removeSkill('digital', 'en', i)}
                  placeholder="e.g. Intraoral Scanning, Exocad, Dental Photography"
                />
              </div>
            </section>
          )}

          {/* ── STEP 6: TIMELINE ──────────────────────────────────────────────── */}
          {currentStep === 'timeline' && (
            <section className="space-y-5" dir="rtl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{STEP_LABELS.timeline.ar}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">محطاتك الأكاديمية والتدريبية وسنوات الامتياز.</p>
                </div>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-3.5 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> إضافة محطة
                </button>
              </div>

              {form.timeline.length === 0 && (
                <div className="text-center py-8 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  لم تُضف أي محطات بعد. اضغط على "إضافة محطة" لتوثيق سنوات دراستك وتدريبك.
                </div>
              )}

              <div className="space-y-3">
                {form.timeline.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand">المحطة {i + 1}</span>
                      <button onClick={() => removeMilestone(i)} className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <InputField label="السنة" value={m.year} onChange={v => updateMilestone(i, 'year', v)} placeholder="2024" />
                      <InputField label="الحدث (بالإنجليزية)" value={m.event} onChange={v => updateMilestone(i, 'event', v)} placeholder="e.g. Internship Year" />
                      <InputField label="الحدث (بالعربية)" value={m.eventAr} onChange={v => updateMilestone(i, 'eventAr', v)} placeholder="مثال: سنة الامتياز" dir="rtl" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── STEP 7: CLINICAL CASES (FINAL STEP - 3 FREE MAX) ──────────────── */}
          {currentStep === 'cases' && (
            <section className="space-y-6" dir="rtl">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl font-bold text-foreground">{STEP_LABELS.cases.ar}</h2>
                  
                  {/* Permanent Live Counter: Up to 3 cases free */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-brand/30 bg-brand/10 text-brand text-xs font-black shadow-xs">
                    <Sparkles className="h-4 w-4" />
                    <span>سعة الحالات ({form.cases.length} من {maxAllowedCases} مستخدمة)</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ارفع صور حالاتك المهنية (صورة قبل وبعد) وصنفها حسب التخصص (Restorative, Endo, Surgery...).
                </p>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-2 text-sm font-bold text-foreground">لديك Promo Code؟</div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder="أدخل الكود"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm uppercase"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => void redeemPromo()}
                    disabled={redeemingPromo || !promoCode.trim()}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
                  >
                    {redeemingPromo ? 'جارٍ التحقق...' : 'تفعيل'}
                  </button>
                </div>
                {promoMessage && <p className="mt-2 text-xs text-muted-foreground">{promoMessage}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input ref={casesRef} type="file" accept="image/*" multiple onChange={handleCasesUpload} className="hidden" />
                
                <button
                  type="button"
                  onClick={() => {
                    if (form.cases.length >= maxAllowedCases) {
                      setShowLimitModal(true);
                    } else {
                      casesRef.current?.click();
                    }
                  }}
                  className={`flex-1 w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed font-bold text-xs sm:text-sm transition-all ${
                    form.cases.length >= maxAllowedCases
                      ? 'border-amber-500/40 bg-amber-500/5 text-amber-700 hover:bg-amber-500/10'
                      : 'border-brand/40 hover:border-brand bg-brand/5 hover:bg-brand/10 text-brand'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>
                    {form.cases.length >= maxAllowedCases 
                      ? `اكتملت سعة الحالات (${maxAllowedCases} حالات) — اضغط للترقية` 
                      : `رفع صور دفعية (متاح ${maxAllowedCases - form.cases.length} حالات)`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={addEmptyCase}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand text-white font-bold text-xs sm:text-sm hover:bg-brand-dark transition shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة حالة فارغة</span>
                </button>
              </div>

              {/* Notice when limit reached */}
              {form.cases.length >= maxAllowedCases && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold">استخدمت كامل سعة الحالات المخصصة لك ({form.cases.length}/{maxAllowedCases})</div>
                    <div className="text-[11px] opacity-85">ترغب في إضافة حالات إضافية؟ تواصل معنا لترقية باقتك فوراً.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLimitModal(true)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>ترقية عبر واتساب</span>
                  </button>
                </div>
              )}

              {/* Empty state */}
              {form.cases.length === 0 && (
                <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-2xl bg-card-subtle/40">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 text-brand/40" />
                  <p className="text-sm font-semibold text-foreground">لا توجد حالات مرفوعة بعد</p>
                  <p className="text-xs text-muted-foreground mt-1">اضغط على الزر بالأعلى لاختيار صور حالات الأسنان أو إضافة تفاصيل حالة جديدة.</p>
                </div>
              )}

              {/* Cases List */}
              <div className="space-y-4">
                {form.cases.map((c, i) => (
                  <div key={i} className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand uppercase tracking-wide">حالة الأسنان {i + 1}</span>
                        {c.originalSizeKb && c.compressedSizeKb && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                            صورة محسنة ({c.compressedSizeKb} KB)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveCaseOrder(i, 'up')}
                          disabled={i === 0}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 transition"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCaseOrder(i, 'down')}
                          disabled={i === form.cases.length - 1}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 transition"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeCase(i)} 
                          className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded-lg transition-colors mr-1"
                          title="حذف الحالة"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Before / After Photos Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Before Photo */}
                        <div className="border border-border rounded-xl p-3 bg-muted/10 space-y-2">
                          <label className="text-xs font-bold text-foreground block">صورة قبل العلاج (Before)</label>
                          {c.beforePreview ? (
                            <div className="relative rounded-lg overflow-hidden border border-border h-36 bg-black/5 flex items-center justify-center">
                              <img src={c.beforePreview} alt="Before" className="object-cover w-full h-full" />
                              <button
                                type="button"
                                onClick={() => updateCase(i, 'beforePreview', null)}
                                className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center border border-dashed border-border rounded-lg h-36 cursor-pointer hover:border-brand bg-background/50 text-center p-2 transition">
                              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                              <span className="text-[11px] font-semibold text-muted-foreground">اختر صورة قبل العلاج</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  if (e.target.files?.[0]) handleCasePhotoUpload(i, 'before', e.target.files[0]);
                                }}
                              />
                            </label>
                          )}
                        </div>

                        {/* After Photo */}
                        <div className="border border-border rounded-xl p-3 bg-muted/10 space-y-2">
                          <label className="text-xs font-bold text-foreground block">صورة بعد العلاج (After)</label>
                          {c.afterPreview || c.preview ? (
                            <div className="relative rounded-lg overflow-hidden border border-border h-36 bg-black/5 flex items-center justify-center">
                              <img src={c.afterPreview || c.preview!} alt="After" className="object-cover w-full h-full" />
                              <button
                                type="button"
                                onClick={() => {
                                  updateCase(i, 'afterPreview', null);
                                  updateCase(i, 'preview', null);
                                }}
                                className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center border border-dashed border-border rounded-lg h-36 cursor-pointer hover:border-brand bg-background/50 text-center p-2 transition">
                              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                              <span className="text-[11px] font-semibold text-muted-foreground">اختر صورة بعد العلاج</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  if (e.target.files?.[0]) handleCasePhotoUpload(i, 'after', e.target.files[0]);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1.5">{CONFIG.labels.category}</label>
                          <div className="relative">
                            <select
                              value={c.category}
                              onChange={e => updateCase(i, 'category', e.target.value)}
                              className="w-full appearance-none px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            >
                              <option value="">{CONFIG.labels.selectCategory}</option>
                              {CONFIG.caseCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.en} — {cat.ar}</option>
                              ))}
                              <option value="custom">{CONFIG.labels.customCategory}</option>
                            </select>
                            <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>

                        {c.category === 'custom' && (
                          <InputField label="اسم التصنيف المخصص" value={c.customCategory} onChange={v => updateCase(i, 'customCategory', v)} placeholder="e.g. Implantology" />
                        )}

                        <InputField label={CONFIG.labels.caseTitleEn} value={c.title} onChange={v => updateCase(i, 'title', v)} placeholder={CONFIG.placeholders.caseTitleEn} />
                        <InputField label={CONFIG.labels.caseTitleAr} value={c.titleAr} onChange={v => updateCase(i, 'titleAr', v)} placeholder={CONFIG.placeholders.caseTitleAr} dir="rtl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Submit CTA on Step 7 */}
              <div className="pt-6 border-t border-border mt-8">
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="w-full py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-dark text-white font-black text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <Save className="h-5 w-5" />
                  <span>حفظ البورتفوليو ومتابعة لوحة التحكم</span>
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  يتم حفظ بياناتك تلقائياً ويمكنك تعديلها في أي وقت من لوحة التحكم.
                </p>
              </div>
            </section>
          )}

        </div>

        {/* Wizard Navigation Footer (Previous / Next) */}
        {currentStep !== 'intro' && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border" dir="rtl">
            <button
              onClick={() => {
                gtagEvent('portfolio_step', { step: STEPS[step], action: 'previous' });
                changeStep(step - 1);
              }}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs sm:text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ArrowRight className="h-4 w-4" />
              <span>{CONFIG.buttons.previous}</span>
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => {
                  gtagEvent('portfolio_step', { step: STEPS[step], action: 'next' });
                  changeStep(step + 1);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span>{CONFIG.buttons.next}</span>
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        )}

        {currentStep === 'intro' && (
          <div className="mt-6 flex justify-end" dir="rtl">
            <button
              onClick={() => changeStep(1)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span>ابدأ ملء بيانات البورتفوليو</span>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        )}

      </main>

      {/* Upgrade Tier Modal */}
      <UpgradeModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        doctorName={form.fullName || form.fullNameAr || 'طبيب الأسنان'}
        currentCount={form.cases.length}
        limit={3}
      />
    </div>
  );
}
