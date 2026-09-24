import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Link, useRoute } from 'wouter';
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Mail, 
  Award, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  Globe, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  ArrowRight,
  Layers,
  Heart,
  Stethoscope,
  Smile,
  X,
  Languages,
  Clock,
  Building2,
  Check
} from 'lucide-react';
import Header from '../components/Header';
import { db } from '../lib/firebase';
import { cloudflareApi } from '../lib/cloudflareApiClient';
import { getCleanDoctorSlug, publicDoctorUrl } from '../lib/publicSiteUrl';
import CONFIG from '../config';
import type { PortfolioData, DentalCase } from '../types';

interface PublicWebsiteData extends Partial<PortfolioData> {
  sameAs?: string[];
}

interface PublicWebsiteProps {
  slug?: string;
  params?: { slug?: string };
}

export default function PublicWebsite({ slug: propSlug, params }: PublicWebsiteProps = {}) {
  const [, compactParams] = useRoute('/dr:slug');
  const [, slashParams] = useRoute('/dr/:slug');
  const [, directParams] = useRoute('/:slug');
  
  const pathnameSlug = typeof window !== 'undefined' 
    ? window.location.pathname.replace(/^\/dr\/?/, '').replace(/^\/+|\/+$/g, '') 
    : '';

  const rawSlug = propSlug || params?.slug || slashParams?.slug || compactParams?.slug || directParams?.slug || pathnameSlug || '';
  const slug = getCleanDoctorSlug(rawSlug);

  const [website, setWebsite] = useState<PublicWebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<DentalCase | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [sliderPositions, setSliderPositions] = useState<Record<string, number>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const isAr = lang === 'ar';

  useEffect(() => {
    let active = true;
    const loadWebsite = async () => {
      setLoading(true);
      setError('');
      try {
        const cleanSlug = slug;
        if (!cleanSlug) {
          throw new Error('لم يتم تحديد عنوان الموقع المطلوب.');
        }

        // Direct check for Dr. Michael Nabil
        if (cleanSlug === 'drmichaelnabil' || cleanSlug === 'michaelnabil' || cleanSlug === 'michael') {
          window.location.replace('https://portfoliohubs.github.io/drmichaelnabil');
          return;
        }

        // Check if matches a demo live example
        const matchingExample = (CONFIG.portfolioIntro.liveExamples ?? []).find(
          ex => ex.link.toLowerCase().replace(/^\/+|\/+$/g, '') === cleanSlug
        );
        if (matchingExample) {
          window.location.replace(`https://portfoliohubs.github.io/${matchingExample.link}`);
          return;
        }

        // 1. Try Cloudflare Worker API endpoint first
        try {
          const response = await cloudflareApi.getPublishedWebsite(cleanSlug);
          if (active && response?.data) {
            setWebsite(response.data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('[PublicWebsite] Cloudflare API notice:', apiError);
        }

        // 2. Check slugs collection in Firestore
        let uid = '';
        let slugSnap = await getDoc(doc(db, 'slugs', cleanSlug));
        if (!slugSnap.exists()) {
          slugSnap = await getDoc(doc(db, 'slugs', `dr-${cleanSlug}`));
        }
        if (!slugSnap.exists() && cleanSlug.startsWith('dr-')) {
          slugSnap = await getDoc(doc(db, 'slugs', cleanSlug.replace(/^dr-/, '')));
        }
        if (slugSnap.exists()) {
          uid = slugSnap.data().uid || '';
        } else {
          uid = cleanSlug;
        }

        // 3. Load portfolio by UID
        if (uid) {
          let websiteSnapshot = await getDoc(doc(db, 'published_portfolios', uid));
          if (!websiteSnapshot.exists()) {
            websiteSnapshot = await getDoc(doc(db, 'portfolios', uid));
          }
          if (!websiteSnapshot.exists()) {
            websiteSnapshot = await getDoc(doc(db, 'users', uid));
          }

          if (websiteSnapshot.exists() && active) {
            setWebsite(websiteSnapshot.data() as PublicWebsiteData);
            setLoading(false);
            return;
          }
        }

        // 4. Fallback search by slug field in portfolios collection
        try {
          const q = query(
            collection(db, 'portfolios'),
            where('slug', 'in', [cleanSlug, `dr-${cleanSlug}`, `dr${cleanSlug}`]),
            limit(1)
          );
          const qSnap = await getDocs(q);
          if (!qSnap.empty && active) {
            setWebsite(qSnap.docs[0].data() as PublicWebsiteData);
            setLoading(false);
            return;
          }
        } catch (queryErr) {
          console.warn('[PublicWebsite] Query fallback notice:', queryErr);
        }

        throw new Error('هذا الموقع غير متاح حالياً أو لم يتم اعتماده ونشره بعد.');
      } catch (loadError) {
        console.warn('[PublicWebsite] Note:', loadError instanceof Error ? loadError.message : 'Unable to load website');
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل هذا الموقع.');
          setLoading(false);
        }
      }
    };

    void loadWebsite();
    return () => {
      active = false;
    };
  }, [slug]);

  // Sync Dynamic SEO Metadata
  useEffect(() => {
    if (!website) return;
    const cleanSlug = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    const displayName = website.fullNameAr || website.fullName || 'طبيب أسنان';
    document.title = `${displayName} | PortfolioHubs Official Medical Portfolio`;
    
    const description = `${displayName} - ${website.titleAr || website.title || 'طبيب وجراح أسنان'}. الملف المهني والحالات السريرية وتفاصيل العيادة والتواصل.`;
    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.name = 'description';
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://portfoliohubs.github.io/dr/${cleanSlug}`;
  }, [slug, website]);

  const cases = useMemo(() => website?.cases || [], [website]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    cases.forEach(c => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [cases]);

  const filteredCases = useMemo(() => {
    if (activeCategory === 'all') return cases;
    return cases.filter(c => c.category === activeCategory);
  }, [cases, activeCategory]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: website?.fullName || 'Doctor Portfolio',
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSliderChange = (caseId: string, val: number) => {
    setSliderPositions(prev => ({ ...prev, [caseId]: val }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
          <Stethoscope className="w-7 h-7 text-cyan-400 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">PortfolioHubs Medical Profile</h2>
        <p className="text-sm text-slate-400 direction-rtl mb-6">جاري مزامنة بيانات البورتفوليو والحالات السريرية...</p>
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">الموقع غير متاح حالياً</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error || 'لم يتم العثور على بورتفوليو معتمد بهذا الاسم، أو أن الحساب قيد المراجعة والاعتماد.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-900/30 transition"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            العودة للرئيسية PortfolioHubs
          </Link>
        </main>
      </div>
    );
  }

  const name = isAr ? (website.fullNameAr || website.fullName) : (website.fullName || website.fullNameAr);
  const title = isAr ? (website.titleAr || website.title) : (website.title || website.titleAr);
  const university = isAr ? (website.universityAr || website.university) : (website.university || website.universityAr);
  const clinic = isAr ? (website.clinicNameAr || website.clinicName) : (website.clinicName || website.clinicNameAr);
  const address = isAr ? (website.locationAddressAr || website.locationAddress) : (website.locationAddress || website.locationAddressAr);
  const photo = website.profilePhoto || website.profilePreview || '/logo.png';
  const gradYear = website.graduationYear;
  const expYears = gradYear ? Math.max(1, new Date().getFullYear() - parseInt(gradYear, 10)) : 3;

  const whatsappClean = (website.whatsapp || website.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = whatsappClean ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(isAr ? 'مرحباً دكتور، أود الاستفسار عن كشف وحجز موعد عبر موقعك الرسمي.' : 'Hello Doctor, I would like to inquire about consultation and booking an appointment.')}` : '';

  return (
    <div className={`min-h-screen bg-[#070d1e] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 ${isAr ? 'direction-rtl' : 'direction-ltr'}`}>
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#070d1e]/85 border-b border-slate-800/80 px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400 transition">
                <img src="/logo.png" alt="PortfolioHubs" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              </div>
              <span className="text-xs font-black tracking-wider text-cyan-400 uppercase hidden sm:inline">PortfolioHubs</span>
            </Link>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'طبيب معتمد' : 'Verified Doctor'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition"
              title="Switch Language"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'English' : 'عربي'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
              title="Share Website"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden sm:inline">{copiedLink ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'مشاركة' : 'Share')}</span>
            </button>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isAr ? 'حجز موعد' : 'Book Now'}</span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-8 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          
          {/* Avatar with luxury border */}
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 shadow-2xl shadow-cyan-950/60 mx-auto">
              <img
                src={photo}
                alt={name}
                className="w-full h-full object-cover rounded-[22px] bg-slate-900"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <div className="absolute -bottom-2 right-2 sm:right-4 bg-[#070d1e] p-1 rounded-full">
              <div className="p-1.5 rounded-full bg-cyan-500 text-slate-950 shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Doctor Title & Name */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              {title || (isAr ? 'طبيب وجراح أسنان' : 'Dental Surgeon')}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
              {name}
            </h1>
            {university && (
              <p className="text-slate-300 text-sm sm:text-base font-medium flex items-center justify-center gap-1.5 text-center">
                <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{university} {gradYear ? `(${gradYear})` : ''}</span>
              </p>
            )}
            {clinic && (
              <p className="text-slate-400 text-xs sm:text-sm mt-1 flex items-center justify-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{clinic} {address ? `· ${address}` : ''}</span>
              </p>
            )}
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isAr ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}</span>
              </a>
            )}

            {website.phone && (
              <a
                href={`tel:${website.phone}`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'اتصال مباشر' : 'Call Clinic'}</span>
              </a>
            )}

            {address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${clinic || name} ${address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition"
              >
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{isAr ? 'موقع العيادة' : 'Location'}</span>
              </a>
            )}
          </div>

          {/* Key Metrics / Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 mb-0.5">+{cases.length || 10}</div>
              <div className="text-xs text-slate-400 font-medium">{isAr ? 'حالات سريرية موثقة' : 'Documented Cases'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-blue-400 mb-0.5">+{expYears}</div>
              <div className="text-xs text-slate-400 font-medium">{isAr ? 'سنوات من الخبرة' : 'Years Experience'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mb-0.5">100%</div>
              <div className="text-xs text-slate-400 font-medium">{isAr ? 'تعقيم ومعايير جودة' : 'Sterilization Standards'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-purple-400 mb-0.5">24/7</div>
              <div className="text-xs text-slate-400 font-medium">{isAr ? 'حجز واستشارات' : 'Inquiries & Booking'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Cases Showcase Section */}
      {cases.length > 0 && (
        <section className="py-16 px-4 sm:px-8 bg-slate-950/60 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider block mb-1">
                  {isAr ? 'معرض الحالات الواقعية' : 'Clinical Portfolio'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  {isAr ? 'الحالات السريرية ونتائج العلاج' : 'Clinical Cases & Smile Transformations'}
                </h2>
              </div>

              {/* Category Pills Filter */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeCategory === 'all' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {isAr ? 'الكل' : 'All Cases'}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${activeCategory === cat ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map((c, idx) => {
                const caseTitle = isAr ? (c.titleAr || c.title) : (c.title || c.titleAr);
                const caseDesc = isAr ? (c.descriptionAr || c.description) : (c.description || c.descriptionAr);
                const beforeImg = c.beforePhoto?.url || c.beforePhoto?.previewUrl;
                const afterImg = c.afterPhoto?.url || c.afterPhoto?.previewUrl || c.photos?.[0]?.url || c.photos?.[0]?.previewUrl;
                const sliderPos = sliderPositions[c.id || idx] ?? 50;

                return (
                  <div
                    key={c.id || idx}
                    className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 hover:shadow-2xl transition flex flex-col group"
                  >
                    {/* Before / After Slider or Photo Display */}
                    <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden select-none">
                      {beforeImg && afterImg ? (
                        <div className="relative w-full h-full">
                          {/* After Image (Full background) */}
                          <img
                            src={afterImg}
                            alt="After treatment"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase">
                            {isAr ? 'بعد' : 'AFTER'}
                          </span>

                          {/* Before Image (Clipped) */}
                          <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: `${sliderPos}%` }}
                          >
                            <img
                              src={beforeImg}
                              alt="Before treatment"
                              className="absolute inset-0 w-full h-full object-cover max-w-none"
                              style={{ width: '100%', height: '100%' }}
                            />
                            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-500/30 text-rose-300 text-[10px] font-black uppercase">
                              {isAr ? 'قبل' : 'BEFORE'}
                            </span>
                          </div>

                          {/* Divider Line */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-20"
                            style={{ left: `${sliderPos}%` }}
                          >
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md">
                              <span className="text-[10px] font-black">↔</span>
                            </div>
                          </div>

                          {/* Invisible Range Input for Interactive Slider */}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderPos}
                            onChange={(e) => handleSliderChange(c.id || String(idx), Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                          />
                        </div>
                      ) : afterImg ? (
                        <div 
                          className="relative w-full h-full cursor-pointer group-hover:scale-105 transition duration-500"
                          onClick={() => setLightboxImage(afterImg)}
                        >
                          <img
                            src={afterImg}
                            alt={caseTitle}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300">
                              <Eye className="w-3.5 h-3.5" />
                              {isAr ? 'اضغط للتكبير' : 'Click to zoom'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Smile className="w-12 h-12 stroke-[1]" />
                        </div>
                      )}
                    </div>

                    {/* Case Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {c.category && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                            {c.category}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                          {caseTitle || (isAr ? 'علاج وتجميل أسنان' : 'Dental Treatment Case')}
                        </h3>
                        {caseDesc && (
                          <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed mb-4">
                            {caseDesc}
                          </p>
                        )}
                      </div>

                      {c.sessionCount && (
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                          <span>{isAr ? 'عدد الجلسات:' : 'Sessions:'}</span>
                          <span className="font-bold text-slate-200">{c.sessionCount} {isAr ? 'جلسات' : 'visits'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Skills & Clinical Mastery */}
      {((website.clinicalSkills && website.clinicalSkills.length > 0) || (website.digitalSkills && website.digitalSkills.length > 0)) && (
        <section className="py-16 px-4 sm:px-8 border-t border-slate-800/80">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider block mb-1">
                {isAr ? 'المهارات والخبرات السريرية' : 'Areas of Expertise'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {isAr ? 'مجالات التميز والتقنيات الحديثة' : 'Clinical & Digital Mastery'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {website.clinicalSkills && website.clinicalSkills.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{isAr ? 'المهارات السريرية' : 'Clinical Procedures'}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {website.clinicalSkills.map((sk, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-200">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {website.digitalSkills && website.digitalSkills.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{isAr ? 'طب الأسنان الرقمي و CAD/CAM' : 'Digital Dentistry'}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {website.digitalSkills.map((sk, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-200">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {website.timeline && website.timeline.length > 0 && (
        <section className="py-16 px-4 sm:px-8 bg-slate-950/60 border-t border-slate-800/80">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider block mb-1">
                {isAr ? 'المسيرة المهنية والتعليمية' : 'Education & Milestones'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {isAr ? 'المحطات والشهادات الأكاديمية' : 'Career Timeline'}
              </h2>
            </div>

            <div className="relative border-s border-cyan-500/30 ms-4 sm:ms-8 space-y-6">
              {website.timeline.map((m, idx) => (
                <div key={idx} className="relative ps-6 sm:ps-8">
                  <div className="absolute -start-2.5 top-1.5 w-5 h-5 rounded-full bg-cyan-500 border-4 border-[#070d1e]" />
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-bold mb-1.5">
                      {m.year}
                    </span>
                    <p className="text-sm font-semibold text-white">
                      {isAr ? (m.eventAr || m.event) : (m.event || m.eventAr)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact & Clinic Location Card */}
      <section className="py-16 px-4 sm:px-8 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-8 relative z-10">
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider block mb-1">
                {isAr ? 'تواصل واحجز موعدك' : 'Book Consultation'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {clinic || (isAr ? 'عيادة الأسنان التخصصية' : 'Dental Practice Clinic')}
              </h2>
              {address && <p className="text-slate-400 text-sm mt-2">{address}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 max-w-xl mx-auto mb-8">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-bold text-sm transition"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs text-emerald-400/80 font-normal">{isAr ? 'محادثة سريعة' : 'Instant Chat'}</div>
                    <span>WhatsApp</span>
                  </div>
                </a>
              )}

              {website.phone && (
                <a
                  href={`tel:${website.phone}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-white font-bold text-sm transition"
                >
                  <Phone className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400 font-normal">{isAr ? 'الهاتف المباشر' : 'Direct Phone'}</div>
                    <span dir="ltr">{website.phone}</span>
                  </div>
                </a>
              )}

              {website.email && (
                <a
                  href={`mailto:${website.email}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-white font-bold text-sm transition"
                >
                  <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs text-slate-400 font-normal">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</div>
                    <span className="truncate block">{website.email}</span>
                  </div>
                </a>
              )}

              {address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${clinic || name} ${address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-white font-bold text-sm transition"
                >
                  <MapPin className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400 font-normal">{isAr ? 'الاتجاهات' : 'Get Directions'}</div>
                    <span>Google Maps</span>
                  </div>
                </a>
              )}
            </div>

            {/* Social Media Links */}
            {(website.instagram || website.linkedin || website.facebook) && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-800">
                {website.instagram && (
                  <a
                    href={website.instagram.startsWith('http') ? website.instagram : `https://instagram.com/${website.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-pink-600/20 text-slate-300 hover:text-pink-400 border border-slate-700 transition"
                    title="Instagram"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {website.linkedin && (
                  <a
                    href={website.linkedin.startsWith('http') ? website.linkedin : `https://linkedin.com/in/${website.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700 transition"
                    title="LinkedIn"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {website.facebook && (
                  <a
                    href={website.facebook.startsWith('http') ? website.facebook : `https://facebook.com/${website.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700 transition"
                    title="Facebook"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer & Platform Attribution */}
      <footer className="py-8 px-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {name}. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold transition">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by PortfolioHubs</span>
          </Link>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged clinical photo"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Sticky Mobile Floating Action Bar */}
      {whatsappUrl && (
        <div className="sm:hidden fixed bottom-4 inset-x-4 z-40">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-2xl shadow-black/80 active:scale-95 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{isAr ? 'احجز موعدك الآن عبر واتساب' : 'Book on WhatsApp'}</span>
          </a>
        </div>
      )}

    </div>
  );
}
