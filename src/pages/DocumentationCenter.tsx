import { useState, useMemo, useEffect, useRef } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { 
  Search, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  MessageCircle, 
  Check, 
  Copy, 
  Menu, 
  X, 
  Sparkles, 
  ArrowUpRight, 
  Info, 
  AlertTriangle, 
  Layers, 
  Image as ImageIcon, 
  Globe, 
  ShieldCheck, 
  Rocket,
  CheckCircle2,
  Share2
} from 'lucide-react';
import Header from '../components/Header';
import { DOCS_ARTICLES, DOC_CATEGORIES, DocArticle, getDocArticleBySlug } from '../data/docsData';
import DocsDiagram from '../components/DocsDiagrams';
import CONFIG from '../config';

const CATEGORY_ICONS: Record<string, typeof Rocket> = {
  'getting-started': Rocket,
  'core-services': Layers,
  'cases-media': ImageIcon,
  'publishing-seo': Globe,
  'account-billing': ShieldCheck,
};

export default function DocumentationCenter() {
  const [, params] = useRoute('/docs/:slug');
  const [, setLocation] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Determine active article based on slug or default to quickstart
  const activeSlug = params?.slug || 'quickstart';
  const currentArticle: DocArticle = useMemo(() => {
    return getDocArticleBySlug(activeSlug) || DOCS_ARTICLES[0];
  }, [activeSlug]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = currentArticle.sections.map(s => document.getElementById(s.id));
      const scrollPos = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSectionId(currentArticle.sections[i].id);
          return;
        }
      }
      if (currentArticle.sections.length > 0) {
        setActiveSectionId(currentArticle.sections[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentArticle]);

  // Instant Zero-Network In-Memory Search
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: { article: DocArticle; matchType: 'title' | 'summary' | 'section'; text: string; sectionId?: string }[] = [];

    DOCS_ARTICLES.forEach(art => {
      const titleArMatch = art.titleAr.toLowerCase().includes(q);
      const titleEnMatch = art.titleEn.toLowerCase().includes(q);
      const summaryMatch = art.summaryAr.toLowerCase().includes(q);

      if (titleArMatch || titleEnMatch) {
        results.push({
          article: art,
          matchType: 'title',
          text: art.titleAr,
        });
      } else if (summaryMatch) {
        results.push({
          article: art,
          matchType: 'summary',
          text: art.summaryAr,
        });
      } else {
        const secMatch = art.sections.find(s => 
          s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
        );
        if (secMatch) {
          results.push({
            article: art,
            matchType: 'section',
            text: secMatch.title,
            sectionId: secMatch.id,
          });
        }
      }
    });

    return results;
  }, [searchQuery]);

  // Prev & Next navigation
  const currentIndex = DOCS_ARTICLES.findIndex(a => a.id === currentArticle.id);
  const prevArticle = currentIndex > 0 ? DOCS_ARTICLES[currentIndex - 1] : null;
  const nextArticle = currentIndex < DOCS_ARTICLES.length - 1 ? DOCS_ARTICLES[currentIndex + 1] : null;

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleShareArticle = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-brand/20 text-foreground" dir="rtl">
      <Header />

      {/* Docs Sub-Header / Search Bar (Google Cloud Docs style) */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur sticky top-16 z-30 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="القائمة الجانبية للتوثيق"
            >
              {mobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Link href="/docs">
                <span className="font-extrabold text-brand hover:underline cursor-pointer flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>مركز التوثيق الشامل</span>
                </span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground hidden sm:inline">{currentArticle.categoryTitleAr}</span>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-[280px]">
                {currentArticle.titleAr}
              </span>
            </div>
          </div>

          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-xl border border-border bg-background hover:border-brand/40 text-xs text-muted-foreground hover:text-foreground shadow-xs transition-all w-48 sm:w-64"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-brand" />
              <span>بحث فوري في التوثيق...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex px-4 sm:px-6 py-6 sm:py-8 gap-8">
        
        {/* ── COLUMN 1: Left Navigation Sidebar ─────────────────────────────── */}
        <aside 
          className={`
            fixed lg:sticky top-32 z-40 lg:z-10 h-[calc(100vh-8.5rem)] w-72 shrink-0
            bg-card lg:bg-transparent border lg:border-none border-border rounded-2xl lg:rounded-none p-4 lg:p-0
            overflow-y-auto transition-all duration-200 shadow-lg lg:shadow-none
            ${mobileSidebarOpen ? 'right-4 block' : 'hidden lg:block'}
          `}
        >
          <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <span className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>أقسام ومقالات التوثيق</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                {DOCS_ARTICLES.length} مقالات
              </span>
            </div>

            {DOC_CATEGORIES.map(category => {
              const CategoryIcon = CATEGORY_ICONS[category.id] || BookOpen;
              const articles = DOCS_ARTICLES.filter(a => a.category === category.id);
              if (articles.length === 0) return null;

              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground px-2">
                    <CategoryIcon className="h-3.5 w-3.5 text-brand" />
                    <span>{category.titleAr}</span>
                  </div>

                  <div className="space-y-1">
                    {articles.map(art => {
                      const isActive = art.slug === currentArticle.slug;
                      return (
                        <button
                          key={art.id}
                          onClick={() => {
                            setLocation(`/docs/${art.slug}`);
                            setMobileSidebarOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`
                            w-full text-right flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all
                            ${isActive 
                              ? 'bg-brand text-white font-bold shadow-xs' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                            }
                          `}
                        >
                          <span className="truncate">{art.titleAr}</span>
                          {art.badge && (
                            <span 
                              className={`
                                text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-semibold
                                ${isActive ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'}
                              `}
                            >
                              {art.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Quick Support Widget in Sidebar */}
            <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 space-y-2.5">
              <div className="flex items-center gap-2 text-brand font-bold text-xs">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>تحتاج مساعدة مباشرة؟</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                فريق الدعم الفني الطبي متاح لمساعدتك عبر واتساب في تجهيز ملفك أو حل أي استفسار.
              </p>
              <a
                href={CONFIG.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>محادثة واتساب سريعة</span>
              </a>
            </div>
          </div>
        </aside>

        {/* ── COLUMN 2: Main Middle Content ─────────────────────────────────── */}
        <main className="flex-1 min-w-0 max-w-3xl space-y-8 pb-16">
          
          {/* Article Header Card */}
          <div className="space-y-4 pb-6 border-b border-border/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold">
                <span>{currentArticle.categoryTitleAr}</span>
                {currentArticle.badge && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currentArticle.badge}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>وقت القراءة: {currentArticle.readingTime}</span>
                <span>•</span>
                <span>آخر تحديث: {currentArticle.lastUpdated}</span>
                <button
                  onClick={handleShareArticle}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1"
                  title="نسخ رابط المقال"
                >
                  {copiedShare ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
              {currentArticle.titleAr}
            </h1>

            <div className="text-xs sm:text-sm font-medium text-muted-foreground" dir="ltr">
              {currentArticle.titleEn}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed bg-muted/40 p-4 rounded-2xl border border-border/60">
              {currentArticle.summaryAr}
            </p>
          </div>

          {/* SVG Diagram / Visual Illustration if present */}
          {currentArticle.svgDiagramType && (
            <DocsDiagram type={currentArticle.svgDiagramType} />
          )}

          {/* Article Sections */}
          <div className="space-y-10">
            {currentArticle.sections.map((sec, idx) => (
              <section key={sec.id} id={sec.id} className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand/10 text-brand font-extrabold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    {sec.title}
                  </h2>
                </div>

                <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line space-y-3 font-normal">
                  {sec.content}
                </div>

                {/* Warning Callout Box */}
                {sec.warning && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold mb-1">تنبيه هام للمستخدم:</div>
                      <div className="leading-relaxed">{sec.warning}</div>
                    </div>
                  </div>
                )}

                {/* Tips Callout Box */}
                {sec.tips && sec.tips.length > 0 && (
                  <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand">
                      <Info className="h-4 w-4" />
                      <span>إرشادات ونصائح مهنية سريعة:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      {sec.tips.map((tip, tIdx) => (
                        <li key={tIdx} className="leading-relaxed">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Code Snippet Box */}
                {sec.codeSnippet && (
                  <div className="rounded-2xl border border-border bg-card-subtle/80 overflow-hidden shadow-xs" dir="ltr">
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/70 border-b border-border text-xs text-muted-foreground font-mono">
                      <span>{sec.codeSnippet.language}</span>
                      <button
                        onClick={() => handleCopyCode(sec.codeSnippet!.code, sec.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedSnippet === sec.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>نسخ الكود</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
                      <code>{sec.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Bottom Next / Prev Navigation */}
          <div className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevArticle ? (
              <button
                onClick={() => {
                  setLocation(`/docs/${prevArticle.slug}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto p-4 rounded-2xl border border-border hover:border-brand/40 bg-card hover:bg-muted/40 transition-all text-right group flex items-center gap-3"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-brand transition-colors shrink-0" />
                <div>
                  <div className="text-[11px] text-muted-foreground">المقال السابق</div>
                  <div className="text-xs font-bold text-foreground group-hover:text-brand transition-colors">
                    {prevArticle.titleAr}
                  </div>
                </div>
              </button>
            ) : <div />}

            {nextArticle ? (
              <button
                onClick={() => {
                  setLocation(`/docs/${nextArticle.slug}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto p-4 rounded-2xl border border-border hover:border-brand/40 bg-card hover:bg-muted/40 transition-all text-left group flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-[11px] text-muted-foreground">المقال التالي</div>
                  <div className="text-xs font-bold text-foreground group-hover:text-brand transition-colors">
                    {nextArticle.titleAr}
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-brand transition-colors shrink-0" />
              </button>
            ) : <div />}
          </div>

          {/* Related Articles Cards */}
          {currentArticle.relatedSlugs && currentArticle.relatedSlugs.length > 0 && (
            <div className="pt-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                مقالات ذات صلة بهذا الموضوع:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentArticle.relatedSlugs.map(slug => {
                  const rel = getDocArticleBySlug(slug);
                  if (!rel) return null;
                  return (
                    <button
                      key={slug}
                      onClick={() => {
                        setLocation(`/docs/${rel.slug}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-3.5 rounded-xl border border-border hover:border-brand bg-card hover:bg-brand/5 text-right transition-all group shadow-xs"
                    >
                      <div className="text-xs font-bold text-foreground group-hover:text-brand transition-colors">
                        {rel.titleAr}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                        {rel.summaryAr}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ── COLUMN 3: Right "On this page" TOC ────────────────────────────── */}
        <aside className="hidden xl:block w-64 shrink-0 sticky top-32 h-[calc(100vh-8.5rem)] overflow-y-auto space-y-6">
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <div className="text-xs font-bold text-foreground pb-2 border-b border-border/60">
              في هذه الصفحة (Table of Contents)
            </div>

            <nav className="space-y-1 text-xs">
              {currentArticle.sections.map(sec => {
                const isSecActive = activeSectionId === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById(sec.id);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        setActiveSectionId(sec.id);
                      }
                    }}
                    className={`
                      block py-1.5 px-2.5 rounded-lg transition-all leading-snug
                      ${isSecActive 
                        ? 'font-bold text-brand bg-brand/10 border-r-2 border-brand' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }
                    `}
                  >
                    {sec.title}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Direct CTA Box */}
          <div className="p-4 rounded-2xl bg-card-subtle border border-border/80 text-xs space-y-3">
            <div className="font-bold text-foreground">روابط سريعة للمنصة:</div>
            <div className="space-y-2">
              <Link href="/website">
                <div className="flex items-center justify-between p-2 rounded-xl border border-border bg-card hover:border-brand cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  <span>بورتفوليو الأسنان</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand" />
                </div>
              </Link>
              <Link href="/cv">
                <div className="flex items-center justify-between p-2 rounded-xl border border-border bg-card hover:border-brand cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  <span>السيرة الذاتية (CV)</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand" />
                </div>
              </Link>
            </div>
          </div>
        </aside>

      </div>

      {/* ── Instant Zero-Network Search Modal ──────────────────────────────── */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Input row */}
            <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
              <Search className="h-5 w-5 text-brand shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن: رفع الحالات، الرابط، السيرة الذاتية، السيو، الترقية..."
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results list */}
            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-border/40">
              {searchQuery.trim() === '' ? (
                <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                  <div className="font-semibold text-foreground">البحث الفوري الشامل في كل أدلة ومقالات المنصة</div>
                  <p>اكتب أي كلمة للوصول الفوري بدون أي استهلاك للشبكة.</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                  <div className="font-bold text-foreground">لم يتم العثور على نتائج لـ "{searchQuery}"</div>
                  <p>جرب كلمات أخرى مثل: "صور"، "حالات"، "ترقية"، "رابط"، أو تواصل مع الدعم عبر واتساب.</p>
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setLocation(`/docs/${res.article.slug}${res.sectionId ? `#${res.sectionId}` : ''}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-right p-3 rounded-xl hover:bg-brand/10 transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground group-hover:text-brand transition-colors">
                        {res.article.titleAr}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                        {res.text}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0 mt-0.5 font-medium">
                      {res.article.categoryTitleAr}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>بحث محلي فوري فائق السرعة • {DOCS_ARTICLES.length} مقالات متكاملة</span>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono text-[10px]">ESC للإغلاق</kbd>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
