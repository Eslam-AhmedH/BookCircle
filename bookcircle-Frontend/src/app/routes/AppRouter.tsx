import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { GuestLayout } from "../layouts/GuestLayout";
import { appRoutes } from "../../shared/config/routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

import { LoginPage } from "../../pages/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage";
import { PendingApprovalPage } from "../../pages/PendingApprovalPage";
import { HomePage } from "../../pages/HomePage";
import { BookDetailPage } from "../../pages/BookDetailPage";
import { SearchPage } from "../../pages/SearchPage";
import { ProfilePage } from "../../pages/ProfilePage";
import { NotificationsPage } from "../../pages/NotificationsPage";
import { SettingsPage } from "../../pages/SettingsPage";
import { AddBookPage } from "../../pages/AddBookPage";
import { EditBookPage } from "../../pages/EditBookPage";
import { RequestsPage } from "../../pages/RequestsPage";
import { OwnerDashboardPage } from "../../pages/OwnerDashboardPage";
import { ReadingListPage } from "../../pages/ReadingListPage";
import { MyBorrowsPage } from "../../pages/MyBorrowsPage";
import { AdminPage } from "../../pages/AdminPage";
import { ForbiddenPage } from "../../pages/ForbiddenPage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { GuestBrowsePage } from "../../pages/GuestBrowsePage";
import { GuestBookDetailPage } from "../../pages/GuestBookDetailPage";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={appRoutes.login} element={<LoginPage />} />
          <Route path={appRoutes.register} element={<RegisterPage />} />
          <Route
            path={appRoutes.pendingApproval}
            element={<PendingApprovalPage />}
          />
        </Route>

        <Route element={<GuestLayout />}>
          <Route path={appRoutes.guestBooks} element={<GuestBrowsePage />} />
          <Route
            path={appRoutes.guestBookDetail}
            element={<GuestBookDetailPage />}
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={appRoutes.home} element={<HomePage />} />
            <Route path={appRoutes.bookDetail} element={<BookDetailPage />} />
            <Route path={appRoutes.search} element={<SearchPage />} />
            <Route path={appRoutes.profile} element={<ProfilePage />} />
            <Route
              path={appRoutes.notifications}
              element={<NotificationsPage />}
            />
            <Route path={appRoutes.settings} element={<SettingsPage />} />

            <Route element={<RoleRoute allowedRoles={["Owner", "Admin"]} />}>
              <Route path={appRoutes.addBook} element={<AddBookPage />} />
              <Route path={appRoutes.editBook} element={<EditBookPage />} />
              <Route path={appRoutes.requests} element={<RequestsPage />} />
              <Route
                path={appRoutes.ownerDashboard}
                element={<OwnerDashboardPage />}
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={["Reader", "Admin"]} />}>
              <Route
                path={appRoutes.readingList}
                element={<ReadingListPage />}
              />
              <Route path={appRoutes.myBorrows} element={<MyBorrowsPage />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
              <Route path={appRoutes.admin} element={<AdminPage />} />
            </Route>
          </Route>
        </Route>

        <Route path={appRoutes.forbidden} element={<ForbiddenPage />} />
        <Route path={appRoutes.notFound} element={<NotFoundPage />} />
        <Route
          path="*"
          element={<Navigate to={appRoutes.notFound} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};
