import React from 'react';
import { useLangStore } from '../../store';
import { CloudIcon } from '@heroicons/react/24/outline';

export const OfflinePage: React.FC = () => {
  const { t } = useLangStore();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-lightBg dark:bg-brand-darkBg p-4 text-center">
      <CloudIcon className="w-24 h-24 text-gray-400 mb-6" />
      <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-accent mb-2 font-cairo">{t('pwa.offline')}</h1>
      <p className="text-gray-500">{t('pwa.offline_msg')}</p>
      <button onClick={() => window.location.reload()} className="btn btn-primary text-white mt-8">
        Retry
      </button>
    </div>
  );
};