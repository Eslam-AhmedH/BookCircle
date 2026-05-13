import {
  BookCopy,
  Bookmark,
  BookOpen,
  Compass,
  Home,
  LogOut,
  Plus,
  Settings,
  ShieldCheck,
  Shuffle,
  UserRound,
  Library,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthContext";
import { appRoutes, navPaths } from "../shared/config/routes";
import { cn } from "../shared/lib/cn";
import type { UserRole } from "../entities/user";

const FALLBACK_AVATAR = "https://picsum.photos/seed/defaultav/40/40";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const getNavItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case "Admin":
      return [
        { label: "My Books", path: navPaths.profile, icon: UserRound },
        { label: "Borrow Requests", path: navPaths.requests, icon: Shuffle },
        { label: "Admin Panel", path: navPaths.admin, icon: ShieldCheck },
        {
          label: "My Collection",
          path: navPaths.ownerDashboard,
          icon: Library,
        },
        { label: "Reading Lists", path: navPaths.readingList, icon: Bookmark }
      ];
    case "Owner":
      return [
        { label: "My Books", path: navPaths.profile, icon: UserRound },
        { label: "Borrow Requests", path: navPaths.requests, icon: Shuffle },
        {
          label: "My Collection",
          path: navPaths.ownerDashboard,
          icon: Library,
        },
      ];
    case "Reader":
    default:
      return [
        { label: "Home", path: navPaths.home, icon: Home },
        { label: "Reading Lists", path: navPaths.readingList, icon: Bookmark },
        { label: "My Borrows", path: navPaths.myBorrows, icon: BookOpen },
        { label: "Browse", path: navPaths.search, icon: Compass },
      ];
  }
};

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "Admin":
      return "Administrator";
    case "Owner":
      return "Book Owner";
    case "Reader":
      return "Reader";
    default:
      return "Member";
  }
};

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role: UserRole = user?.role ?? "Reader";
  const menuItems = getNavItems(role);
  const canAddBook = role === "Owner" || role === "Admin";

  const handleSettings = () => {
    navigate(navPaths.settings);
  };

  const handleLogout = () => {
    logout();
    navigate(appRoutes.login);
  };

  const handleAddBook = () => {
    navigate(navPaths.addBook);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-outline-variant/15 bg-surface-container-low pt-24 lg:flex">
      {/* User info */}
      <div className="mb-4 px-8 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
            <img
              src={user?.avatarUrl ?? FALLBACK_AVATAR}
              alt={user?.fullName ?? "User"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-on-surface">
              {user?.fullName ?? "Guest"}
            </p>
            <p className="truncate text-xs text-outline">{user?.email ?? ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full bg-primary-container/25 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            {getRoleLabel(role)}
          </span>
          {user?.isApproved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-fixed">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-fixed" />
              Approved
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-3 h-px bg-outline-variant/15" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                active
                  ? "bg-primary-container text-white shadow-ambient"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 my-3 h-px bg-outline-variant/15" />

      {/* Settings */}
      <div className="px-3">
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-all",
            location.pathname === navPaths.settings
              ? "bg-primary-container text-white shadow-ambient"
              : "text-white/60 hover:bg-white/5 hover:text-white",
          )}
          type="button"
          onClick={handleSettings}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          <span>Settings</span>
        </button>
      </div>

      {/* Bottom area */}
      <div className="mt-auto p-6">
        {canAddBook && (
          <button
            className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-container text-sm font-bold text-white shadow-ambient transition-transform active:scale-95 hover:opacity-90"
            onClick={handleAddBook}
            type="button"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Book</span>
          </button>
        )}

        {/* Logout */}
        <button
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-white/40 transition-all hover:bg-error/10 hover:text-error"
          type="button"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Log Out</span>
        </button>

        <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/25">
          <BookCopy className="h-3.5 w-3.5" />
          <span>BookCircle</span>
        </div>
      </div>
    </aside>
  );
};
