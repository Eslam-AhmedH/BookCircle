import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center py-20 text-center',
      className,
    )}
  >
    {icon && (
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high text-3xl">
        {icon}
      </div>
    )}
    <h3 className="mb-2 text-lg font-bold text-on-surface">{title}</h3>
    {description && (
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-on-surface-variant">
        {description}
      </p>
    )}
    {action}
  </div>
)
