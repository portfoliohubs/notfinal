import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';
import { gtagEvent } from '../lib/gtag';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC<{ variant?: 'header' | 'banner' | 'button' }> = ({ variant = 'header' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect iOS Safari
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (navigator as any).standalone;
    if (isIos && !isStandalone) {
      // iOS Safari detected
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      gtagEvent('pwa_install_prompt_click', { source: variant });
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        gtagEvent('pwa_installed_success', { source: variant });
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for iOS or already installed or browser menu
      setShowIosPrompt(true);
    }
  };

  if (isInstalled) return null;

  if (variant === 'button' || variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold transition-all border border-brand/20 cursor-pointer"
          title="تثبيت التطبيق على جهازك للوصول السريع"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>تثبيت التطبيق</span>
        </button>

        {showIosPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowIosPrompt(false)}>
            <div className="bg-card text-card-foreground border border-border p-5 rounded-2xl max-w-sm w-full space-y-3 shadow-xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Download className="h-4 w-4 text-brand" />
                <span>تثبيت PortfolioHubs على هاتفك</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                لتثبيت التطبيق على جهازك والوصول إليه بضغطة زر دون الحاجة لمتجر التطبيقات:
              </p>
              <div className="text-xs space-y-2 bg-muted/40 p-3 rounded-xl border border-border/50 text-foreground">
                <p>1. اضغط على أيقونة <strong>المشاركة (Share)</strong> أسفل أو أعلى المتصفح.</p>
                <p>2. اختر <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.</p>
                <p>3. اضغط <strong>"إضافة" (Add)</strong>.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowIosPrompt(false)}
                className="w-full py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand/90 transition-colors"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
