import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useLangStore } from '../../store';
import {
  HomeIcon, PlusCircleIcon, DocumentMagnifyingGlassIcon, TrophyIcon,
  MegaphoneIcon, ChartBarIcon, ArrowRightOnRectangleIcon, UserIcon, Cog6ToothIcon,
  ShieldCheckIcon, UserGroupIcon, CogIcon
} from '@heroicons/react/24/outline';

interface Props {
    onClose?: () => void;
}

export const MobileDrawer: React.FC<Props> = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const { t } = useLangStore();

  const handleLogout = () => {
      logout();
      if (onClose) onClose();
  };

  // Role-based navigation items
  const getNavigationItems = (): Array<{path: string, label: string, icon: React.ComponentType<any>, restricted?: boolean}> => {
    const publicItems = [
      { path: '/', label: t('nav.home'), icon: HomeIcon },
      { path: '/submit', label: t('home.submit_card'), icon: PlusCircleIcon },
      { path: '/track', label: t('nav.track'), icon: DocumentMagnifyingGlassIcon },
      { path: '/achievements', label: t('nav.achievements'), icon: TrophyIcon },
      { path: '/announcements', label: t('nav.announcements'), icon: MegaphoneIcon },
    ];

    if (!user) return publicItems;

    const userItems = [...publicItems];

    // Dashboard access based on role hierarchy
    if (user.role === 'MANAGER') {
      // Manager can access all dashboards
      userItems.push(
        { path: '/dashboard/muktar', label: 'Mukhtar Dashboard', icon: UserGroupIcon },
        { path: '/dashboard/admin', label: 'Admin Dashboard', icon: ShieldCheckIcon },
        { path: '/dashboard/manager', label: 'Manager Dashboard', icon: CogIcon }
      );
    } else if (user.role === 'ADMIN') {
      // Admin can access Admin and Mukhtar dashboards
      userItems.push(
        { path: '/dashboard/muktar', label: 'Mukhtar Dashboard', icon: UserGroupIcon },
        { path: '/dashboard/admin', label: 'Admin Dashboard', icon: ShieldCheckIcon }
      );
    } else if (user.role === 'MUKTAR') {
      // Muktar can only access Mukhtar dashboard
      userItems.push(
        { path: '/dashboard/muktar', label: 'Mukhtar Dashboard', icon: UserGroupIcon }
      );
    }

    // Content management for Admin & Manager only
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      userItems.push(
        { path: '/content', label: 'Ads & Achievements Management', icon: ChartBarIcon }
      );
    }

    return userItems;
  };

  return (
    <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content border-r dark:border-gray-700">
        <li className="mb-6 px-4">
            <h2 className="text-2xl font-bold text-brand-primary font-cairo">Fifth Block</h2>
            <p className="text-xs text-gray-500">Community Portal</p>
        </li>

        {getNavigationItems().map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.path}>
              <Link to={item.path} onClick={onClose}>
                <IconComponent className="w-5 h-5"/> {item.label}
              </Link>
            </li>
          );
        })}
        
        <div className="divider"></div>

        {user ? (
            <>
                <li className="menu-title text-brand-accent uppercase text-xs font-bold tracking-wider">
                    Account
                </li>
                <li><Link to="/profile" onClick={onClose}><UserIcon className="w-5 h-5"/> {t('nav.profile')}</Link></li>
                <li><Link to="/settings" onClick={onClose}><Cog6ToothIcon className="w-5 h-5"/> {t('nav.settings')}</Link></li>
                <li onClick={handleLogout} className="mt-4"><a className="text-error bg-red-50 dark:bg-red-900/20"><ArrowRightOnRectangleIcon className="w-5 h-5"/> {t('nav.logout')}</a></li>
            </>
        ) : (
            <li><Link to="/login" onClick={onClose} className="btn btn-outline btn-sm btn-block text-center justify-center mt-4">{t('nav.login')}</Link></li>
        )}
    </ul>
  );
};