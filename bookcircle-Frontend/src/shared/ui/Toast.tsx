import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useToast } from '../../app/providers/ToastContext'
import { cn } from '../lib/cn'
import type { ToastType } from '../../app/providers/ToastContext'

const toastStyles: Record<ToastType, string> = {
  success: 'bg-surface-container-high border-green-600/30 text-green-400',
  error: 'bg-surface-container-high border-error/30 text-error',
  info: 'bg-surface-container-high border-primary/30 text-primary',
}

const ToastIcon = ({ type }: { type: ToastType }) => {
  if (type === 'success') return <CheckCircle className="h-4 w-4 flex-shrink-0" />
  if (type === 'error') return <AlertCircle className="h-4 w-4 flex-shrink-0" />
  return <Info className="h-4 w-4 flex-shrink-0" />
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (!toasts.length) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex max-w-sm flex-col gap-3"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-soft',
            toastStyles[toast.type],
          )}
          role="alert"
        >
          <ToastIcon type={toast.type} />
          <p className="flex-1 text-sm font-medium text-on-surface">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="mt-0.5 opacity-50 transition-opacity hover:opacity-100"
            aria-label="Dismiss notification"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
