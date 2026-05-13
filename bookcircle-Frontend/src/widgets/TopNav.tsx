import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  X,
  CheckCircle,
  BookOpen,
  XCircle,
  MessageCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthContext";
import { useNotifications } from "../features/notifications/useNotifications";
import { notificationsService } from "../services";
import { navPaths, buildSearchPath } from "../shared/config/routes";
import { cn } from "../shared/lib/cn";
import type { Notification, NotificationType } from "../entities/notification";

const FALLBACK_AVATAR = "https://picsum.photos/seed/defaultav/40/40";

const getNotifIcon = (type: NotificationType) => {
  switch (type) {
    case "BorrowRequest":
      return <Bell className="h-4 w-4" />;
    case "BorrowAccepted":
      return <CheckCircle className="h-4 w-4" />;
    case "BorrowRejected":
      return <XCircle className="h-4 w-4" />;
    case "BookApproved":
      return <BookOpen className="h-4 w-4" />;
    case "BookRejected":
      return <BookOpen className="h-4 w-4" />;
    case "NewComment":
      return <MessageCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotifIconColor = (type: NotificationType): string => {
  switch (type) {
    case "BorrowAccepted":
    case "BookApproved":
      return "text-primary-fixed";
    case "BorrowRejected":
    case "BookRejected":
      return "text-error";
    case "NewComment":
      return "text-tertiary";
    default:
      return "text-primary";
  }
};

const formatShortTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

interface NotifDropdownItemProps {
  notification: Notification;
  onRead: (id: number) => void;
}

const NotifDropdownItem = ({
  notification,
  onRead,
}: NotifDropdownItemProps) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-high",
        !notification.isRead && "bg-primary/[0.04]",
      )}
    >
      {!notification.isRead && (
        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
      )}
      {notification.isRead && (
        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0" />
      )}

      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center",
          getNotifIconColor(notification.type),
        )}
      >
        {getNotifIcon(notification.type)}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "line-clamp-2 text-xs leading-relaxed",
            notification.isRead
              ? "text-on-surface-variant"
              : "font-semibold text-on-surface",
          )}
        >
          {notification.message}
        </p>
        <p className="mt-1 text-[10px] text-outline">
          {formatShortTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );
};

export const TopNav = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: notifData } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [localNotifs, setLocalNotifs] = useState<Notification[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notifData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalNotifs(notifData);
    }
  }, [notifData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotif = () => {
    setIsNotifOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (id: number) => {
    setLocalNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationsService.markAsRead(id);
    } catch {
      setLocalNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (!searchValue.trim()) return;
    navigate(buildSearchPath(searchValue.trim()));
    setSearchValue("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
  };

  const handleAvatarClick = () => {
    navigate(navPaths.profile);
  };

  const handleViewAllNotifs = () => {
    navigate(navPaths.notifications);
    setIsNotifOpen(false);
  };

  const displayUnreadCount = localNotifs.filter((n) => !n.isRead).length;
  const recentNotifs = [...localNotifs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <header className="fixed left-0 top-0 z-50 h-20 w-full bg-gradient-to-b from-surface-container-low/90 to-transparent px-4 backdrop-blur-glass md:px-6 lg:px-8">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-3 sm:gap-4 lg:gap-6">
        {/* Left: logo + categories */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-6 lg:gap-10">
          <Link
            to={navPaths.home}
            className="truncate text-xl font-black tracking-tight text-primary sm:text-2xl"
          >
            BookCircle
          </Link>
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate(navPaths.search)}
            className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white md:block"
          >
            Categories
          </button>
        </div>

        {/* Center: search */}
        <div className="hidden flex-1 px-6 lg:block">
          <div className="relative mx-auto max-w-2xl">
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              className="h-12 w-full rounded-full bg-surface-container-lowest pl-11 pr-10 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/60"
              placeholder="Search by title, author, or ISBN..."
              type="search"
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search books"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: bell + avatar */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Notification bell */}
          <div ref={notifRef} className="relative">
            <button
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              onClick={handleToggleNotif}
              type="button"
              aria-label="Open notifications"
              aria-expanded={isNotifOpen}
            >
              <Bell className="h-5 w-5" />
              {displayUnreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-surface">
                  {displayUnreadCount > 9 ? "9+" : displayUnreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {isNotifOpen && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low shadow-ambient sm:w-[360px]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/15 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-on-surface">
                      Notifications
                    </p>
                    {displayUnreadCount > 0 && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {displayUnreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(false)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface"
                    aria-label="Close notifications"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Items */}
                <div className="max-h-[320px] overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                      <Bell className="h-6 w-6 text-outline" />
                      <p className="text-sm text-on-surface-variant">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    recentNotifs.map((notif, index) => (
                      <div key={notif.id}>
                        <NotifDropdownItem
                          notification={notif}
                          onRead={handleMarkAsRead}
                        />
                        {index < recentNotifs.length - 1 && (
                          <div className="mx-4 h-px bg-outline-variant/10" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-outline-variant/15">
                  <button
                    type="button"
                    onClick={handleViewAllNotifs}
                    className="flex w-full items-center justify-center py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-container-high"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 transition-all hover:border-primary/50 hover:shadow-glow"
            aria-label="Go to profile"
          >
            <img
              className="h-full w-full object-cover"
              src={user?.avatarUrl ?? FALLBACK_AVATAR}
              alt={user?.fullName ?? "User profile"}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
