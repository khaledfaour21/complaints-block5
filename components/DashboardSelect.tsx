
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Role } from '../types';
import { 
  UserGroupIcon, 
  CogIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  TrophyIcon,
  MegaphoneIcon 
} from '@heroicons/react/24/outline';

interface DashboardOption {
  path: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

export const DashboardSelect: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">Please login to access the dashboard.</p>
          <button 
            className="btn btn-primary mt-4" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Define available dashboards based on role hierarchy
  const getAvailableDashboards = (): DashboardOption[] => {
    const dashboards: DashboardOption[] = [];

    // Mukhtar Dashboard - Available to all roles
    dashboards.push({
      path: '/dashboard/muktar',
      title: 'Mukhtar Dashboard',
      description: 'Manage district operations and low-priority complaints',
      icon: UserGroupIcon,
      color: 'from-green-500 to-emerald-600'
    });

    // Admin Dashboard - Available to Manager and Admin
    if (user.role === Role.MANAGER || user.role === Role.ADMIN) {
      dashboards.push({
        path: '/dashboard/admin',
        title: 'Admin Dashboard',
        description: 'Oversee system operations and medium-priority complaints',
        icon: ShieldCheckIcon,
        color: 'from-blue-500 to-indigo-600'
      });
    }

    // Manager Dashboard - Available only to Manager
    if (user.role === Role.MANAGER) {
      dashboards.push({
        path: '/dashboard/manager',
        title: 'Manager Dashboard',
        description: 'Full system management and high-priority oversight',
        icon: CogIcon,
        color: 'from-purple-500 to-violet-600'
      });
    }

    return dashboards;
  };

  // For users with only one dashboard, redirect directly
  if (getAvailableDashboards().length === 1) {
    const singleDashboard = getAvailableDashboards()[0];
    navigate(singleDashboard.path);
    return null;
  }

  const getRoleDescription = () => {
    switch (user.role) {
      case Role.MANAGER:
        return 'Access to all dashboards and full system management';
      case Role.ADMIN:
        return 'Access to admin and mukhtar dashboards';
      case Role.MUKTAR:
        return 'Access to mukhtar dashboard for district operations';
      default:
        return 'Unknown role';
    }
  };

  const availableDashboards = getAvailableDashboards();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent text-3xl font-bold">
            <UserGroupIcon className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold font-cairo text-brand-primary dark:text-brand-accent mb-4">
            Welcome back, {user.name}!
          </h2>
          
          <div className="mb-6">
            <div className="badge badge-lg mb-2">{user.role}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getRoleDescription()}
            </p>
          </div>
        </div>

        {/* Dashboard Selection Grid */}
        {availableDashboards.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDashboards.map((dashboard) => {
              const IconComponent = dashboard.icon;
              return (
                <div
                  key={dashboard.path}
                  className="card bg-white dark:bg-[#1e1e1e] shadow-2xl border border-brand-primary/5 hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => navigate(dashboard.path)}
                >
                  <div className={`card-body bg-gradient-to-br ${dashboard.color} text-white p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className="w-12 h-12" />
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{dashboard.title}</h3>
                    <p className="text-sm opacity-90 mb-4">{dashboard.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Click to access</span>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions for Citizens */}
        {user.role === Role.CITIZEN && (
          <div className="space-y-4 text-center">
            <p className="text-gray-600">
              Citizens can submit complaints without logging in.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => navigate('/submit')}
                className="btn btn-primary text-white"
              >
                Submit Complaint
              </button>
              <button
                onClick={() => navigate('/track')}
                className="btn btn-outline"
              >
                Track Complaints
              </button>
            </div>
          </div>
        )}

        {/* Content Management Links for Admin & Manager */}
        {(user.role === Role.ADMIN || user.role === Role.MANAGER) && (
          <div className="mt-8 card bg-gradient-to-r from-brand-lightBg to-white dark:from-[#1a1a1a] dark:to-[#2a2a2a] shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-brand-primary mb-4">Content Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/achievements')}
                  className="btn btn-outline gap-2"
                >
                  <TrophyIcon className="w-5 h-5" />
                  Community Achievements
                </button>
                <button
                  onClick={() => navigate('/announcements')}
                  className="btn btn-outline gap-2"
                >
                  <MegaphoneIcon className="w-5 h-5" />
                  Community Announcements
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
