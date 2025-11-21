import React from 'react';
import { useLangStore, useThemeStore } from '../../store';
import { Cog6ToothIcon, MoonIcon, SunIcon, LanguageIcon } from '@heroicons/react/24/outline';

export const Settings: React.FC = () => {
  const { t, lang, setLang } = useLangStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold font-cairo text-brand-primary dark:text-brand-accent flex items-center gap-2">
        <Cog6ToothIcon className="w-8 h-8" /> {t('user.settings')}
      </h1>

      <div className="card bg-base-100 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="card-body">
            {/* Language */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><LanguageIcon className="w-6 h-6" /></div>
                    <div>
                        <div className="font-bold">Language</div>
                        <div className="text-xs text-gray-500">Select your preferred language</div>
                    </div>
                </div>
                <div className="join">
                    <button onClick={() => setLang('en')} className={`btn join-item ${lang === 'en' ? 'btn-primary text-white' : 'btn-ghost'}`}>English</button>
                    <button onClick={() => setLang('ar')} className={`btn join-item ${lang === 'ar' ? 'btn-primary text-white' : 'btn-ghost'}`}>العربية</button>
                </div>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        {theme === 'light' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="font-bold">Theme</div>
                        <div className="text-xs text-gray-500">Toggle dark/light mode</div>
                    </div>
                </div>
                <input type="checkbox" className="toggle toggle-primary" checked={theme === 'dark'} onChange={toggleTheme} />
            </div>
        </div>
      </div>
    </div>
  );
};