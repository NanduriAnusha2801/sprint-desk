import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import type { ToastVariant } from '@/store/toastStore'
import { cn } from '@/lib/cn'

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
}

export function ToastViewport() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.variant]
        return (
          <div
            key={t.id}
            role="status"
            className="flex items-start gap-3 rounded-lg border border-border bg-surface-raised p-3 shadow-popover animate-slide-up"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', VARIANT_CLASSES[t.variant])} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {t.title && <p className="text-sm font-medium text-text-primary">{t.title}</p>}
              <p className="text-sm text-text-secondary">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 text-text-muted hover:text-text-primary"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
