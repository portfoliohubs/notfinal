import React from 'react';
import { X, Sparkles, MessageCircle, Check, Crown } from 'lucide-react';
import CONFIG from '../config';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  currentCount?: number;
  limit?: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  doctorName = '',
  currentCount = 3,
  limit = CONFIG.tierLimits.freeCases,
}) => {
  if (!isOpen) return null;

  const handleWhatsAppUpgrade = () => {
    const phone = CONFIG.tierLimits.upgradeWhatsAppNumber;
    const msg = encodeURIComponent(CONFIG.tierLimits.buildUpgradeMessage(doctorName));
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner (Hotmart Style with Brand Cyan) */}
        <div className="bg-gradient-to-l from-brand to-brand-dark px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute left-4 top-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold mb-2 backdrop-blur-xs">
            <Crown className="h-3.5 w-3.5 text-amber-300" />
            <span>الباقة الاحترافية غير المحدودة</span>
          </div>
          <h3 className="text-xl font-black">وصلت إلى الحد الأقصى للحالات المجانية</h3>
          <p className="text-white/85 text-xs mt-1">
            لقد استهلكت سعة باقتك الحالية ({currentCount} من {limit} حالات).
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80">
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand" />
              <span>ماذا ستحصل عليه فور الترقية؟</span>
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span><strong>حالات مهنية غير محدودة</strong> مع صور قبل وبعد فائقة الوضوح.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span><strong>أولوية التوليد والأرشفة السريعة</strong> في محرك بحث Google وذكاء ChatGPT.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span><strong>دومين احترافي ورابط مخصص</strong> باسمك على منصة أطباء الأسنان.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleWhatsAppUpgrade}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>تواصل للترقية الفورية عبر واتساب</span>
            </button>
            <p className="text-[11px] text-center text-muted-foreground">
              سيتم فتح محادثة مباشرة مع خدمة العملاء بالرسالة الرسمية المرمزة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
