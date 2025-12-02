import React from "react";
import { useAuthStore, useLangStore } from "../store";
import { Role } from "../types";
import { MuktarDashboard } from "./dashboards/MuktarDashboard";
import { ManagerDashboard } from "./dashboards/ManagerDashboard";
import { AdminDashboard } from "./dashboards/AdminDashboard";

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLangStore();

  if (!user)
    return <div className="p-10 text-center">{t("auth.please_login")}</div>;

  // Render sub-dashboard based on role
  const renderContent = () => {
    switch (user.role) {
      case Role.CITIZEN:
        return (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-brand-accent/20 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-primary mb-4">
              {t("citizen.welcome_title").replace("{name}", user.name)}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {t("citizen.description")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/submit" className="btn btn-primary">
                {t("citizen.submit_complaint")}
              </a>
              <a href="/track" className="btn btn-outline">
                {t("citizen.track_complaints")}
              </a>
              <a href="/achievements" className="btn btn-outline">
                {t("citizen.view_achievements")}
              </a>
            </div>
          </div>
        );
      case Role.MUKTAR:
        return <MuktarDashboard />;
      case Role.MANAGER:
        return <ManagerDashboard />;
      case Role.ADMIN:
        return <AdminDashboard />;
      default:
        return <div>{t("auth.unknown_role")}</div>;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Common Header */}
      <div className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-accent font-cairo">
          {t("dash.welcome")} {user.name}
        </h1>
        <p className="text-sm uppercase tracking-widest font-semibold opacity-60 mt-1">
          {user.role} {t("auth.access_level")}
        </p>
      </div>

      {renderContent()}
    </div>
  );
};
