import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useLangStore } from '../../store';
import { 
  HomeIcon, PlusCircleIcon, DocumentMagnifyingGlassIcon, TrophyIcon, 
  MegaphoneIcon, ChartBarIcon, ArrowRightOnRectangleIcon, UserIcon, Cog6ToothIcon 
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

  return (
    <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content border-r dark:border-gray-700">
        <li className="mb-6 px-4">
            <h2 className="text-2xl font-bold text-brand-primary font-cairo">Fifth Block</h2>
            <p className="text-xs text-gray-500">Community Portal</p>
        </li>
        
        <li><Link to="/" onClick={onClose}><HomeIcon className="w-5 h-5"/> {t('nav.home')}</Link></li>
        <li><Link to="/submit" onClick={onClose}><PlusCircleIcon className="w-5 h-5"/> {t('home.submit_card')}</Link></li>
        <li><Link to="/track" onClick={onClose}><DocumentMagnifyingGlassIcon className="w-5 h-5"/> {t('nav.track')}</Link></li>
        <li><Link to="/achievements" onClick={onClose}><TrophyIcon className="w-5 h-5"/> {t('nav.achievements')}</Link></li>
        <li><Link to="/announcements" onClick={onClose}><MegaphoneIcon className="w-5 h-5"/> {t('nav.announcements')}</Link></li>
        
        <div className="divider"></div>
        
        {user ? (
            <>
                <li className="menu-title text-brand-accent uppercase text-xs font-bold tracking-wider">
                    {user.role} Panel
                </li>
                <li><Link to="/dashboard" onClick={onClose}><ChartBarIcon className="w-5 h-5"/> {t('nav.dashboard')}</Link></li>
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