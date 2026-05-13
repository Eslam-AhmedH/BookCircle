import { AlertTriangle } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState = ({
  message = 'Something went wrong.',
  onRetry,
  className,
}: ErrorStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 text-center',
        className,
      )}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10">
        <AlertTriangle className="h-8 w-8 text-error" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-on-surface">
        Something went wrong
      </h3>
      <p className="mb-6 max-w-sm text-sm text-on-surface-variant">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
