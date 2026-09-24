import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { 
  ArrowRight, 
  Clock, 
  Tag, 
  User, 
  Share2, 
  Check, 
  BookOpen, 
  ChevronLeft,
  Sparkles,
  Calendar,
  Globe
} from 'lucide-react';
import Header from '../components/Header';
import { INITIAL_BLOG_ARTICLES, BlogArticle } from '../data/blogArticlesData';
import { parseMarkdownToHtmlString } from '../lib/markdownHelper';

export default function PublicArticle() {
  const [match, params] = useRoute('/blog/:slug');
  const [, setLocation] = useLocation();
  const slug = params?.slug || '';

  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const found = INITIAL_BLOG_ARTICLES.find(a => a.slug === slug);
    if (found) {
      setArticle(found);
    } else {
      setArticle(null);
    }

    // Attempt to fetch raw markdown file from /content/blog/:slug.md
    async function loadMarkdown() {
      setLoading(true);
      try {
        const res = await fetch(`/content/blog/${slug}.md`);
        if (res.ok) {
          const text = await res.text();
          setMarkdownContent(text);
        } else {
          // Fallback content from metadata if file not reachable directly
          if (found) {
            setMarkdownContent(`# ${found.title}\n\n${found.description}\n\n## 1. المقدمة والأهمية الطبية\n\nيعتبر **${found.keyword}** موضوعاً حيوياً ومحورياً في **${found.categoryAr}**...\n\n## 2. البرتكولات المهنية المعتمدة\n\n- التشخيص والدقة المهنية\n- الإجراء المحافظ والسلامة\n- المتابعة مع الطبيب المختص`);
          }
        }
      } catch (err) {
        console.warn('Could not fetch markdown file:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMarkdown();
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900" dir="rtl">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">المقال غير موجود</h2>
            <p className="text-slate-500 text-sm">قد يكون المقال قيد المراجعة أو تم نسق الرابط بشكل خاطئ.</p>
            <button
              onClick={() => setLocation('/blog')}
              className="mt-4 px-5 py-2.5 bg-cyan-800 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-cyan-900 transition"
            >
              العودة للمدونة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Related Articles
  const relatedArticles = INITIAL_BLOG_ARTICLES.filter(a => article.relatedSlugs.includes(a.slug)).slice(0, 3);

  const parsedHtml = parseMarkdownToHtmlString(markdownContent);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans" dir="rtl">
      <Header />

      {/* Breadcrumbs & Header Bar */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <button onClick={() => setLocation('/')} className="hover:text-cyan-800 transition">الرئيسية</button>
            <span>/</span>
            <button onClick={() => setLocation('/blog')} className="hover:text-cyan-800 transition">المدونة</button>
            <span>/</span>
            <span className="text-cyan-800 font-bold">{article.categoryAr}</span>
          </div>

          <button
            onClick={() => setLocation('/blog')}
            className="flex items-center gap-1 text-slate-700 hover:text-cyan-800 font-bold transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">العودة للمقالات</span>
          </button>
        </div>
      </div>

      {/* Main Article Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-10">
        <article className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Article Meta Bar */}
          <div className="space-y-4 border-b border-slate-100 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3.5 py-1.5 rounded-xl bg-cyan-100 text-cyan-900 text-xs font-black border border-cyan-200">
                {article.categoryAr}
              </span>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{article.readingTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{article.author}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug tracking-tight">
              {article.title}
            </h1>

            {/* Keyword Banner */}
            <div className="flex items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-800" />
                <span className="font-bold">الكلمة المفتاحية:</span>
                <span className="text-slate-900 font-extrabold">{article.keyword}</span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-cyan-800 font-bold hover:bg-cyan-100/50 px-2.5 py-1 rounded-lg transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'تم نسخ الرابط' : 'مشاركة المقال'}</span>
              </button>
            </div>
          </div>

          {/* Rendered Article Body */}
          <div 
            className="prose prose-slate max-w-none prose-headings:font-black prose-p:leading-relaxed prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
          />

          {/* Author Signature Box */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center gap-4 mt-10">
            <div className="w-12 h-12 bg-cyan-800 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900">محرر بواسطة: {article.author}</h4>
              <p className="text-slate-500">تم تدقيق وتوثيق هذا المقال بواسطة هيئة التحرير الطبية والأكاديمية في منصة PortfolioHubs لضمان الدقة والمصداقية العلمية.</p>
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="space-y-6 pt-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Sparkles className="w-5 h-5 text-cyan-800" />
              <h3 className="text-xl font-black text-slate-900">مقالات مترابطة موضوعياً</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map(rel => (
                <div
                  key={rel.slug}
                  onClick={() => {
                    setLocation(`/blog/${rel.slug}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-cyan-300 transition cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                      {rel.categoryAr}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>

                  <span className="text-xs text-cyan-800 font-bold flex items-center gap-1 pt-2">
                    <span>قراءة</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© PortfolioHubs - جميع الحقوق محفوظة للمحتوى الطبي التخصصي</p>
      </footer>
    </div>
  );
}
