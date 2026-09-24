declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function gtagEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, {
        timestamp: new Date().toISOString(),
        ...params,
      });
    } catch (e) {
      console.warn('Analytics event error:', e);
    }
  }
}

export function trackPageView(path: string, title?: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('config', 'G-EYE00L54C5', {
        page_path: path,
        page_title: title || document.title,
      });
    } catch (e) {
      console.warn('Analytics page tracking error:', e);
    }
  }
}
