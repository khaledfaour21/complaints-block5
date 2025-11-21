import React, { ReactNode, useEffect } from 'react';
import { useThemeStore, useLangStore, useAuthStore, useNotificationStore } from '../store';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  SunIcon, MoonIcon, Bars3Icon, LanguageIcon, BellIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { ToastContainer } from './shared/Toast';
import { BottomNav } from './navigation/BottomNav';
import { MobileDrawer } from './navigation/MobileDrawer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { lang, setLang, t } = useLangStore();
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.style.fontFamily = lang === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif';
  }, [lang]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path ? 'text-brand-accent font-bold' : '';

  return (
    <div className="drawer min-h-screen bg-brand-lightBg dark:bg-brand-darkBg text-brand-secondary dark:text-brand-lightBg">
      <input id="main-drawer" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen">
        <ToastContainer />

        {/* Navbar */}
        <div className="w-full navbar bg-brand-primary text-brand-lightBg shadow-md sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
          <div className="flex-none lg:hidden">
            <label htmlFor="main-drawer" className="btn btn-square btn-ghost text-brand-accent">
              <Bars3Icon className="w-6 h-6" />
            </label>
          </div>
          <div className="flex-1 px-2 mx-2">
             <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center font-bold text-brand-secondary group-hover:rotate-12 transition-transform">5</div>
                <span className="text-lg font-bold font-cairo">Fifth Block</span>
             </Link>
          </div>
          <div className="flex-none hidden lg:block">
            <ul className="menu menu-horizontal px-1 font-semibold gap-2">
              <li><Link to="/" className={isActive('/')}>{t('nav.home')}</Link></li>
              <li><Link to="/submit" className={isActive('/submit')}>{t('home.submit_card')}</Link></li>
              <li><Link to="/track" className={isActive('/track')}>{t('nav.track')}</Link></li>
              <li><Link to="/achievements" className={isActive('/achievements')}>{t('nav.achievements')}</Link></li>
              <li><Link to="/announcements" className={isActive('/announcements')}>{t('nav.announcements')}</Link></li>
              {user && <li><Link to="/dashboard" className="bg-brand-accent/20 text-brand-accent border border-brand-accent/50 hover:bg-brand-accent/30">{t('nav.dashboard')}</Link></li>}
            </ul>
          </div>
          <div className="flex-none gap-2">
            <button className="btn btn-ghost btn-circle hover:bg-white/10" onClick={toggleTheme}>
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            <button className="btn btn-ghost btn-circle hover:bg-white/10" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
                <LanguageIcon className="w-5 h-5" />
                <span className="text-xs uppercase font-bold absolute bottom-1">{lang}</span>
            </button>
            
            <Link to="/notifications" className="btn btn-ghost btn-circle hover:bg-white/10 relative">
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 badge badge-xs badge-error rounded-full w-2 h-2 p-0"></span>}
            </Link>

            {user ? (
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder border-2 border-brand-accent">
                        <div className="bg-brand-secondary text-brand-lightBg rounded-full w-10">
                            <span className="text-xs">{user.name.substring(0,2).toUpperCase()}</span>
                        </div>
                    </div>
                    <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 text-brand-secondary border border-gray-100">
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/profile">Profile</Link></li>
                        <li><Link to="/settings">Settings</Link></li>
                        <li onClick={handleLogout}><a className="text-error">Logout</a></li>
                    </ul>
                </div>
            ) : (
                <Link to="/login" className="btn btn-sm btn-outline border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary hidden sm:inline-flex">{t('nav.login')}</Link>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
            {children}
        </main>

        <BottomNav />
      </div> 
      
      {/* Sidebar Drawer */}
      <div className="drawer-side z-50">
        <label htmlFor="main-drawer" className="drawer-overlay"></label>
        <MobileDrawer />
      </div>
    </div>
  );
};