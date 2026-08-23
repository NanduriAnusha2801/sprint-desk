import { useCallback } from 'react'
import { useToastStore, type ToastVariant } from '@/store/toastStore'

const AUTO_DISMISS_MS = 4000

export function useToast() {
  const toasts = useToastStore((s) => s.toasts)
  const show = useToastStore((s) => s.show)
  const dismiss = useToastStore((s) => s.dismiss)

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', title?: string) => {
      const id = show({ message, variant, title })
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
      return id
    },
    [show, dismiss],
  )

  return { toasts, toast, dismiss }
}
