import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastTone;
  actionLabel?: string | null;
  onAction?: (() => void) | null;
}

interface VendorNotificationContextValue {
  toasts: ToastItem[];
  showToast: (
    message: string,
    type?: ToastTone,
    options?: { duration?: number; actionLabel?: string; onAction?: () => void },
  ) => string;
  dismissToast: (id: string) => void;
}

const VendorNotificationContext = createContext<VendorNotificationContextValue | undefined>(undefined);

const TONE_STYLES: Record<ToastTone, { bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  success: {
    bg: 'border-emerald-200 bg-emerald-50/95 text-emerald-950 shadow-emerald-900/10',
    icon: CheckCircle2,
  },
  error: {
    bg: 'border-rose-200 bg-rose-50/95 text-rose-950 shadow-rose-900/10',
    icon: AlertCircle,
  },
  warning: {
    bg: 'border-amber-200 bg-amber-50/95 text-amber-950 shadow-amber-900/10',
    icon: AlertTriangle,
  },
  info: {
    bg: 'border-violet-200 bg-violet-50/95 text-violet-950 shadow-violet-900/10',
    icon: Info,
  },
};

export function VendorNotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastTone = 'success',
      options: { duration?: number; actionLabel?: string; onAction?: () => void } = {},
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [
        ...prev.slice(-3),
        {
          id,
          message,
          type,
          actionLabel: options.actionLabel || null,
          onAction: options.onAction || null,
        },
      ]);
      const duration = options.duration ?? 4000;
      if (duration > 0 && typeof window !== 'undefined') {
        window.setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
      return id;
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  );

  return (
    <VendorNotificationContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-5 bottom-5 z-50 flex max-w-sm flex-col gap-2.5"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => {
            const style = TONE_STYLES[item.type] || TONE_STYLES.info;
            const Icon = style.icon;
            return (
              <motion.div
                key={item.id}
                role="alert"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md ${style.bg}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 leading-snug">{item.message}</span>
                {item.actionLabel && item.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      item.onAction?.();
                      dismissToast(item.id);
                    }}
                    className="rounded-md bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-xs transition hover:bg-white"
                  >
                    {item.actionLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismissToast(item.id)}
                  aria-label="Dismiss notification"
                  className="rounded-md p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </VendorNotificationContext.Provider>
  );
}

export function useVendorToast() {
  const ctx = useContext(VendorNotificationContext);
  if (!ctx) {
    throw new Error('useVendorToast must be used within VendorNotificationProvider');
  }
  return ctx;
}

