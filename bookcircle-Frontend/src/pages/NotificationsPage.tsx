import { useState, useEffect } from "react"
import {
  Bell,
  CheckCircle,
  XCircle,
  BookOpen,
  CheckCheck,
  MessageCircle,
} from "lucide-react"
import { useNotifications } from "../features/notifications/useNotifications"
import { notificationsService } from "../services"
import { useToast } from "../app/providers/ToastContext"
import { EmptyState } from "../shared/ui/EmptyState"
import { ErrorState } from "../shared/ui/ErrorState"
import { SectionHeader } from "../shared/ui/SectionHeader"
import { SkeletonRow } from "../shared/ui/SkeletonCard"
import { Button } from "../shared/ui/Button"
import { cn } from "../shared/lib/cn"
import type { Notification, NotificationType } from "../entities/notification"

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "BorrowRequest":
      return <Bell className="h-5 w-5" />
    case "BorrowAccepted":
      return <CheckCircle className="h-5 w-5" />
    case "BorrowRejected":
      return <XCircle className="h-5 w-5" />
    case "BookApproved":
      return <BookOpen className="h-5 w-5" />
    case "BookRejected":
      return <BookOpen className="h-5 w-5" />
    case "NewComment":
      return <MessageCircle className="h-5 w-5" />
    default:
      return <Bell className="h-5 w-5" />
  }
}

const getIconColorClass = (type: NotificationType): string => {
  switch (type) {
    case "BorrowRequest":
      return "bg-primary/10 text-primary"
    case "BorrowAccepted":
      return "bg-primary-fixed/10 text-primary-fixed"
    case "BorrowRejected":
      return "bg-error/10 text-error"
    case "BookApproved":
      return "bg-primary-fixed/10 text-primary-fixed"
    case "BookRejected":
      return "bg-error/10 text-error"
    case "NewComment":
      return "bg-tertiary/10 text-tertiary"
    default:
      return "bg-primary/10 text-primary"
  }
}

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const isToday = (dateStr: string): boolean => {
  const date = new Date(dateStr)
  const now = new Date()
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: number) => void
}

const NotificationItem = ({
  notification,
  onMarkAsRead,
}: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-start gap-4 px-6 py-4 transition-all duration-200 hover:bg-surface-container-high",
        !notification.isRead && "bg-primary/[0.04]",
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={notification.message}
    >
      {!notification.isRead && (
        <span className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
      )}

      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
          getIconColorClass(notification.type),
        )}
      >
        {getNotificationIcon(notification.type)}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-relaxed",
            notification.isRead
              ? "text-on-surface-variant"
              : "font-semibold text-on-surface",
          )}
        >
          {notification.message}
        </p>
        <p 
          className="mt-1 flex items-center gap-1.5 text-xs text-outline"
          title={new Date(notification.createdAt).toLocaleString()}
        >
          <span>{formatRelativeTime(notification.createdAt)}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-outline/50" />
          <span>{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </p>
      </div>

      {!notification.isRead && (
        <span className="flex-shrink-0 self-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
          New
        </span>
      )}
    </div>
  )
}

interface NotificationGroupProps {
  label: string
  items: Notification[]
  onMarkAsRead: (id: number) => void
}

const NotificationGroup = ({
  label,
  items,
  onMarkAsRead,
}: NotificationGroupProps) => {
  if (items.length === 0) return null

  return (
    <section>
      <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
        {label}
      </p>
      <div className="overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-low">
        {items.map((notification, index) => (
          <div key={notification.id}>
            <NotificationItem
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
            {index < items.length - 1 && (
              <div className="mx-5 h-px bg-outline-variant/10" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export const NotificationsPage = () => {
  const { data, isLoading, error, refetch } = useNotifications()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  useEffect(() => {
    if (data) {
      setNotifications(data)
    }
  }, [data])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    )
    try {
      await notificationsService.markAsRead(id)
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      )
      showToast("Failed to mark notification as read.", "error")
    }
  }

  const handleMarkAllAsRead = async () => {
    if (isMarkingAll) return
    setIsMarkingAll(true)
    const snapshot = [...notifications]
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try {
      await notificationsService.markAllAsRead()
      showToast("All notifications marked as read.", "success")
    } catch {
      setNotifications(snapshot)
      showToast("Failed to mark all as read. Please try again.", "error")
    } finally {
      setIsMarkingAll(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="mb-10 h-24 animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    )
  }

  const sorted = [...notifications].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const todayItems = sorted.filter((n) => isToday(n.createdAt))
  const earlierItems = sorted.filter((n) => !isToday(n.createdAt))

  return (
    <div className="py-8">
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          label="Inbox"
          title="Notifications"
          description="Stay up to date with your borrow requests, book updates, and activity."
        />
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="md"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="flex-shrink-0"
          >
            <CheckCheck className="h-4 w-4" />
            {isMarkingAll ? "Marking…" : `Mark all as read (${unreadCount})`}
          </Button>
        )}
      </header>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-7 w-7 text-primary" />}
          title="No notifications yet"
          description="You're all caught up! Notifications about borrows, approvals, and comments will appear here."
        />
      ) : (
        <div className="space-y-6">
          <NotificationGroup
            label="Today"
            items={todayItems}
            onMarkAsRead={handleMarkAsRead}
          />
          <NotificationGroup
            label="Earlier"
            items={earlierItems}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      )}
    </div>
  )
}
