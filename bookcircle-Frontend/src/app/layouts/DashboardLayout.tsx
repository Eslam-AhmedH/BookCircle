import { Outlet } from "react-router-dom";
import { MobileNav } from "../../widgets/MobileNav";
import { Sidebar } from "../../widgets/Sidebar";
import { TopNav } from "../../widgets/TopNav";
import { useSocketConnection, useSocketEvent } from "../../features/socket/useSocket";
import { useToast } from "../providers/ToastContext";

export const DashboardLayout = () => {
  useSocketConnection();
  const { showToast } = useToast();

  // Listen for real-time notifications globally across the dashboard
  useSocketEvent("notification_new", (payload: any) => {
    // Show an in-app toast for the notification
    if (payload && payload.message) {
      showToast(payload.message, "info");
    }
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <TopNav />
      <Sidebar />
      <main className="pb-24 pt-20 lg:pb-8 lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
