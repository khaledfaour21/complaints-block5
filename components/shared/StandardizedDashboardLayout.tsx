import React, { useState } from "react";
import { useAuthStore, useLangStore } from "../../store";
import { Role, Complaint, Importance } from "../../types";
import { Link } from "react-router-dom";
import { EnhancedComplaintsView } from "./EnhancedComplaintsView";
import { NotificationCenter } from "./NotificationCenter";
import { UnifiedContentManagement } from "./UnifiedContentManagement";
import {
  ChartBarIcon,
  TrophyIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  highImportance: number;
  mediumImportance: number;
  lowImportance: number;
}

interface StandardizedDashboardLayoutProps {
  title: string;
  subtitle?: string;
  stats: DashboardStats;
  userRole: Role;
  showContentManagement?: boolean;
  children?: React.ReactNode;
}

export const StandardizedDashboardLayout: React.FC<
  StandardizedDashboardLayoutProps
> = ({
  title,
  subtitle,
  stats,
  userRole,
  showContentManagement = false,
  children,
}) => {
  const { user } = useAuthStore();
  const { t } = useLangStore();
  const [activeTab, setActiveTab] = useState<
    "summary" | "complaints" | "content"
  >("summary");

  // Filter complaints by importance level (all roles see all importance levels)
  const getImportanceFilter = () => {
    switch (userRole) {
      case Role.MANAGER:
        return "all"; // Managers see all importance levels for oversight
      case Role.ADMIN:
        return "all"; // Admins see all importance levels for management
      case Role.MUKTAR:
        return "all"; // Mukhtars see all importance levels in their district
      default:
        return "all";
    }
  };

  const importanceFilter = getImportanceFilter();

  // Get role-specific navigation items
  const getContentManagementPath = () => {
    return "/content";
  };

  // Chart data preparation
  const statusChartData = [
    { name: "Pending", value: stats.pending, color: "#ef4444" },
    { name: "In Progress", value: stats.inProgress, color: "#f59e0b" },
    { name: "Completed", value: stats.completed, color: "#10b981" },
  ];

  const importanceChartData = [
    { name: "High", value: stats.highImportance, color: "#ff4d4d" },
    { name: "Medium", value: stats.mediumImportance, color: "#ff9933" },
    { name: "Low", value: stats.lowImportance, color: "#32cd32" },
  ];

  // Get role-based dashboard route for quick access
  const getQuickAccessRoutes = () => {
    const routes = [];

    if (userRole === Role.MANAGER) {
      routes.push(
        {
          path: "/dashboard/admin",
          label: t("nav.admin_dashboard"),
          icon: ChartBarIcon,
        },
        {
          path: "/dashboard/muktar",
          label: t("nav.muktar_dashboard"),
          icon: ExclamationTriangleIcon,
        }
      );
    } else if (userRole === Role.ADMIN) {
      routes.push({
        path: "/dashboard/muktar",
        label: t("nav.muktar_dashboard"),
        icon: ExclamationTriangleIcon,
      });
    }

    return routes;
  };

  const quickAccessRoutes = getQuickAccessRoutes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary font-cairo">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Content Management Link (for Admin & Manager only) */}
          {showContentManagement &&
            (userRole === Role.ADMIN || userRole === Role.MANAGER) && (
              <Link
                to={getContentManagementPath()}
                className="btn btn-outline gap-2"
              >
                <TrophyIcon className="w-5 h-5" />
                {t("dashboard.manage_content")}
              </Link>
            )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div role="tablist" className="tabs tabs-boxed bg-base-200 p-1">
        <a
          role="tab"
          className={`tab ${activeTab === "summary" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          <ChartBarIcon className="w-4 h-4 mr-2" />
          {t("dashboard.summary")}
        </a>
        <a
          role="tab"
          className={`tab ${activeTab === "complaints" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("complaints")}
        >
          <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
          {t("dashboard.complaints")}
        </a>
        {showContentManagement &&
          (userRole === Role.ADMIN || userRole === Role.MANAGER) && (
            <a
              role="tab"
              className={`tab ${activeTab === "content" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("content")}
            >
              <TrophyIcon className="w-4 h-4 mr-2" />
              {t("dashboard.content")}
            </a>
          )}
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === "summary" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="card bg-base-100 shadow-xl border-l-4 border-brand-primary">
                <div className="card-body items-center text-center p-4">
                  <ChartBarIcon className="w-8 h-8 text-brand-primary mb-2" />
                  <div className="stat-value text-2xl text-brand-primary">
                    {stats.total}
                  </div>
                  <div className="stat-title text-xs">
                    {t("dashboard.total")}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border-l-4 border-red-500">
                <div className="card-body items-center text-center p-4">
                  <ClockIcon className="w-8 h-8 text-red-500 mb-2" />
                  <div className="stat-value text-2xl text-red-500">
                    {stats.pending}
                  </div>
                  <div className="stat-title text-xs">
                    {t("dashboard.pending")}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border-l-4 border-yellow-500">
                <div className="card-body items-center text-center p-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 mb-2" />
                  <div className="stat-value text-2xl text-yellow-500">
                    {stats.inProgress}
                  </div>
                  <div className="stat-title text-xs">
                    {t("dashboard.in_progress")}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border-l-4 border-green-500">
                <div className="card-body items-center text-center p-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-500 mb-2" />
                  <div className="stat-value text-2xl text-green-500">
                    {stats.completed}
                  </div>
                  <div className="stat-title text-xs">
                    {t("dashboard.completed")}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border-l-4 border-orange-500">
                <div className="card-body items-center text-center p-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-orange-500 mb-2" />
                  <div className="stat-value text-2xl text-orange-500">
                    {stats.highImportance}
                  </div>
                  <div className="stat-title text-xs">
                    {t("dashboard.high_priority")}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border-l-4 border-blue-500">
                <div className="card-body items-center text-center p-4">
                  <ClockIcon className="w-8 h-8 text-blue-500 mb-2" />
                  <div className="stat-value text-2xl text-blue-500">
                    {stats.total > 0
                      ? Math.round((stats.completed / stats.total) * 100)
                      : 0}
                    %
                  </div>
                  <div className="stat-title text-xs">
                    {t("dashboard.resolution_rate")}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Routes */}
            {quickAccessRoutes.length > 0 && (
              <div className="card bg-gradient-to-r from-brand-lightBg to-white dark:from-[#1a1a1a] dark:to-[#2a2a2a] shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-brand-primary mb-4">
                    {t("dashboard.quick_access")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickAccessRoutes.map((route) => {
                      const IconComponent = route.icon;
                      return (
                        <Link
                          key={route.path}
                          to={route.path}
                          className="btn btn-outline gap-3 justify-start hover:shadow-lg transition-all"
                        >
                          <IconComponent className="w-5 h-5" />
                          {route.label}
                          <ArrowRightIcon className="w-4 h-4 ml-auto" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Content Area */}
            {children}
          </div>
        )}

        {activeTab === "complaints" && (
          <div>
            <EnhancedComplaintsView
              userRole={userRole}
              showAssignedRole={true}
              title={`${title} - Complaints Management`}
            />
          </div>
        )}

        {activeTab === "content" &&
          showContentManagement &&
          (userRole === Role.ADMIN || userRole === Role.MANAGER) && (
            <div>
              <UnifiedContentManagement />
            </div>
          )}
      </div>
    </div>
  );
};
