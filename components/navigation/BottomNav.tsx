import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, useNotificationStore } from '../../store';
import { HomeIcon, PlusCircleIcon, DocumentMagnifyingGlassIcon, UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { notifications } = useNotificationStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const isActive = (path: string) => location.pathname === path ? 'active text-brand-accent' : '';

  return (
    <div className="btm-nav lg:hidden bg-brand-primary text-brand-lightBg z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
        <Link to="/" className={isActive('/')}>
            <HomeIcon className="w-6 h-6" />
            <span className="btm-nav-label text-xs">Home</span>
        </Link>
        <Link to="/submit" className={isActive('/submit')}>
            <PlusCircleIcon className="w-6 h-6" />
            <span className="btm-nav-label text-xs">Add</span>
        </Link>
        <Link to="/track" className={isActive('/track')}>
            <DocumentMagnifyingGlassIcon className="w-6 h-6" />
            <span className="btm-nav-label text-xs">Track</span>
        </Link>
        <Link to="/notifications" className={isActive('/notifications')}>
            <div className="indicator">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && <span className="indicator-item badge badge-xs badge-error"></span>}
            </div>
            <span className="btm-nav-label text-xs">Alerts</span>
        </Link>
        <Link to={user ? "/dashboard" : "/login"} className={isActive(user ? '/dashboard' : '/login')}>
            <UserCircleIcon className="w-6 h-6" />
            <span className="btm-nav-label text-xs">{user ? 'Dash' : 'Login'}</span>
        </Link>
    </div>
  );
};