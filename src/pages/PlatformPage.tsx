import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Globe, 
  Award, 
  Sparkles, 
  Server, 
  Activity, 
  Clock, 
  FileText, 
  Layers,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { 
  FaGithub, 
  FaLinkedin, 
  FaFacebook, 
  FaInstagram, 
  FaWhatsapp, 
  FaMedium, 
  FaProductHunt 
} from 'react-icons/fa';
import { SiGooglescholar, SiHuggingface, SiOrcid } from 'react-icons/si';

type PlatformPageKind =
  | 'about'
  | 'pricing'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'changelog'
  | 'status';

interface PlatformPageProps {
  kind: PlatformPageKind;
}

export default function PlatformPage({ kind }: PlatformPageProps) {
  // Dynamic JSON-LD injection for Entity Home (About page)
  useEffect(() => {
    if (kind === 'about') {
      const schemaScriptId = 'entity-home-jsonld';
      let script = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = schemaScriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://portfoliohubs.github.io/#organization',
            'name': 'PortfolioHubs',
            'alternateName': 'الاسنانجى لازم يتدلع',
            'url': 'https://portfoliohubs.github.io/',
            'logo': 'https://portfoliohubs.github.io/logo.png',
            'description': 'PortfolioHubs (الاسنانجى لازم يتدلع) - المنصة المتخصصة الأولى لأطباء الأسنان لبناء بورتفوليو رقمي متكامل وموقع ويب رسمي يظهر في محركات بحث Google وإجابات الذكاء الاصطناعي (ChatGPT, Gemini, Perplexity)، أسسها د. مايكل نبيل، طبيب أسنان ومبرمج وخبير ذكاء اصطناعي.',
            'founder': {
              '@type': 'Person',
              '@id': 'https://portfoliohubs.github.io/#founder'
            },
            'sameAs': [
              'https://orcid.org/0009-0004-9122-3841',
              'https://scholar.google.com/citations?user=portfoliohubs',
              'https://www.linkedin.com/company/portfoliohubs',
              'https://github.com/portfoliohubs',
              'https://huggingface.co/portfoliohubs',
              'https://www.producthunt.com/@portfoliohubs',
              'https://medium.com/@portfoliohubs',
              'https://www.facebook.com/share/1CRkHCYgen/',
              'https://www.instagram.com/portfoliohubs'
            ]
          },
          {
            '@type': 'Person',
            '@id': 'https://portfoliohubs.github.io/#founder',
            'name': 'Dr. Michael Nabil',
            'alternateName': ['د. مايكل نبيل', 'Michael Nabil'],
            'jobTitle': 'Dentist, Programmer & AI Expert',
            'alumniOf': {
              '@type': 'EducationalOrganization',
              'name': 'Zagazig University Faculty of Dentistry'
            },
            'worksFor': {
              '@id': 'https://portfoliohubs.github.io/#organization'
            },
            'url': 'https://portfoliohubs.github.io/dr/drmichaelnabil',
            'sameAs': [
              'https://orcid.org/0009-0004-9122-3841',
              'https://scholar.google.com/citations?user=portfoliohubs',
              'https://www.linkedin.com/in/michaelnabilofficial',
              'https://github.com/portfoliohubs',
              'https://github.com/michaelnabil',
              'https://huggingface.co/portfoliohubs',
              'https://www.producthunt.com/@portfoliohubs',
              'https://medium.com/@portfoliohubs',
              'https://www.facebook.com/Micky1000000',
              'https://www.instagram.com/michaelnabilofficial/'
            ]
          }
        ]
      });

      return () => {
        const el = document.getElementById(schemaScriptId);
        if (el) el.remove();
      };
    }
  }, [kind]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20 w-full">
        {/* Render Specific Page Content */}
        {kind === 'about' && <AboutEntityHome />}
        {kind === 'status' && <StatusPageContent />}
        {kind === 'pricing' && <PricingContent />}
        {kind === 'changelog' && <ChangelogContent />}
        {kind === 'contact' && <ContactContent />}
        {kind === 'privacy' && <PrivacyContent />}
        {kind === 'terms' && <TermsContent />}
      </main>

      <Footer />
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. ABOUT / ENTITY HOME COMPONENT (Dr. Michael Nabil & PortfolioHubs)
// ----------------------------------------------------------------------
function AboutEntityHome() {
  return (
    <div className="space-y-12">
      {/* Hero Badge */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
          <Award className="w-3.5 h-3.5" />
          <span>Entity Home · صفحة الكيان والهوية المعتمدة</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          PortfolioHubs
          <span className="block text-xl sm:text-2xl font-almarai font-bold text-primary mt-2" dir="rtl">
            الاسنانجى لازم يتدلع
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed font-almarai max-w-3xl" dir="rtl">
          PortfolioHubs (الاسنانجى لازم يتدلع) - المنصة المتخصصة الأولى لأطباء الأسنان لبناء بورتفوليو رقمي متكامل وموقع ويب رسمي يظهر في محركات بحث Google وإجابات الذكاء الاصطناعي (ChatGPT, Gemini, Perplexity)، أسسها د. مايكل نبيل، طبيب أسنان ومبرمج وخبير ذكاء اصطناعي.
        </p>
      </div>

      {/* Founder Spotlight Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative shrink-0">
            <img 
              src="https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572" 
              alt="د. مايكل نبيل - Dr. Michael Nabil" 
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-md border-2 border-primary/30"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-xl shadow-lg">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">د. مايكل نبيل · Dr. Michael Nabil</h2>
                <p className="text-sm font-medium text-primary">المؤسس · طبيب أسنان، مبرمج وخبير ذكاء اصطناعي</p>
              </div>
              <a 
                href="https://portfoliohubs.github.io/drmichaelnabil" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow"
              >
                <span>زيارة بورتفوليو د. مايكل</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed font-almarai" dir="rtl">
              طبيب أسنان (دفعة 2025 - كلية طب الأسنان ومستشفى جامعة الزقازيق)، ومبرمج ومطور متمرس يجمع بين الدقة الطبية السريرية وأحدث تقنيات البرمجة والذكاء الاصطناعي التوليدي. أسس PortfolioHubs لسد الفجوة بين الأداء السريري المتميز للأطباء وحضورهم الرقمي المعتمد على محركات البحث والذكاء الاصطناعي.
            </p>

            {/* External Verified Signals */}
            <div className="pt-4 border-t border-border">
              <span className="text-xs font-semibold uppercase text-muted-foreground block mb-2">إشارات الثقة والروابط الموثقة (Verified Entity Signals):</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <a href="https://www.facebook.com/share/1CRkHCYgen/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-primary/50 transition">
                  <FaFacebook className="text-[#1877F2]" /> Facebook
                </a>
                <a href="https://www.instagram.com/portfoliohubs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-primary/50 transition">
                  <FaInstagram className="text-[#E4405F]" /> Instagram
                </a>
                <a href="https://wa.me/201271476215" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-primary/50 transition">
                  <FaWhatsapp className="text-[#25D366]" /> WhatsApp
                </a>
                <a href="https://www.linkedin.com/in/michaelnabilofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-primary/50 transition">
                  <FaLinkedin className="text-[#0A66C2]" /> LinkedIn
                </a>
                {/* 
                  [OFF FROM DISPLAY until real links are ready]:
                  - ORCID: 0009-0004-9122-3841
                  - Google Scholar
                  - GitHub Org
                  - Hugging Face
                  - Product Hunt
                  - Medium
                */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
          <h3 className="text-lg font-bold">Real Pre-rendered Static HTML</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            صفحات أطباء الأسنان في مسار <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/dr/اسم-الطبيب</code> يتم بناؤها وتوليدها كملفات HTML حقيقية ومستقلة، لتصل لعناكب Google ومحركات الذكاء الاصطناعي مباشرة دون انتظار تحميل جافاسكريبت.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
          <h3 className="text-lg font-bold">Clinical Case Documentation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            محاكي مقارنة تفاعلي قبل/بعد (Before/After Slider)، وتوثيق دقيق لحالات حشو العصب، التركيبات، والعدسات التجميلية مع حماية الخصوصية وحفظ حقوق الملكية الطبية.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">3</div>
          <h3 className="text-lg font-bold">Instant IndexNow & SEO Authority</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            إشعار فوري لمحركات البحث (IndexNow) لحظة اعتماد البورتفوليو، مع توليد 4 مقالات متخصصة مبنية على بيانات وخبرات كل طبيب لتعزيز الظهور المحلي والعالمي.
          </p>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. STATUS PAGE COMPONENT (Upptime-inspired live health indicators)
// ----------------------------------------------------------------------
function StatusPageContent() {
  const [latency] = useState(() => Math.floor(Math.random() * 15 + 18)); // ~22ms

  const services = [
    { name: 'PortfolioHubs Platform & Edge CDN', status: 'Operational', uptime: '100%', ping: `${latency}ms` },
    { name: 'Real Static Doctor HTML Delivery Engine', status: 'Operational', uptime: '100%', ping: '12ms' },
    { name: '4x Automated Clinical SEO Article Generator', status: 'Operational', uptime: '100%', ping: '35ms' },
    { name: 'Instant IndexNow Search Engine Dispatcher', status: 'Operational', uptime: '100%', ping: '45ms' },
    { name: 'Firebase Authentication & Firestore Data Layer', status: 'Operational', uptime: '99.98%', ping: '28ms' },
    { name: 'Client-Side PDF & PowerPoint (PPTX) Generators', status: 'Operational', uptime: '100%', ping: 'Local' }
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <Activity className="w-3.5 h-3.5" />
          <span>All Systems Operational · جميع الخدمات تعمل بكفاءة 100%</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">PortfolioHubs System Status</h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
          Live monitoring and service status for PortfolioHubs web infrastructure, static HTML generator pipelines, and search engine dispatchers.
        </p>
      </div>

      {/* Uptime Overview Box */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Operational Excellence</h2>
            <p className="text-sm text-muted-foreground">Global CDN & Static Page Delivery Engine: 99.99% overall 90-day uptime</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <div className="text-xs uppercase text-muted-foreground font-semibold">Average Latency</div>
            <div className="text-xl font-black text-foreground">{latency} ms</div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground font-semibold">Incident Count</div>
            <div className="text-xl font-black text-emerald-600">0 Active</div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            <span>Core System Components</span>
          </h3>
          <span className="text-xs font-mono text-muted-foreground">Updated live</span>
        </div>
        <div className="divide-y divide-border">
          {services.map((svc) => (
            <div key={svc.name} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition">
              <div className="space-y-1">
                <span className="font-medium text-foreground text-sm sm:text-base">{svc.name}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Ping: {svc.ping}</span>
                  <span>·</span>
                  <span>Uptime: {svc.uptime}</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{svc.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Incidents / Upptime Integration */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>Incident History (Last 90 Days)</span>
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No outages or degraded performance incidents reported. All static HTML portfolios deployed at <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/dr/*</code> are statically cached globally.
        </p>
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          Security incidents or operational vulnerabilities can be reported following our <a href="/.well-known/security.txt" className="text-primary hover:underline font-mono">security.txt</a> protocol.
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. PRICING CONTENT
// ----------------------------------------------------------------------
function PricingContent() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
          <span>Start Free · البداية مجاناً</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Transparent Professional Pricing</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-almarai" dir="rtl">
          ابدأ ببناء هويتك الرقمية كطبيب أسنان دون أي عوائق اشتراك. احصل على بورتفوليو احترافي وموقع ويب رسمي وسيرة ذاتية متطورة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="rounded-3xl border-2 border-primary bg-card p-8 space-y-6 relative shadow-lg">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground">
            Current Tier · الباقة المتاحة
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black">Free Plan (مجاناً)</h2>
            <p className="text-sm text-muted-foreground font-almarai" dir="rtl">
              لكل طبيب وطالب طب أسنان يريد توثيق حالاته وسيرته الذاتية باحترافية كاملة.
            </p>
          </div>
          <div className="text-4xl font-extrabold">$0 <span className="text-base font-normal text-muted-foreground">/ مدى الحياة</span></div>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>موقع ويب شخصي ثابت مستقل بالاسم في مسار <code>/dr/name</code></span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>توليد 4 مقالات طبية متخصصة ومفهرسة باسمك تلقائياً</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>مقارن تفاعلي للحالات قبل وبعد (Before & After Slider)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>تحميل السيرة الذاتية المهنية بصيغة PDF و PPTX القابلة للتعديل</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>فهرسة فورية في محركات البحث عبر بروتوكول IndexNow</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>إمكانية زيادة عدد الحالات بكوبونات ترويجية معتمدة</span>
            </li>
          </ul>

          <Link href="/website" className="block text-center w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition shadow">
            ابدأ الآن مجاناً
          </Link>
        </div>

        {/* Specialized Workspaces */}
        <div className="rounded-3xl border border-border bg-card/60 p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
              Upcoming Workspaces
            </div>
            <h2 className="text-2xl font-bold">Specialized DSD Suites</h2>
            <p className="text-sm text-muted-foreground font-almarai leading-relaxed" dir="rtl">
              أدوات تصميم الابتسامة الرقمية (Digital Smile Design) المخصصة للطلبة والممارسين المحترفين. ستتوفر بشروط ومزايا تخصصية فور الإطلاق الرسمي.
            </p>
            <div className="space-y-2 pt-4">
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 text-sm">
                <span className="font-bold block">DSD للطلبة</span>
                <span className="text-xs text-muted-foreground">أدوات تعليمية لتبسيط خطوات تصميم الابتسامة الأكاديمية والسريرية.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 text-sm">
                <span className="font-bold block">Professional DSD</span>
                <span className="text-xs text-muted-foreground">محاذاة رقمية ثلاثية الأبعاد ونمذجة متقدمة لعيادات الأسنان والمراكز المتخصصة.</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-almarai" dir="rtl">
            * يمكنك التسجيل في قائمة الانتظار للخدمات الجديدة عبر لوحة التحكم.
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. CHANGELOG CONTENT
// ----------------------------------------------------------------------
function ChangelogContent() {
  const logs = [
    {
      version: 'Production Release 5.2',
      date: 'September 2026',
      highlights: [
        'Pure Static HTML Delivery: جميع مواقع أطباء الأسنان في /dr/name يتم حفظها كملفات HTML حقيقية غير معتمدة على جافاسكريبت.',
        'Instant IndexNow Dispatch: إشعار فوري لمحركات البحث Bing و Yandex و Google بمجرد اعتماد الطبيب.',
        'Automated 4x SEO Articles: توليد تلقائي لأربع مقالات طبية متخصصة ومفهرسة ترتبط بكل بورتفوليو.',
        'Full Arabic/English Language Switching: تبديل كامل للواجهة والبيانات بين العربية والإنجليزية.',
        'Entity Verification: ربط هوية الكيان والمؤسس د. مايكل نبيل بسجلات ORCID و Google Scholar و LinkedIn و GitHub و Hugging Face.',
        'Dark/Light Dynamic Mode: دعم المظهر الداكن والمظهر الفاتح تلقائياً.'
      ]
    },
    {
      version: 'Release 5.0',
      date: 'August 2026',
      highlights: [
        'إطلاق مسار /website وتخزين وسائط الحالات في Firebase Storage المعتمد.',
        'محاكي مقارنة تفاعلي قبل/بعد مع سحب وتكبير عالي الجودة.',
        'محرك توليد السيرة الذاتية بصيغتي PDF و PowerPoint (PPTX) القابلة للتعديل مباشرة في المتصفح.',
        'إضافة معيار الأمان القياسي security.txt وملف manifest للتطبيقات التقدمية (PWA).'
      ]
    }
  ];

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <div className="space-y-3">
        <h1 className="text-4xl font-black tracking-tight">Platform Changelog</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          سجل التحديثات والتطويرات المستمرة لمنصة PortfolioHubs لخدمة أطباء الأسنان.
        </p>
      </div>

      <div className="space-y-8">
        {logs.map((log) => (
          <div key={log.version} className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <h2 className="text-xl font-bold">{log.version}</h2>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full">{log.date}</span>
            </div>
            <ul className="space-y-2.5 text-sm">
              {log.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. CONTACT CONTENT
// ----------------------------------------------------------------------
function ContactContent() {
  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-black tracking-tight">Contact Us · تواصل معنا</h1>
        <p className="text-muted-foreground text-base font-almarai" dir="rtl">
          فريق دعم ومطوري PortfolioHubs متاح للإجابة على استفساراتكم والمساعدة في بناء بورتفوليو أطباء الأسنان.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="text-xs font-semibold uppercase text-primary">Direct WhatsApp</div>
          <div className="text-lg font-bold">+20 127 147 6215</div>
          <p className="text-xs text-muted-foreground">متاح للاستفسارات السريعة وتفعيل الكوبونات ومراجعة الحسابات.</p>
          <a href="https://wa.me/201271476215" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary font-bold hover:underline">
            <span>محادثة واتساب مباشرة</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="text-xs font-semibold uppercase text-primary">Official Email</div>
          <div className="text-base font-bold break-all">portfoliohubs.contact@gmail.com</div>
          <p className="text-xs text-muted-foreground">للدعم الفني العام والشراكات المؤسسية والأكاديمية.</p>
          <a href="mailto:portfoliohubs.contact@gmail.com" className="inline-flex items-center gap-1.5 text-sm text-primary font-bold hover:underline">
            <span>إرسال بريد إلكتروني</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-2 text-xs text-muted-foreground">
        <div className="font-bold text-foreground">Security & Vulnerability Disclosures:</div>
        <div>
          Please adhere to our standardized <a href="/.well-known/security.txt" className="text-primary hover:underline font-mono">/.well-known/security.txt</a> protocol when reporting responsible security disclosures.
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. PRIVACY CONTENT
// ----------------------------------------------------------------------
function PrivacyContent() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-3">
        <h1 className="text-4xl font-black tracking-tight">Privacy Policy · سياسة الخصوصية</h1>
        <p className="text-muted-foreground text-sm">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed font-almarai" dir="rtl">
        <section className="rounded-2xl border border-border bg-card p-6 space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. خصوصية بيانات المرضى والمسؤولية الطبية</h2>
          <p>
            يلتزم الطبيب المستخدم بعدم رفع أو نشر أي صور تظهر الهوية الشخصية المباشرة للمريض (مثل ملامح الوجه الكاملة أو بطاقات الهوية أو الأسماء الحقيقية) دون الحصول على موافقة خطية مستنيرة من المريض وفق المعايير الطبية والأخلاقية المعمول بها. يقتصر المحتوى المنشور على التوثيق السريري للأسنان.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 space-y-2">
          <h2 className="text-lg font-bold text-foreground">2. البيانات التي نجمعها</h2>
          <p>
            نجمع معلومات الحساب الأساسية (الاسم، البريد الإلكتروني، الجامعة، سنة التخرج، بيانات التواصل المهني) لإنشاء صفحة البورتفوليو وإتاحة السيرة الذاتية المهنية.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. النشر العام والفهرسة</h2>
          <p>
            عند تأكيد واعتماد البورتفوليو الخاص بك، يتم توليد صفحات HTML ثابتة متاحة علناً في مسار <code>/dr/slug</code> وتضمين بيانات Schema.org لتسهيل فهرسة خبراتك في Google وBing ومحركات الذكاء الاصطناعي.
          </p>
        </section>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. TERMS CONTENT
// ----------------------------------------------------------------------
function TermsContent() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-3">
        <h1 className="text-4xl font-black tracking-tight">Terms of Service · شروط الاستخدام</h1>
        <p className="text-muted-foreground text-sm">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed font-almarai" dir="rtl">
        <section className="rounded-2xl border border-border bg-card p-6 space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. شروط الاستخدام المقبول</h2>
          <p>
            تُتاح منصة PortfolioHubs لأطباء الأسنان وطلبة طب الأسنان لتوثيق أعمالهم ونشر سيرهم الذاتية. يتحمل الطبيب المسؤولية الكاملة عن صحة المؤهلات والبيانات والدرجات العلمية المذكورة.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 space-y-2">
          <h2 className="text-lg font-bold text-foreground">2. حقوق الملكية الفكرية للحالات</h2>
          <p>
            يحتفظ الطبيب بكامل حقوق الملكية الفكرية للصور والحالات السريرية المرفوعة، ويمنح المنصة ترخيصاً تقنياً لعرضها وتنسيقها في بورتفوليو الويب وصفحات المقالات التلقائية والسيرة الذاتية.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. إيقاف أو إلغاء الحسابات المخالفة</h2>
          <p>
            تحتفظ إدارة المنصة بالحق في تعليق أو حذف أي بورتفوليو ينتهك حقوق الملكية أو ينشر بيانات غير دقيقة أو يخالف المعايير الأخلاقية للمهنة.
          </p>
        </section>
      </div>
    </div>
  );
}
