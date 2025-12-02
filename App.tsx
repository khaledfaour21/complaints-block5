import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { DashboardSelect } from "./components/DashboardSelect";
import { Tracking } from "./components/Tracking";
import { SubmitComplaintEnhanced } from "./components/submit/SubmitComplaintEnhanced";
import { SubmitSuccess } from "./components/submit/SubmitSuccess";
import { PublicAnnouncements } from "./components/announcements/PublicAnnouncements";
import { PublicAchievements } from "./components/achievements/PublicAchievements";
import { AchievementDetail } from "./components/achievements/AchievementDetail";
import { AchievementsAdminPanel } from "./components/achievements/AchievementsAdminPanel";
import { AnnouncementDetail } from "./components/announcements/AnnouncementDetail";
import { AnnouncementsAdminPanel } from "./components/announcements/AnnouncementsAdminPanel";
import { AdminDashboard } from "./components/dashboards/AdminDashboard";
import { MuktarDashboard } from "./components/dashboards/MuktarDashboard";
import { ManagerDashboard } from "./components/dashboards/ManagerDashboard";
import { MuktarDetails } from "./components/dashboards/MuktarDetails";
import { ComplaintDetail } from "./components/shared/ComplaintDetail";
import { Profile } from "./components/user/Profile";
import { Settings } from "./components/user/Settings";
import { ChangePassword } from "./components/user/ChangePassword";
import { UserDetail } from "./components/user/UserDetail";
import { UserComplaints } from "./components/user/UserComplaints";
import { UserManagement } from "./components/user/UserManagement";
import { NotificationsCenter } from "./components/notifications/NotificationsCenter";
import { NotFound } from "./components/errors/NotFound";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";
import { OfflinePage } from "./components/pwa/OfflinePage";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { UnifiedContentManagement } from "./components/shared/UnifiedContentManagement";
import { Role } from "./types";
import { useLangStore } from "./store";
import { ComplaintsDataProvider } from "./context/ComplaintsDataContext";

const App: React.FC = () => {
  const { lang } = useLangStore();

  useEffect(() => {
    document.title =
      lang === "ar"
        ? "الحي الخامس | نظام إدارة الشكاوى"
        : "Fifth Block | Complaint Management System";
  }, [lang]);

  return (
    <ErrorBoundary>
      <ComplaintsDataProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/submit" element={<SubmitComplaintEnhanced />} />
            <Route path="/submit/success" element={<SubmitSuccess />} />
            <Route path="/track" element={<Tracking />} />
            <Route path="/achievements" element={<PublicAchievements />} />
            <Route path="/achievements/:id" element={<AchievementDetail />} />
            <Route path="/announcements" element={<PublicAnnouncements />} />
            <Route path="/announcements/:id" element={<AnnouncementDetail />} />
            <Route path="/complaint/:id" element={<ComplaintDetail />} />
            <Route path="/offline" element={<OfflinePage />} />

            {/* Dashboard Selection */}
            <Route path="/dashboard-select" element={<DashboardSelect />} />

            {/* Protected Routes - General User */}
            {/* <Route element={<ProtectedRoute />}> */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/notifications" element={<NotificationsCenter />} />
            {/* </Route> */}

            {/* Role Specific Routes */}
            {/* <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}> */}
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            {/* </Route> */}

            {/* <Route element={<ProtectedRoute allowedRoles={[Role.MUKTAR]} />}> */}
            <Route path="/dashboard/muktar" element={<MuktarDashboard />} />
            {/* </Route> */}

            {/* <Route element={<ProtectedRoute allowedRoles={[Role.MANAGER]} />}> */}
            <Route path="/dashboard/manager" element={<ManagerDashboard />} />
            <Route path="/dashboard/muktar/:id" element={<MuktarDetails />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/user/:id" element={<UserDetail />} />
            <Route path="/user/:id/complaints" element={<UserComplaints />} />
            {/* </Route> */}

            {/* <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]} />}> */}
            <Route
              path="/achievements/admin"
              element={<AchievementsAdminPanel />}
            />
            <Route
              path="/announcements/admin"
              element={<AnnouncementsAdminPanel />}
            />
            <Route path="/content" element={<UnifiedContentManagement />} />
            {/* </Route> */}

            {/* Errors */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </ComplaintsDataProvider>
    </ErrorBoundary>
  );
};

export default App;
