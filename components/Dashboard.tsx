
import React from 'react';
import { useAuthStore, useLangStore } from '../store';
import { Role } from '../types';
import { MuktarDashboard } from './dashboards/MuktarDashboard';
import { ManagerDashboard } from './dashboards/ManagerDashboard';
import { Announcements } from './Announcements';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLangStore();

  if (!user) return <div className="p-10 text-center">Please login to view dashboard.</div>;

  // Render sub-dashboard based on role
  const renderContent = () => {
    switch (user.role) {
        case Role.MUKTAR:
            return <MuktarDashboard />;
        case Role.MANAGER:
            return <ManagerDashboard />;
        case Role.ADMIN:
            return (
                <div className="space-y-10">
                    <div className="alert alert-success shadow-lg">
                        <div>
                            <h3 className="font-bold">Admin Dashboard</h3>
                            <div className="text-xs">You have full system access.</div>
                        </div>
                    </div>
                    <Announcements />
                    {/* Add Achievements management here if needed */}
                </div>
            );
        default:
            return <div>Unknown Role</div>;
    }
  };

  return (
    <div className="animate-fade-in">
        {/* Common Header */}
        <div className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
             <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-accent font-cairo">
                {t('dash.welcome')} {user.name}
             </h1>
             <p className="text-sm uppercase tracking-widest font-semibold opacity-60 mt-1">{user.role} ACCESS</p>
        </div>
        
        {renderContent()}
    </div>
  );
};
