import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Role } from '../../types';
import {
  HomeIcon, PlusCircleIcon, DocumentMagnifyingGlassIcon, TrophyIcon,
  MegaphoneIcon, ChartBarIcon, UserGroupIcon, CogIcon,
  ShieldCheckIcon, ArrowRightOnRectangleIcon, UserIcon, Cog6ToothIcon,
  BellIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  roles: Role[];
  badge?: string;
}

export const RoleBasedNavigation: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // Define all possible navigation items with role restrictions
  const allNavigationItems: NavigationItem[] = [
    // Public items (no role restriction)
    {
      path: '/',
      label: 'Home',
      icon: HomeIcon,
      roles: [Role.CITIZEN, Role.MUKTAR, Role.ADMIN, Role.MANAGER]
    },
    {
      path: '/submit',
      label: 'Submit Complaint',
      icon: PlusCircleIcon,
      roles: [Role.CITIZEN, Role.MUKTAR, Role.ADMIN, Role.MANAGER]
    },
    {
      path: '/track',
      label: 'Track Complaints',
      icon: DocumentMagnifyingGlassIcon,
      roles: [Role.CITIZEN, Role.MUKTAR, Role.ADMIN, Role.MANAGER]
    },

    // Role-specific dashboard access - Following hierarchy
    // Mukhtar Dashboard - Available to Manager, Admin, and Mukhtar
    {
      path: '/dashboard/muktar',
      label: 'Mukhtar Dashboard',
      icon: UserGroupIcon,
      roles: [Role.MANAGER, Role.ADMIN, Role.MUKTAR]
    },
    // Admin Dashboard - Available to Manager and Admin only
    {
      path: '/dashboard/admin',
      label: 'Admin Dashboard',
      icon: ShieldCheckIcon,
      roles: [Role.MANAGER, Role.ADMIN]
    },
    // Manager Dashboard - Available to Manager only
    {
      path: '/dashboard/manager',
      label: 'Manager Dashboard',
      icon: CogIcon,
      roles: [Role.MANAGER]
    },

    // Content management - Available to all roles
    {
      path: '/achievements',
      label: 'Community Achievements',
      icon: TrophyIcon,
      roles: [Role.CITIZEN, Role.MUKTAR, Role.ADMIN, Role.MANAGER]
    },
    {
      path: '/announcements',
      label: 'Community Announcements',
      icon: MegaphoneIcon,
      roles: [Role.CITIZEN, Role.MUKTAR, Role.ADMIN, Role.MANAGER]
    },
    // Ads & Achievements Management - Admin & Manager only
    {
      path: '/content',
      label: 'Ads & Achievements Management',
      icon: ChartBarIcon,
      roles: [Role.ADMIN, Role.MANAGER],
      badge: 'Admin'
    },

    // Optional notification center - For dashboard users only
    {
      path: '/notifications',
      label: 'Notifications',
      icon: BellIcon,
      roles: [Role.MUKTAR, Role.ADMIN, Role.MANAGER]
    }
  ];

  // Filter navigation items based on user role
  const getFilteredNavigationItems = (): NavigationItem[] => {
    if (!user) {
      // Public access - show only public items
      return allNavigationItems.filter(item => 
        item.roles.includes(Role.CITIZEN) || 
        item.roles.length === 1 && item.roles.includes(Role.CITIZEN)
      );
    }

    return allNavigationItems.filter(item => item.roles.includes(user.role));
  };

  const navigationItems = getFilteredNavigationItems();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const getRoleBadgeColor = (role: Role): string => {
    switch (role) {
      case Role.MANAGER: return 'badge-primary';
      case Role.ADMIN: return 'badge-secondary';
      case Role.MUKTAR: return 'badge-accent';
      default: return 'badge-ghost';
    }
  };

  return (
    <div className="bg-base-100 border-r border-gray-200 dark:border-gray-700 w-80 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-brand-primary font-cairo">Fifth Block</h2>
        <p className="text-sm text-gray-500">Community Portal</p>
        {user && (
          <div className="mt-3 flex items-center gap-2">
            <div className="avatar placeholder">
              <div className="bg-brand-primary text-white rounded-full w-8">
                <span className="text-xs">{user.name.charAt(0)}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <div className="flex items-center gap-2">
                <span className={`badge badge-xs ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
                {user.district && (
                  <span className="text-xs text-gray-500">
                    {user.district}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="menu-title text-brand-accent uppercase text-xs font-bold tracking-wider mb-3">
          Navigation
        </div>
        
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-brand-lightBg dark:hover:bg-gray-800'
              }`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="badge badge-xs badge-warning">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Dashboard Quick Access (if user has dashboard access) */}
      {user && user.role !== Role.CITIZEN && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="menu-title text-brand-accent uppercase text-xs font-bold tracking-wider mb-3">
            Dashboard Access
          </div>
          
          {/* Manager - Can access all dashboards */}
          {user.role === Role.MANAGER && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 mb-2">Full Access</div>
              <Link
                to="/dashboard/manager"
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                  isActive('/dashboard/manager') ? 'text-brand-primary font-bold' : 'text-gray-600'
                }`}
              >
                <CogIcon className="w-4 h-4" />
                Manager Dashboard
              </Link>
              <Link
                to="/dashboard/admin"
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                  isActive('/dashboard/admin') ? 'text-brand-primary font-bold' : 'text-gray-600'
                }`}
              >
                <ShieldCheckIcon className="w-4 h-4" />
                Admin Dashboard
              </Link>
              <Link
                to="/dashboard/muktar"
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                  isActive('/dashboard/muktar') ? 'text-brand-primary font-bold' : 'text-gray-600'
                }`}
              >
                <UserGroupIcon className="w-4 h-4" />
                Mukhtar Dashboard
              </Link>
            </div>
          )}

          {/* Admin - Can access Admin and Mukhtar dashboards */}
          {user.role === Role.ADMIN && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 mb-2">Limited Access</div>
              <Link
                to="/dashboard/admin"
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                  isActive('/dashboard/admin') ? 'text-brand-primary font-bold' : 'text-gray-600'
                }`}
              >
                <ShieldCheckIcon className="w-4 h-4" />
                Admin Dashboard
              </Link>
              <Link
                to="/dashboard/muktar"
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                  isActive('/dashboard/muktar') ? 'text-brand-primary font-bold' : 'text-gray-600'
                }`}
              >
                <UserGroupIcon className="w-4 h-4" />
                Mukhtar Dashboard
              </Link>
            </div>
          )}

          {/* Muktar - Can only access Mukhtar dashboard */}
          {user.role === Role.MUKTAR && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 mb-2">District Operations</div>
              <Link
                to="/dashboard/muktar"
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                  isActive('/dashboard/muktar') ? 'text-brand-primary font-bold' : 'text-gray-600'
                }`}
              >
                <UserGroupIcon className="w-4 h-4" />
                Mukhtar Dashboard
              </Link>
              <div className="text-xs text-gray-400 mt-2 px-2">
                Restricted access - District operations only
              </div>
            </div>
          )}

          {/* Ads & Achievements Management - Admin & Manager only */}
          {(user.role === Role.ADMIN || user.role === Role.MANAGER) && (
            <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 mb-2">Content Management</div>
              <Link
                to="/content"
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                  isActive('/content') ? 'text-brand-primary font-bold' : 'text-gray-600'
                }`}
              >
                <ChartBarIcon className="w-4 h-4" />
                Ads & Achievements
                <span className="badge badge-xs badge-primary ml-auto">Admin</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Account Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {user ? (
          <div className="space-y-1">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-2 py-1 rounded text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <UserIcon className="w-4 h-4" />
              Profile
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-2 py-1 rounded text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1 rounded text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="btn btn-outline btn-sm w-full justify-center"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};