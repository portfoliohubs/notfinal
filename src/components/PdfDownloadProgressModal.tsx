import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface PdfDownloadProgressProps {
  isOpen: boolean;
  progress: number; // 0 - 100
  stageText: string;
  estimatedSecondsLeft: number;
}

export default function PdfDownloadProgressModal({
  isOpen,
  progress,
  stageText,
  estimatedSecondsLeft,
}: PdfDownloadProgressProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const isComplete = progress >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-progress-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
        dir="rtl"
      >
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 animate-in zoom-in-75 duration-200" />
            ) : (
              <FileText className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div>
            <h3 id="pdf-progress-title" className="text-lg font-bold text-foreground flex items-center gap-1.5">
              {isComplete ? 'تم تجهيز ملف السيرة الذاتية بنجاح!' : 'جارٍ معالجة وتوليد الـ CV'}
              {!isComplete && <span className="inline-block w-4 text-primary text-right">{dots}</span>}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isComplete
                ? 'يبدأ التحميل التلقائي لملف الـ PDF الآن...'
                : 'يتم بناء الصفحات وضبط الصور بدقة طباعة عالية A4'}
            </p>
          </div>
        </div>

        {/* Progress percentage & time */}
        <div className="mb-2 flex items-center justify-between text-xs font-semibold">
          <span className="text-primary flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" />
            {stageText}
          </span>
          <span className="text-foreground tabular-nums font-bold text-sm">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-3.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border/80">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              isComplete
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-primary via-primary/90 to-cyan-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
          >
            {/* Shimmer animation */}
            {!isComplete && (
              <div className="w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_1.5s_infinite]" />
            )}
          </div>
        </div>

        {/* Estimated Time Remaining & Hints */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {!isComplete ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                <span>الوقت التقديري المتبقي:</span>
                <strong className="text-foreground font-bold tabular-nums">
                  {estimatedSecondsLeft > 0 ? `${estimatedSecondsLeft} ثوانٍ` : 'لحظات معدودة...'}
                </strong>
              </>
            ) : (
              <span className="text-green-600 dark:text-green-400 font-medium">
                تم تنزيل الـ PDF في جهازك!
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">
            PortfolioHubs PDF Engine
          </span>
        </div>
      </div>
    </div>
  );
}
