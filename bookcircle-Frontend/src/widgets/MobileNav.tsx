import {
  BookOpen,
  Compass,
  Home,
  User,
  Shuffle,
  ShieldCheck,
  BookMarked,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../app/providers/AuthContext";
import { navPaths } from "../shared/config/routes";
import { cn } from "../shared/lib/cn";
import type { UserRole } from "../entities/user";

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const getNavItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case "Admin":
      return [
        { key: "home", label: "Home", icon: Home, path: navPaths.home },
        {
          key: "admin",
          label: "Admin",
          icon: ShieldCheck,
          path: navPaths.admin,
        },
        {
          key: "search",
          label: "Search",
          icon: Compass,
          path: navPaths.search,
        },
        {
          key: "profile",
          label: "Profile",
          icon: User,
          path: navPaths.profile,
        },
      ];
    case "Owner":
      return [
        { key: "home", label: "Home", icon: Home, path: navPaths.home },
        {
          key: "requests",
          label: "Requests",
          icon: Shuffle,
          path: navPaths.requests,
        },
        {
          key: "search",
          label: "Search",
          icon: Compass,
          path: navPaths.search,
        },
        {
          key: "profile",
          label: "Profile",
          icon: User,
          path: navPaths.profile,
        },
      ];
    case "Reader":
    default:
      return [
        { key: "home", label: "Home", icon: Home, path: navPaths.home },
        {
          key: "library",
          label: "Library",
          icon: BookMarked,
          path: navPaths.readingList,
        },
        {
          key: "borrows",
          label: "Borrows",
          icon: BookOpen,
          path: navPaths.myBorrows,
        },
        {
          key: "search",
          label: "Search",
          icon: Compass,
          path: navPaths.search,
        },
        {
          key: "profile",
          label: "Profile",
          icon: User,
          path: navPaths.profile,
        },
      ];
  }
};

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const role: UserRole = user?.role ?? "Reader";
  const items = getNavItems(role);

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant/20 bg-surface-container-low/80 px-2 py-3 backdrop-blur-glass lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.path;

        return (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-1 transition-colors",
              active
                ? "text-primary"
                : "text-on-surface-variant/50 hover:text-on-surface-variant",
            )}
            type="button"
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center",
                active && "drop-shadow-[0_0_8px_rgba(210,187,255,0.6)]",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
