import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Globe, 
  FileText, 
  LayoutDashboard, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  MessageCircle, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import CONFIG from '../config';

interface HotmartSidebarProps {
  user: User | null;
  portfolioStatus?: string;
  casesCount?: number;
  caseLimit?: number;
  slug?: string;
  activeSection?: string;
  onSelectSection?: (section: any) => void;
}

export default function HotmartSidebar({
  user,
  portfolioStatus = 'draft',
  casesCount = 0,
  caseLimit = 3,
  slug,
  activeSection = 'overview',
  onSelectSection,
}: HotmartSidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfoliohubs_sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('portfoliohubs_sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const getStatusBadge = () => {
    if (portfolioStatus === 'approved' || portfolioStatus === 'published') {
      return {
        label: 'منشور',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      };
    }
    if (portfolioStatus === 'pending' || portfolioStatus === 'pending_review') {
      return {
        label: 'قيد المراجعة',
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        dot: 'bg-amber-500'
      };
    }
    return {
      label: 'مسودة',
      bg: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
      dot: 'bg-cyan-600'
    };
  };

  const badge = getStatusBadge();
  const isDashboard = location === '/dashboard';

  return (
    <aside 
      aria-label="القائمة الجانبية للتنقل"
      className={`relative flex flex-col shrink-0 border-l border-border bg-card transition-all duration-300 ease-in-out z-30 select-none ${
        isCollapsed ? 'w-16 sm:w-20' : 'w-full md:w-64 lg:w-72'
      }`}
    >
      {/* Collapse Toggle Button (Desktop/Tablet) */}
      <button
        onClick={toggleCollapse}
        aria-label={isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
        className="hidden md:flex absolute -left-3.5 top-6 z-40 h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-brand hover:border-brand transition-colors focus-visible:ring-2 focus-visible:ring-brand"
      >
        {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Sidebar Header: Service Switcher Context */}
      <div className="p-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-foreground leading-tight truncate">
                منصة PortfolioHubs
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                بوابة خدمات طب الأسنان
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Service 1: Portfolio */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <div className="px-3 pb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                الخدمة الأولى
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                {badge.label}
              </span>
            </div>
          )}

          <Link href="/dashboard">
            <div 
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                location === '/dashboard' && activeSection === 'overview'
                  ? 'bg-brand text-white shadow-xs font-semibold'
                  : 'text-foreground hover:bg-muted/70 font-medium'
              }`}
            >
              <Globe className={`h-5 w-5 shrink-0 ${location === '/dashboard' && activeSection === 'overview' ? 'text-white' : 'text-brand'}`} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">البورتفوليو الرقمي</div>
                  <div className="text-[11px] opacity-75 truncate">
                    {casesCount} من {caseLimit} حالات مستخدمة
                  </div>
                </div>
              )}
            </div>
          </Link>

          {isDashboard && onSelectSection && !isCollapsed && (
            <div className="pr-6 space-y-1 border-r-2 border-brand/20 mr-4 mt-1">
              <button
                onClick={() => onSelectSection('overview')}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeSection === 'overview' ? 'bg-brand/10 text-brand font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                • البيانات الأساسية والعيادة
              </button>
              <button
                onClick={() => onSelectSection('cases')}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  activeSection === 'cases' ? 'bg-brand/10 text-brand font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>• حالات الأسنان</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                  {casesCount}/{caseLimit}
                </span>
              </button>
              <button
                onClick={() => onSelectSection('skills')}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeSection === 'skills' ? 'bg-brand/10 text-brand font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                • المهارات المهنية
              </button>
              <button
                onClick={() => onSelectSection('timeline')}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeSection === 'timeline' ? 'bg-brand/10 text-brand font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                • السجل المهني والأكاديمي
              </button>
            </div>
          )}

          {slug && !isCollapsed && (
            <a
              href={`/dr/${slug.replace(/^dr-?/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-brand hover:bg-brand/5 transition-colors mr-2"
            >
              <span className="flex items-center gap-1.5 truncate">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                معاينة صفحة موقعك
              </span>
            </a>
          )}
        </div>

        {/* Service 2: Dental CV */}
        <div className="space-y-1.5 pt-2 border-t border-border/60">
          {!isCollapsed && (
            <div className="px-3 pb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                الخدمة الثانية
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                جاهز PDF
              </span>
            </div>
          )}

          <Link href="/cv">
            <div 
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                location === '/cv'
                  ? 'bg-brand text-white shadow-xs font-semibold'
                  : 'text-foreground hover:bg-muted/70 font-medium'
              }`}
            >
              <FileText className={`h-5 w-5 shrink-0 ${location === '/cv' ? 'text-white' : 'text-brand'}`} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">السيرة الذاتية (CV)</div>
                  <div className="text-[11px] opacity-75 truncate">
                    توليد وطباعة A4 معتمد
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Upgrade / WhatsApp Consultation Card */}
        {!isCollapsed && (
          <div className="mt-4 p-3.5 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 via-brand/10 to-transparent">
            <div className="flex items-center gap-2 mb-2 text-brand font-bold text-xs">
              <Sparkles className="h-4 w-4" />
              <span>ترقية الحالات غير المحدودة</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
              تحتاج لعرض أكثر من 3 حالات مهنية أو دومين خاص بعيادتك؟
            </p>
            <a
              href={`https://wa.me/201271476215?text=${encodeURIComponent(
                `مرحباً، أنا د. ${user?.displayName || 'طبيب الأسنان'}، أود الاستفسار عن باقة الحالات غير المحدودة والدومين المخصص في PortfolioHubs.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>تواصل مع الدعم عبر واتساب</span>
            </a>
          </div>
        )}
      </div>

      {/* Sidebar Footer: User Profile & Logout */}
      <div className="p-3 border-t border-border/80 bg-card-subtle/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs font-bold shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <UserIcon className="h-4 w-4" />
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <div className="text-xs font-bold text-foreground truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'د. طبيب أسنان'}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={() => signOut(auth)}
              title="تسجيل الخروج"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
