import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface CvAdGateProps {
  open: boolean;
  posterUrl?: string;
  durationSeconds?: number;
  onComplete: () => void;
}

export default function CvAdGate({
  open,
  posterUrl,
  durationSeconds = 5,
  onComplete,
}: CvAdGateProps) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (!open) {
      setRemaining(durationSeconds);
      return;
    }

    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          onComplete();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [durationSeconds, onComplete, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement before download"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-background shadow-2xl">
        {posterUrl ? (
          <img src={posterUrl} alt="Advertisement" className="max-h-[70vh] w-full object-contain" />
        ) : (
          <div className="flex min-h-64 items-center justify-center bg-muted px-6 text-center">
            <p className="text-lg font-semibold text-foreground">PortfolioHubs</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Download continues in {remaining} second{remaining === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Skip ad
          </button>
        </div>
      </div>
    </div>
  );
}
