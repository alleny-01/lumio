import { useEffect, useState } from "react";
import { Quote, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DashboardQuote } from "../types";

interface DailyQuoteModalProps {
  quote: DashboardQuote;
}

export function DailyQuoteModal({ quote }: DailyQuoteModalProps) {
  const [isOpen, setIsOpen] = useState(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `lumio_daily_quote_seen_${todayKey}`;
    return !sessionStorage.getItem(storageKey);
  });

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `lumio_daily_quote_seen_${todayKey}`;
    const timerId = window.setTimeout(() => {
      setIsOpen(!sessionStorage.getItem(storageKey));
    }, 0);
    return () => window.clearTimeout(timerId);
  }, []);

  const handleClose = () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `lumio_daily_quote_seen_${todayKey}`;
    sessionStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-sm border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-primary-container/20 blur-2xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Quote className="size-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
              Quote of the Day
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close quote modal"
            className="inline-flex size-8 items-center justify-center rounded-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative z-10 mt-5 space-y-3">
          <p className="text-[14px] font-light italic leading-relaxed text-on-surface sm:text-[15px]">
            &quot;{quote.content}&quot;
          </p>

          <p className="text-right text-[12px] font-medium text-primary">
            — {quote.author}
          </p>
        </div>

        <div className="relative z-10 mt-6 flex justify-end">
          <Button
            type="button"
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleClose}
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
